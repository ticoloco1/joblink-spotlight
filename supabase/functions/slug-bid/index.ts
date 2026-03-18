// Dar lance em slug em leilão
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user?.id) throw new Error("Não autorizado");

    const { marketplace_id, amount } = await req.json();
    if (!marketplace_id || amount == null) throw new Error("marketplace_id e amount obrigatórios");
    const amountCents = Math.round(Number(amount) * 100);
    if (amountCents <= 0) throw new Error("Lance deve ser maior que zero");

    const { data: item } = await supabase
      .from("slug_marketplace")
      .select("id, type, status, owner_id, price_cents, expires_at")
      .eq("id", marketplace_id)
      .single();

    if (!item) throw new Error("Leilão não encontrado");
    if (item.status !== "active") throw new Error("Leilão encerrado");
    if (item.type !== "auction") throw new Error("Não é leilão");
    if (item.owner_id === user.id) throw new Error("Você não pode dar lance no próprio slug");
    if (item.expires_at && new Date(item.expires_at) < new Date()) throw new Error("Leilão expirado");

    const { data: highest } = await supabase
      .from("slug_bids")
      .select("bid_amount_cents")
      .eq("slug_marketplace_id", marketplace_id)
      .order("bid_amount_cents", { ascending: false })
      .limit(1)
      .maybeSingle();

    const minBid = highest?.bid_amount_cents ?? item.price_cents;
    if (amountCents <= minBid) {
      throw new Error(`Lance muito baixo. Mínimo: ${(minBid / 100).toFixed(2)} (ou maior que o último lance)`);
    }

    await supabase.from("slug_bids").insert({
      slug_marketplace_id: marketplace_id,
      user_id: user.id,
      bid_amount_cents: amountCents,
    });

    return new Response(JSON.stringify({ success: true, amount_cents: amountCents }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
