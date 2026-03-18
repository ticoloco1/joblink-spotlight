// Admin: inserção em massa de slugs (ignore duplicados)
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BATCH = 500;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user?.id) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }

  const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: user.id });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Apenas admin" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 403,
    });
  }

  try {
    const { slugs: raw } = await req.json();
    if (!Array.isArray(raw) || raw.length === 0) {
      return new Response(JSON.stringify({ error: "Envie um array 'slugs' de strings" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const slugs = raw
      .map((s: unknown) => (typeof s === "string" ? s.toLowerCase().trim() : String(s).toLowerCase().trim()))
      .filter((s: string) => s.length > 0);

    let inserted = 0;
    for (let i = 0; i < slugs.length; i += BATCH) {
      const batch = slugs.slice(i, i + BATCH).map((slug) => ({ slug }));
      const { error } = await supabase.from("slugs").upsert(batch, {
        onConflict: "slug",
        ignoreDuplicates: true,
      });
      if (error) throw error;
      inserted += batch.length;
    }

    return new Response(
      JSON.stringify({
        success: true,
        received: slugs.length,
        inserted,
        message: "Slugs inseridos (duplicados ignorados)",
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
