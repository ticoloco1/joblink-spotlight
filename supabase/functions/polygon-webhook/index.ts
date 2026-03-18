import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-alchemy-signature",
};

// USDC contract addresses on Polygon
const USDC_CONTRACTS = [
  "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359", // Native USDC
  "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // USDC.e (bridged)
];

async function verifyAlchemySignature(body: string, signature: string, signingKey: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(signingKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const hex = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex === signature;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    const signingKey = Deno.env.get("ALCHEMY_SIGNING_KEY");
    if (!signingKey) throw new Error("ALCHEMY_SIGNING_KEY not configured");

    const receivingWallet = Deno.env.get("POLYGON_RECEIVING_WALLET")?.toLowerCase();
    if (!receivingWallet) throw new Error("POLYGON_RECEIVING_WALLET not configured");

    const rawBody = await req.text();
    const alchemySignature = req.headers.get("x-alchemy-signature") ?? "";

    // Verify signature from Alchemy
    const isValid = await verifyAlchemySignature(rawBody, alchemySignature, signingKey);
    if (!isValid) {
      console.error("Invalid Alchemy signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const payload = JSON.parse(rawBody);

    if (payload.type !== "ADDRESS_ACTIVITY") {
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: "Not ADDRESS_ACTIVITY" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const activities = payload.event?.activity ?? [];
    const results: any[] = [];

    for (const activity of activities) {
      const toAddress = (activity.toAddress ?? "").toLowerCase();
      const fromAddress = (activity.fromAddress ?? "").toLowerCase();
      const txHash = activity.hash;

      // Only process transfers TO our receiving wallet
      if (toAddress !== receivingWallet) continue;

      // Check if tx already processed
      const { data: existing } = await serviceClient
        .from("blockchain_payments")
        .select("id")
        .eq("tx_hash", txHash)
        .maybeSingle();

      if (existing) {
        results.push({ tx: txHash, status: "already_processed" });
        continue;
      }

      let amountUsd = 0;
      let token = "UNKNOWN";
      let amountRaw = "0";

      // Check for USDC (ERC-20 transfer)
      if (activity.category === "token" || activity.category === "erc20") {
        const contractAddr = (activity.rawContract?.address ?? "").toLowerCase();
        if (USDC_CONTRACTS.includes(contractAddr)) {
          token = "USDC";
          amountUsd = Number(activity.value ?? 0);
          amountRaw = activity.rawContract?.rawValue ?? String(amountUsd);
        }
      }
      // Check for native MATIC transfer
      else if (activity.category === "external" && activity.asset === "MATIC") {
        token = "MATIC";
        const maticAmount = Number(activity.value ?? 0);
        amountRaw = activity.rawContract?.rawValue ?? String(maticAmount);

        // Fetch current MATIC price from CoinGecko
        try {
          const priceResp = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd",
          );
          const priceData = await priceResp.json();
          const maticPrice = priceData?.["matic-network"]?.usd ?? 0;
          amountUsd = maticAmount * maticPrice;
        } catch (e) {
          console.error("Failed to fetch MATIC price, skipping:", e);
          continue;
        }
      } else {
        continue; // Unknown token, skip
      }

      if (amountUsd <= 0) continue;

      // Calculate credits (1 USDC = 1 credit, floored)
      const creditsToAdd = Math.floor(amountUsd);
      if (creditsToAdd <= 0) continue;

      // Find user by wallet address (from_address)
      const { data: profileData } = await serviceClient
        .from("profiles")
        .select("id, user_id, credits")
        .eq("wallet_address", fromAddress)
        .maybeSingle();

      if (!profileData) {
        console.warn(`No profile found for wallet ${fromAddress}, tx ${txHash}`);
        // Still record the payment for manual reconciliation
        await serviceClient.from("blockchain_payments").insert({
          tx_hash: txHash,
          from_address: fromAddress,
          to_address: toAddress,
          token,
          amount_raw: amountRaw,
          amount_usd: amountUsd,
          credits_added: 0,
          network: "polygon",
          status: "unmatched",
        });
        results.push({ tx: txHash, status: "unmatched_wallet" });
        continue;
      }

      // Add credits to user profile
      const newBalance = profileData.credits + creditsToAdd;

      await serviceClient
        .from("profiles")
        .update({ credits: newBalance, updated_at: new Date().toISOString() })
        .eq("id", profileData.id);

      // Record the blockchain payment
      await serviceClient.from("blockchain_payments").insert({
        user_id: profileData.user_id,
        profile_id: profileData.id,
        tx_hash: txHash,
        from_address: fromAddress,
        to_address: toAddress,
        token,
        amount_raw: amountRaw,
        amount_usd: amountUsd,
        credits_added: creditsToAdd,
        network: "polygon",
        status: "confirmed",
      });

      // Record credit transaction
      await serviceClient.from("credit_transactions").insert({
        user_id: profileData.user_id,
        type: "blockchain_deposit",
        amount: creditsToAdd,
        balance_after: newBalance,
        description: `Depósito via ${token} na Polygon (tx: ${txHash.slice(0, 10)}...)`,
        related_profile_id: profileData.id,
      });

      results.push({ tx: txHash, status: "credited", credits: creditsToAdd, token });
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Polygon webhook error:", message);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
