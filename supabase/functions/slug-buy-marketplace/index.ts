// Compra de slug no marketplace (preço fixo) — cria Stripe Checkout; comissão 20% aplicada no complete
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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

    const { marketplace_id } = await req.json();
    if (!marketplace_id) throw new Error("marketplace_id obrigatório");

    const { data: item, error: itemErr } = await supabase
      .from("slug_marketplace")
      .select("id, slug, price_cents, type, status, owner_id, profile_id")
      .eq("id", marketplace_id)
      .single();

    if (itemErr || !item) throw new Error("Anúncio não encontrado");
    if (item.status !== "active") throw new Error("Indisponível");
    if (item.type !== "fixed") throw new Error("Use leilão para dar lance");
    if (item.owner_id === user.id) throw new Error("Você não pode comprar seu próprio slug");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://jobinlink.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email ?? undefined,
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `Slug: /${item.slug}`,
            description: `Compra de slug jobinlink.com/${item.slug} (marketplace)`,
          },
          unit_amount: item.price_cents,
        },
        quantity: 1,
      }],
      success_url: `${origin}/marketplace?session_id={CHECKOUT_SESSION_ID}&buy=success`,
      cancel_url: `${origin}/marketplace`,
      metadata: {
        marketplace_id: item.id,
        buyer_id: user.id,
        slug: item.slug,
        profile_id: item.profile_id ?? "",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
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
