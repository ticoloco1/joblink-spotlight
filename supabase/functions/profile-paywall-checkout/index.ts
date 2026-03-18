import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    if (userError || !userData.user?.email) throw new Error("Not authenticated");
    const user = userData.user;

    const { profile_id, interval, amount_cents } = await req.json();
    if (!profile_id) throw new Error("profile_id is required");
    const payInterval = interval === "daily" ? "daily" : "monthly";
    const cents = Number(amount_cents);
    if (!Number.isFinite(cents) || cents <= 0) throw new Error("amount_cents inválido");

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, slug, name, paywall_enabled, paywall_mode")
      .eq("id", profile_id)
      .maybeSingle();
    if (!profile) throw new Error("Profile not found");
    if (!profile.paywall_enabled || profile.paywall_mode !== "full") {
      throw new Error("Paywall não está ativo para este perfil");
    }

    // já tem acesso ativo?
    const { data: existing } = await supabase
      .from("profile_paywall_access")
      .select("id, expires_at, status")
      .eq("profile_id", profile_id)
      .eq("subscriber_id", user.id)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ already_active: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data.length ? customers.data[0].id : undefined;

    const origin = req.headers.get("origin") || "https://jobinlink.com";
    const mode = payInterval === "monthly" ? "subscription" : "payment";
    const productName = `Acesso ao perfil: /${profile.slug}`;

    const lineItem =
      payInterval === "monthly"
        ? {
            price_data: {
              currency: "usd",
              product_data: { name: productName },
              unit_amount: cents,
              recurring: { interval: "month" as const, interval_count: 1 },
            },
            quantity: 1,
          }
        : {
            price_data: {
              currency: "usd",
              product_data: { name: productName },
              unit_amount: cents,
            },
            quantity: 1,
          };

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [lineItem],
      mode,
      success_url: `${origin}/u/${profile.slug}?paywall=success`,
      cancel_url: `${origin}/u/${profile.slug}?paywall=cancel`,
      metadata: {
        profile_id,
        subscriber_id: user.id,
        interval: payInterval,
        amount_cents: String(cents),
      },
    });

    const expiresAt = new Date(Date.now() + (payInterval === "daily" ? 24 : 30) * 60 * 60 * 1000).toISOString();
    await supabase.from("profile_paywall_access").insert({
      profile_id,
      subscriber_id: user.id,
      interval: payInterval,
      amount_cents: cents,
      status: "active",
      expires_at: expiresAt,
      stripe_checkout_session_id: session.id,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

