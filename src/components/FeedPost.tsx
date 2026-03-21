import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold, Italic, Underline, Image, Pin, Send, Trash2, X, Smile
} from "lucide-react";

const EMOJI_LIST = ["😀","😎","🔥","❤️","👏","🚀","💡","🎯","💎","⭐","✅","🎉","💪","👀","🤝"];

interface FeedProps {
  siteId: string;
  userId: string;
  isOwner: boolean;
}

export default function Feed({ siteId, userId, isOwner }: FeedProps) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [pinPost, setPinPost] = useState(false);

  const { data: posts } = useQuery({
    queryKey: ["feed-posts", siteId],
    queryFn: async () => {
      const { data } = await supabase
        .from("feed_posts")
        .select("*")
        .eq("site_id", siteId)
        .gte("expires_at", new Date().toISOString())
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!siteId,
  });

  const createPost = useMutation({
    mutationFn: async () => {
      if (!content.trim()) throw new Error("Content required");
      const postData: any = {
        user_id: user!.id,
        site_id: siteId,
        content: content.trim(),
        image_url: imageUrl || null,
        pinned: pinPost,
        pinned_until: pinPost ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
      };
      const { error } = await supabase.from("feed_posts").insert(postData);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed-posts", siteId] });
      setContent("");
      setImageUrl("");
      setPinPost(false);
      toast.success(pinPost ? "Post fixado por 365 dias ($10 USDC)" : "Post publicado!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("feed_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed-posts", siteId] }),
  });

  const applyFormat = (tag: string) => {
    const ta = document.getElementById("feed-textarea") as HTMLTextAreaElement;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.substring(start, end);
    let wrapped = selected;
    if (tag === "bold") wrapped = `**${selected}**`;
    else if (tag === "italic") wrapped = `*${selected}*`;
    else if (tag === "underline") wrapped = `__${selected}__`;
    else if (tag === "upper") wrapped = selected.toUpperCase();
    else if (tag === "lower") wrapped = selected.toLowerCase();
    setContent(content.substring(0, start) + wrapped + content.substring(end));
  };

  const renderContent = (text: string) => {
    let html = text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/__(.+?)__/g, "<u>$1</u>")
      .replace(/\n/g, "<br/>");
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const daysLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="space-y-3">
      {/* Post composer (only for owner) */}
      {isOwner && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-1 mb-1">
            <button onClick={() => applyFormat("bold")} className="p-1.5 rounded hover:bg-white/10 text-white/60"><Bold className="w-3.5 h-3.5" /></button>
            <button onClick={() => applyFormat("italic")} className="p-1.5 rounded hover:bg-white/10 text-white/60"><Italic className="w-3.5 h-3.5" /></button>
            <button onClick={() => applyFormat("underline")} className="p-1.5 rounded hover:bg-white/10 text-white/60"><Underline className="w-3.5 h-3.5" /></button>
            <button onClick={() => applyFormat("upper")} className="p-1.5 rounded hover:bg-white/10 text-white/60 text-[10px] font-bold">AA</button>
            <button onClick={() => applyFormat("lower")} className="p-1.5 rounded hover:bg-white/10 text-white/60 text-[10px] font-bold">aa</button>
            <div className="flex-1" />
            <button onClick={() => setShowEmoji(!showEmoji)} className="p-1.5 rounded hover:bg-white/10 text-white/60"><Smile className="w-3.5 h-3.5" /></button>
          </div>
          {showEmoji && (
            <div className="flex flex-wrap gap-1 p-2 bg-white/5 rounded-lg">
              {EMOJI_LIST.map(e => (
                <button key={e} onClick={() => { setContent(c => c + e); setShowEmoji(false); }} className="text-lg hover:scale-125 transition-transform">{e}</button>
              ))}
            </div>
          )}
          <Textarea
            id="feed-textarea"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={500}
            rows={3}
            className="bg-transparent border-white/10 text-white placeholder:text-white/30 text-sm resize-none"
          />
          <div className="flex items-center gap-2">
            <Input
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="Image URL (optional)"
              className="flex-1 bg-transparent border-white/10 text-white placeholder:text-white/30 text-xs h-8"
            />
            <Image className="w-3.5 h-3.5 text-white/40" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
              <input type="checkbox" checked={pinPost} onChange={e => setPinPost(e.target.checked)} className="rounded" />
              <Pin className="w-3 h-3" /> Pin for 365 days ($10 USDC)
            </label>
            <button
              onClick={() => createPost.mutate()}
              disabled={!content.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> Post
            </button>
          </div>
        </div>
      )}

      {/* Feed posts */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-hide">
        {(posts || []).map((post: any) => (
          <div key={post.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-2" style={{ minHeight: "200px" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {post.pinned && <Pin className="w-3 h-3 text-yellow-400" />}
                <span className="text-[10px] text-white/40">
                  {new Date(post.created_at).toLocaleDateString()} · {daysLeft(post.expires_at)}d left
                </span>
              </div>
              {isOwner && (
                <button onClick={() => deletePost.mutate(post.id)} className="text-white/30 hover:text-destructive">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="text-sm text-white/80 leading-relaxed">
              {renderContent(post.content)}
            </div>
            {post.image_url && (
              <img src={post.image_url} alt="" className="w-full rounded-lg max-h-48 object-cover" />
            )}
          </div>
        ))}
        {(!posts || posts.length === 0) && (
          <div className="text-center py-8 text-white/20 text-xs">No posts yet</div>
        )}
      </div>
    </div>
  );
}
