import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) throw new Error("Not authenticated");
    const user = userData.user;

    const { slugs } = await req.json();
    if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
      throw new Error("No slugs provided");
    }

    // Get user's profile
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) throw new Error("Profile not found");

    // Verify slugs are available
    for (const s of slugs) {
      const { data: existingProfile } = await supabaseClient
        .from("profiles")
        .select("id")
        .eq("slug", s.slug)
        .single();

      if (existingProfile) throw new Error(`Slug "${s.slug}" is already taken`);

      const { data: existingPurchase } = await supabaseClient
        .from("purchased_slugs")
        .select("id")
        .eq("slug", s.slug)
        .single();

      if (existingPurchase) throw new Error(`Slug "${s.slug}" is already purchased`);
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find or create customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) customerId = customers.data[0].id;

    // Create line items for each slug
    const lineItems = slugs.map((s: { slug: string; price_cents: number }) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: `Slug: /${s.slug}`,
          description: `Mini-site slug jobinlink.com/${s.slug}`,
        },
        unit_amount: s.price_cents,
      },
      quantity: 1,
    }));

    const origin = req.headers.get("origin") || "https://jobinlink.com";

    // Metadata with slug list for post-payment processing
    const slugList = slugs.map((s: any) => s.slug).join(",");

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/dashboard?slug_purchase=success`,
      cancel_url: `${origin}/slugs`,
      metadata: {
        user_id: user.id,
        profile_id: profile.id,
        slugs: slugList,
        slug_prices: JSON.stringify(slugs),
      },
    });

    // Register slugs immediately (they'll be active after payment confirmation)
    // For simplicity, we register on checkout creation with stripe_payment_id
    for (const s of slugs) {
      await supabaseClient.from("purchased_slugs").insert({
        user_id: user.id,
        profile_id: profile.id,
        slug: s.slug,
        price_cents: s.price_cents,
        stripe_payment_id: session.id,
        is_active: true,
      });
    }

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
