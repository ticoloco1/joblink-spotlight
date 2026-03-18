/**
 * Payout autônomo: converte créditos em USDC (Polygon) e envia para wallet_address do perfil.
 * Deve ser chamada por CRON (ex.: diário) com o header Authorization: Bearer <CRON_SECRET>.
 * Não depende de nenhum operador humano — o sistema continua pagando mesmo se o dono do site não estiver.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { ethers } from "https://esm.sh/ethers@6.13.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)",
];

const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const cronSecret = Deno.env.get("CRON_SECRET");
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!cronSecret || token !== cronSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const rpcUrl = Deno.env.get("POLYGON_RPC_URL");
  const usdcContract = (Deno.env.get("USDC_CONTRACT") || "").toLowerCase();
  const privateKey = Deno.env.get("PLATFORM_PRIVATE_KEY");

  if (!rpcUrl || !usdcContract || !privateKey) {
    return new Response(
      JSON.stringify({
        error: "Missing POLYGON_RPC_URL, USDC_CONTRACT or PLATFORM_PRIVATE_KEY",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const { data: settings } = await supabase
      .from("platform_settings")
      .select("key, value")
      .in("key", ["payout_enabled", "payout_minimum_cents"]);
    const settingsMap = Object.fromEntries((settings ?? []).map((s: { key: string; value: string }) => [s.key, s.value]));
    if (settingsMap.payout_enabled?.toLowerCase() !== "true") {
      return new Response(
        JSON.stringify({ ok: true, message: "Payouts disabled", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const minCents = Math.max(100, parseInt(settingsMap.payout_minimum_cents ?? "500", 10) || 500);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, user_id, credits, wallet_address")
      .gte("credits", minCents)
      .not("wallet_address", "is", null);

    const eligible = (profiles ?? []).filter(
      (p: { wallet_address: string | null; credits: number }) =>
        p.wallet_address && WALLET_REGEX.test(String(p.wallet_address).trim()) && (p.credits ?? 0) >= minCents,
    ) as { id: string; user_id: string; credits: number; wallet_address: string }[];

    if (eligible.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, processed: 0, message: "No eligible payouts" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const usdc = new ethers.Contract(usdcContract, ERC20_ABI, wallet);
    const decimals = await usdc.decimals();
    const results: { profile_id: string; amount_cents: number; status: string; tx_hash?: string; error?: string }[] = [];

    for (const p of eligible) {
      const amountCents = p.credits;
      const toAddress = String(p.wallet_address).trim().toLowerCase();
      const amountRaw = BigInt(amountCents) * BigInt(10 ** (Number(decimals) - 2));

      const { data: reserve } = await supabase.rpc("reserve_credits_for_payout", {
        p_profile_id: p.id,
        p_amount_cents: amountCents,
      } as any);
      const reserved = Array.isArray(reserve) ? reserve[0] : reserve;
      if (!reserved?.ok) {
        results.push({ profile_id: p.id, amount_cents: amountCents, status: "skipped" });
        continue;
      }

      const payoutRow = {
        profile_id: p.id,
        user_id: p.user_id,
        amount_cents: amountCents,
        to_address: toAddress,
        network: "polygon",
        status: "pending",
      };

      const { data: inserted } = await supabase.from("usdc_payouts").insert(payoutRow).select("id").single();
      const payoutId = inserted?.id;

      try {
        const tx = await usdc.transfer(toAddress, amountRaw);
        const receipt = await tx.wait();
        const txHash = receipt?.hash ?? tx.hash;

        await supabase
          .from("usdc_payouts")
          .update({ status: "completed", tx_hash: txHash, completed_at: new Date().toISOString() })
          .eq("id", payoutId);

        await supabase.from("credit_transactions").insert({
          user_id: p.user_id,
          type: "payout_usdc",
          amount: -amountCents,
          balance_after: 0,
          amount_cents: -amountCents,
          balance_after_cents: 0,
          description: `Payout USDC (${(amountCents / 100).toFixed(2)} USD) → ${toAddress.slice(0, 10)}...`,
          related_profile_id: p.id,
        } as any);

        results.push({ profile_id: p.id, amount_cents: amountCents, status: "completed", tx_hash: txHash });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        await supabase.rpc("refund_credits_for_payout", {
          p_profile_id: p.id,
          p_amount_cents: amountCents,
        } as any);
        await supabase
          .from("usdc_payouts")
          .update({ status: "failed", error_message: msg.slice(0, 500) })
          .eq("id", payoutId);
        results.push({ profile_id: p.id, amount_cents: amountCents, status: "failed", error: msg.slice(0, 200) });
      }
    }

    const completed = results.filter((r) => r.status === "completed").length;
    return new Response(
      JSON.stringify({
        ok: true,
        processed: results.length,
        completed,
        failed: results.length - completed,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
