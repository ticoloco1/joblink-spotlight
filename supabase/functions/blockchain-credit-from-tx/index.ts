import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { ethers } from "https://esm.sh/ethers@6.13.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function decimals() view returns (uint8)",
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw userError;
    const user = userData.user;
    if (!user?.id) throw new Error("Not authenticated");

    const { tx_hash, network } = await req.json();
    if (!tx_hash) throw new Error("tx_hash is required");

    const rpcUrl = Deno.env.get("POLYGON_RPC_URL");
    const usdcContract = (Deno.env.get("USDC_CONTRACT") || "").toLowerCase();
    const platformWallet = (Deno.env.get("PLATFORM_WALLET") || "").toLowerCase();
    if (!rpcUrl) throw new Error("POLYGON_RPC_URL is not set");
    if (!usdcContract) throw new Error("USDC_CONTRACT is not set");
    if (!platformWallet) throw new Error("PLATFORM_WALLET is not set");

    // evita crédito duplicado
    const { data: existing } = await supabase
      .from("blockchain_payments")
      .select("id")
      .eq("tx_hash", tx_hash)
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ ok: true, already_credited: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // taxa de conversão (1 USDC -> X créditos)
    const { data: settings } = await supabase
      .from("platform_settings")
      .select("key, value")
      .eq("category", "credits");
    const creditsPerUsdc = (() => {
      const s = (settings || []).find((x: any) => x.key === "credits_per_usdc");
      const v = s ? parseInt(s.value, 10) : 100;
      return Number.isFinite(v) && v > 0 ? v : 100;
    })();

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const receipt = await provider.getTransactionReceipt(tx_hash);
    if (!receipt) throw new Error("Transação não encontrada (ainda pendente?)");
    if (receipt.status !== 1) throw new Error("Transação falhou");

    const iface = new ethers.Interface(ERC20_ABI);

    let totalUsdc = 0n;
    let fromAddress: string | null = null;

    for (const log of receipt.logs) {
      if ((log.address || "").toLowerCase() !== usdcContract) continue;
      try {
        const parsed = iface.parseLog({ topics: log.topics as any, data: log.data as any });
        if (parsed?.name !== "Transfer") continue;
        const from = String(parsed.args.from).toLowerCase();
        const to = String(parsed.args.to).toLowerCase();
        const value = BigInt(parsed.args.value.toString());
        if (to !== platformWallet) continue;
        totalUsdc += value;
        fromAddress = fromAddress ?? from;
      } catch {
        // ignore
      }
    }

    if (totalUsdc === 0n) throw new Error("Nenhuma transferência USDC para a carteira da plataforma foi detectada");

    // USDC decimals
    const usdc = new ethers.Contract(usdcContract, ERC20_ABI, provider);
    const decimals: number = await usdc.decimals();
    const amountUsd = Number(ethers.formatUnits(totalUsdc, decimals));
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) throw new Error("Valor inválido");

    const creditsAdded = Math.floor(amountUsd * creditsPerUsdc);
    if (creditsAdded <= 0) throw new Error("Créditos calculados inválidos");

    // carrega perfil e atualiza saldo
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, credits, wallet_address")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!profile) throw new Error("Profile not found");

    const newBalance = (profile.credits || 0) + creditsAdded;

    await supabase.from("profiles").update({ credits: newBalance } as any).eq("id", profile.id);

    // auditoria
    await supabase.from("blockchain_payments").insert({
      user_id: user.id,
      profile_id: profile.id,
      tx_hash,
      from_address: fromAddress || "unknown",
      to_address: platformWallet,
      token: "USDC",
      amount_raw: totalUsdc.toString(),
      amount_usd: amountUsd,
      credits_added: creditsAdded,
      network: network || "polygon",
      status: "confirmed",
    } as any);

    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      type: "blockchain_topup",
      amount: creditsAdded,
      balance_after: newBalance,
      amount_cents: creditsAdded,
      balance_after_cents: newBalance,
      description: `Topup USDC (${amountUsd.toFixed(2)})`,
      related_profile_id: profile.id,
    } as any);

    return new Response(JSON.stringify({ ok: true, amount_usd: amountUsd, credits_added: creditsAdded, balance_after: newBalance }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

