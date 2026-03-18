// Cron: expira slugs não renovados (taxa anual); slug volta ao pool (owner_id = null)
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
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
    const { data: expired } = await supabase
      .from("slugs")
      .select("id, slug, owner_id")
      .not("owner_id", "is", null)
      .lt("expires_at", now);

    const freed: string[] = [];
    for (const row of expired ?? []) {
      await supabase.from("slugs").update({ owner_id: null, updated_at: now }).eq("id", row.id);
      freed.push(row.slug);
      // Slug volta ao pool. Perfil continua com profile.slug; o app deve checar slugs.owner_id para saber se ainda é dono.
    }

    return new Response(
      JSON.stringify({
        success: true,
        expired_count: freed.length,
        freed_slugs: freed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
