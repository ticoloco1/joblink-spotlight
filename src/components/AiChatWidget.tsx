import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

interface Props {
  siteId: string;
  siteName?: string;
  siteContext?: string;
  accentColor?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const AiChatWidget = ({ siteId, siteName, siteContext, accentColor = "#a855f7" }: Props) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    if (!user) { toast.error("Faça login para usar o assistente IA"); return; }

    const userMsg: Msg = { role: "user", content: input.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          site_id: siteId,
          site_context: siteContext || siteName || "",
        }),
      });

      if (resp.status === 402) {
        const data = await resp.json();
        toast.error(data.message || "Limite de interações atingido");
        setLoading(false);
        return;
      }
      if (resp.status === 429) {
        toast.error("Muitas requisições. Tente novamente em alguns segundos.");
        setLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      let done = false;
      while (!done) {
        const { done: rd, value } = await reader.read();
        if (rd) break;
        buf += decoder.decode(value, { stream: true });
        let ni: number;
        while ((ni = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, ni);
          buf = buf.slice(ni + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {}
        }
      }
    } catch (e: any) {
      toast.error("Erro ao conectar com IA");
    }
    setLoading(false);
  };

  return (
    <>
      {/* Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110"
        style={{ backgroundColor: accentColor }}
      >
        {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-80 sm:w-96 h-[28rem] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-2 border-b border-border" style={{ backgroundColor: accentColor + "15" }}>
            <Bot className="w-5 h-5" style={{ color: accentColor }} />
            <div>
              <p className="text-sm font-bold text-foreground">Assistente IA</p>
              <p className="text-[10px] text-muted-foreground">{siteName || "Mini Site"} • 1000 interações grátis</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8 space-y-2">
                <Bot className="w-10 h-10 mx-auto text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">Olá! Como posso ajudar?</p>
                <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                  {["Quais serviços?", "Agendar consulta", "Contato"].map(q => (
                    <button key={q} onClick={() => { setInput(q); }} className="text-[10px] px-2.5 py-1 rounded-full border border-border hover:bg-muted transition-colors text-muted-foreground">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && <Bot className="w-5 h-5 mt-1 shrink-0" style={{ color: accentColor }} />}
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}>
                  {m.content}
                </div>
                {m.role === "user" && <User className="w-5 h-5 mt-1 shrink-0 text-muted-foreground" />}
              </div>
            ))}
            {loading && !messages.find(m => m.role === "assistant" && m === messages[messages.length - 1]) && (
              <div className="flex gap-2">
                <Bot className="w-5 h-5 mt-1" style={{ color: accentColor }} />
                <div className="bg-muted rounded-xl px-3 py-2 text-xs text-muted-foreground animate-pulse">Pensando...</div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                placeholder={user ? "Digite sua pergunta..." : "Faça login para usar"}
                disabled={!user || loading}
                className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading || !user}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
                style={{ backgroundColor: accentColor, color: "white" }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1 text-center">Powered by IA • $5 por 1.000 interações extras</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AiChatWidget;
