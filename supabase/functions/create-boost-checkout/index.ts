import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BOOST] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { profileId, quantity = 1 } = await req.json();
    if (!profileId) throw new Error("profileId is required");

    // Validate profile exists
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("id, name, boost_score")
      .eq("id", profileId)
      .single();
    if (!profile) throw new Error("Profile not found");
    logStep("Profile found", { profileId, currentScore: profile.boost_score });

    const amountCents = quantity * 150; // $1.50 per boost
    const platformShare = Math.round(amountCents * 0.40); // 40% platform
    const profileShare = amountCents - platformShare; // 60% profile owner

    logStep("Revenue split", { amountCents, platformShare, profileShare });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) customerId = customers.data[0].id;

    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Create one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Boost para ${profile.name}`,
              description: `${quantity}x boost(s) - sobe ${quantity} posição(ões) no diretório`,
            },
            unit_amount: 150,
          },
          quantity,
        },
      ],
      mode: "payment",
      success_url: `${origin}/directory?boost=success&profile=${profileId}&qty=${quantity}`,
      cancel_url: `${origin}/directory`,
      metadata: {
        booster_user_id: user.id,
        profile_id: profileId,
        quantity: String(quantity),
        platform_share_cents: String(platformShare),
        profile_share_cents: String(profileShare),
      },
    });

    // Immediately update boost score (optimistic - in production you'd use webhook)
    const newScore = profile.boost_score + quantity;
    const updateData: any = { boost_score: newScore };
    
    // If score reaches 1000, set homepage for 7 days
    if (newScore >= 1000 && (!profile.boost_score || profile.boost_score < 1000)) {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      updateData.homepage_until = sevenDaysFromNow.toISOString();
      logStep("Profile promoted to homepage!", { until: updateData.homepage_until });
    }

    await serviceClient
      .from("profiles")
      .update(updateData)
      .eq("id", profileId);

    // Record boost
    await serviceClient.from("boosts").insert({
      profile_id: profileId,
      booster_user_id: user.id,
      amount: amountCents,
      platform_share: platformShare,
      profile_share: profileShare,
      stripe_payment_id: session.id,
    });

    logStep("Boost recorded", { newScore, quantity });

    return new Response(
      JSON.stringify({ url: session.url, newScore }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
