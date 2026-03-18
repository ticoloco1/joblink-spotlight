import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (_req) => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const baseUrl = "https://jobinlink.com";
  const now = new Date().toISOString().split("T")[0];

  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/directory", priority: "0.9", changefreq: "daily" },
  ];

  // Fetch all published profiles
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("slug, user_type, updated_at")
    .eq("is_published", true)
    .order("updated_at", { ascending: false });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  const urlPaths = new Set<string>();

  function addUrl(locPath: string, changefreq: string, priority: string, lastmod: string) {
    if (urlPaths.has(locPath)) return;
    urlPaths.add(locPath);

    xml += `  <url>
    <loc>${baseUrl}${locPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
  }

  // Static pages
  for (const page of staticPages) {
    addUrl(page.loc, page.changefreq, page.priority, now);
  }

  // Dynamic profile pages
  if (profiles) {
    for (const profile of profiles) {
      const prefix = profile.user_type === "company" ? "/c/" : "/u/";
      const locPath = `${prefix}${profile.slug}`;
      const lastmod = profile.updated_at
        ? new Date(profile.updated_at).toISOString().split("T")[0]
        : now;
      addUrl(locPath, "weekly", "0.8", lastmod);
    }
  }

  xml += `</urlset>`;

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
});

