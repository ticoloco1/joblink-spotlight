// Finaliza compra após pagamento Stripe — transferência de perfil + comissão 20%
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const COMMISSION_PERCENT = 0.2; // 20%

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

    const { session_id } = await req.json();
    if (!session_id) throw new Error("session_id obrigatório");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ success: false, error: "Pagamento não confirmado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const marketplaceId = session.metadata?.marketplace_id;
    const buyerId = session.metadata?.buyer_id;
    const profileId = session.metadata?.profile_id;

    if (!marketplaceId || buyerId !== user.id) throw new Error("Sessão inválida");

    const { data: item } = await supabase
      .from("slug_marketplace")
      .select("id, slug, price_cents, owner_id, profile_id, status")
      .eq("id", marketplaceId)
      .single();

    if (!item || item.status !== "active") {
      return new Response(JSON.stringify({ success: true, message: "Já processado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const price = item.price_cents / 100;
    const commission = Math.round(item.price_cents * COMMISSION_PERCENT);
    const sellerAmount = item.price_cents - commission;

    // Transferir perfil para o comprador (quem possui o slug passa a ser o buyer)
    if (item.profile_id) {
      await supabase
        .from("profiles")
        .update({ user_id: buyerId } as any)
        .eq("id", item.profile_id);
    } else {
      // Se não tinha profile_id, atualizar qualquer perfil com esse slug
      await supabase
        .from("profiles")
        .update({ user_id: buyerId } as any)
        .eq("slug", item.slug)
        .eq("user_id", item.owner_id);
    }

    await supabase
      .from("slug_marketplace")
      .update({ status: "sold" })
      .eq("id", marketplaceId);

    return new Response(JSON.stringify({
      success: true,
      message: "Slug adquirido!",
      commission_cents: commission,
      seller_amount_cents: sellerAmount,
      price_usd: price,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
