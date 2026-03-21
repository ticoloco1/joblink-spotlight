import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FREE_LIMIT = 1000;
const PAID_BATCH = 1000;
const PAID_PRICE = 5.00;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader || "" } } }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, site_id, site_context } = await req.json();

    // Check usage
    const { data: usage } = await supabase
      .from("ai_usage")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const totalAllowed = FREE_LIMIT + (usage?.interactions_paid || 0) * PAID_BATCH;
    const totalUsed = usage?.interactions_used || 0;

    if (totalUsed >= totalAllowed) {
      return new Response(JSON.stringify({
        error: "limit_reached",
        message: `Limite de ${totalAllowed} interações atingido. Compre mais ${PAID_BATCH} interações por $${PAID_PRICE}.`,
        used: totalUsed,
        allowed: totalAllowed,
      }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Você é um assistente IA inteligente integrado a um mini site. Responda de forma útil, clara e concisa em português.
${site_context ? `Contexto do site: ${site_context}` : ""}
Você pode ajudar com:
- Responder dúvidas sobre o criador/empresa
- Agendar consultas e reuniões
- Fornecer informações sobre serviços
- Orientar visitantes
Seja profissional e amigável. Limite respostas a 300 palavras.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10), // Keep last 10 messages for context
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    // Increment usage (fire and forget with service role)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (usage) {
      await serviceClient.from("ai_usage").update({
        interactions_used: totalUsed + 1,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id);
    } else {
      await serviceClient.from("ai_usage").insert({
        user_id: user.id,
        interactions_used: 1,
      });
    }

    // Save user message
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "user" && site_id) {
        await serviceClient.from("ai_chat_messages").insert({
          site_id, user_id: user.id, role: "user", content: lastMsg.content,
        });
      }
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
