import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const body = await req.json().catch(() => ({}));
    const { profile_id, profile_slug, use_credits, get_price } = body;

    // Retornar apenas o preço em créditos (público, para a UI)
    if (get_price) {
      const { data: row } = await supabaseAdmin
        .from("platform_settings")
        .select("value")
        .eq("key", "contact_unlock_price")
        .maybeSingle();
      const price_cents = row?.value ? parseInt(String(row.value), 10) : 500;
      return new Response(
        JSON.stringify({ price_cents }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile_id) throw new Error("profile_id is required");
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    // Desbloqueio com créditos (RPC como o usuário autenticado)
    if (use_credits) {
      const authClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );
      const { data: rpcData, error: rpcError } = await authClient.rpc("unlock_contact_with_credits", {
        p_profile_id: profile_id,
      });
      if (rpcError) {
        return new Response(
          JSON.stringify({ error: rpcError.message, error_code: "RPC_ERROR" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      const result = rpcData as { ok?: boolean; already_unlocked?: boolean; unlocked?: boolean; error_code?: string; required?: number; available?: number; error?: string };
      if (result.already_unlocked) {
        return new Response(JSON.stringify({ already_unlocked: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (result.ok && result.unlocked) {
        return new Response(JSON.stringify({ already_unlocked: false, unlocked: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (result.error_code === "INSUFFICIENT_CREDITS") {
        return new Response(
          JSON.stringify({
            error: "Saldo insuficiente",
            error_code: "INSUFFICIENT_CREDITS",
            required: result.required,
            available: result.available,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 }
        );
      }
      return new Response(
        JSON.stringify({ error: result.error || "Unlock failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if already unlocked (fluxo Stripe)
    const { data: existing } = await supabaseAdmin
      .from("contact_unlocks")
      .select("id")
      .eq("company_user_id", user.id)
      .eq("profile_id", profile_id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ already_unlocked: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: "price_1T8pD6AElvCNQFKWdyUU3nYT",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/u/${profile_slug}?unlocked=true`,
      cancel_url: `${origin}/u/${profile_slug}`,
      metadata: {
        company_user_id: user.id,
        profile_id: profile_id,
        amount_cents: "2000",
        profile_share_cents: "1000",
        platform_share_cents: "1000",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
