import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPLOAD-BUNNY] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const BUNNY_API_KEY = Deno.env.get("BUNNY_API_KEY");
    const BUNNY_LIBRARY_ID = Deno.env.get("BUNNY_LIBRARY_ID");
    if (!BUNNY_API_KEY) throw new Error("BUNNY_API_KEY is not configured");
    if (!BUNNY_LIBRARY_ID) throw new Error("BUNNY_LIBRARY_ID is not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Check if user has active video subscription
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("has_video_feature")
      .eq("user_id", user.id)
      .single();

    if (!profile?.has_video_feature) {
      throw new Error("Video feature not activated. Please subscribe first.");
    }
    logStep("Video feature verified");

    const { title } = await req.json();
    const videoTitle = title || `Video - ${user.id.slice(0, 8)}`;

    // Step 1: Create a video in Bunny.net Stream library
    logStep("Creating video in Bunny.net", { title: videoTitle });
    const createRes = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
      {
        method: "POST",
        headers: {
          "AccessKey": BUNNY_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: videoTitle }),
      }
    );

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Bunny create video failed [${createRes.status}]: ${err}`);
    }

    const videoData = await createRes.json();
    logStep("Video created in Bunny.net", { videoId: videoData.guid });

    // Return the upload URL and video ID so the client can upload directly
    const uploadUrl = `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoData.guid}`;

    // Save video reference in profile
    const bunnyEmbedUrl = `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoData.guid}`;
    await serviceClient
      .from("profiles")
      .update({ video_url: bunnyEmbedUrl })
      .eq("user_id", user.id);

    logStep("Profile updated with video URL");

    return new Response(
      JSON.stringify({
        videoId: videoData.guid,
        uploadUrl,
        embedUrl: bunnyEmbedUrl,
        uploadHeaders: {
          "AccessKey": BUNNY_API_KEY,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
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
