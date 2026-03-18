// Finalizar leilões expirados — chamar via cron (ex: Vercel Cron ou Supabase pg_cron)
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const cronSecret = req.headers.get("x-cron-secret") ?? req.headers.get("Authorization")?.replace("Bearer ", "");
  if (Deno.env.get("CRON_SECRET") && cronSecret !== Deno.env.get("CRON_SECRET")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const now = new Date().toISOString();
    const { data: auctions } = await supabase
      .from("slug_marketplace")
      .select("id, slug, owner_id, profile_id")
      .eq("type", "auction")
      .eq("status", "active")
      .lt("expires_at", now);

    const results: { id: string; slug: string; winner_id?: string; transferred: boolean }[] = [];

    for (const auction of auctions ?? []) {
      const { data: winner } = await supabase
        .from("slug_bids")
        .select("user_id")
        .eq("slug_marketplace_id", auction.id)
        .order("bid_amount_cents", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (winner?.user_id) {
        if (auction.profile_id) {
          await supabase
            .from("profiles")
            .update({ user_id: winner.user_id } as any)
            .eq("id", auction.profile_id);
        } else {
          await supabase
            .from("profiles")
            .update({ user_id: winner.user_id } as any)
            .eq("slug", auction.slug)
            .eq("user_id", auction.owner_id);
        }
        results.push({ id: auction.id, slug: auction.slug, winner_id: winner.user_id, transferred: true });
      } else {
        results.push({ id: auction.id, slug: auction.slug, transferred: false });
      }

      await supabase
        .from("slug_marketplace")
        .update({ status: "sold" })
        .eq("id", auction.id);
    }

    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
