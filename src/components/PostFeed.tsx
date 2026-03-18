import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Pin, Clock, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PostComposer from './PostComposer';
import FeedCountdown from './FeedCountdown';

interface Post {
  id: string;
  profile_id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  image_urls: string[] | null;
  is_pinned: boolean;
  pinned_until: string | null;
  expires_at: string;
  created_at: string;
}

interface PostFeedProps {
  profileId: string;
  ownerUserId?: string;
  accentColor?: string;
  textColor?: string;
  mutedColor?: string;
  cardBg?: string;
  borderColor?: string;
  borderRadius?: string;
}

const PAGE_SIZE = 10;

const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const formatRichText = (text: string) => {
  const escaped = escapeHtml(text);

  return escaped
    .replace(
      /\[\[h1\]\]([\s\S]*?)\[\[\/h1\]\]/g,
      (_m: string, c: string) => `<h1 style="margin:0.6rem 0 0.35rem; font-size:1.45em; font-weight:800; color: inherit;">${c}</h1>`
    )
    .replace(
      /\[\[h2\]\]([\s\S]*?)\[\[\/h2\]\]/g,
      (_m: string, c: string) => `<h2 style="margin:0.55rem 0 0.35rem; font-size:1.25em; font-weight:800; color: inherit;">${c}</h2>`
    )
    .replace(
      /\[\[h3\]\]([\s\S]*?)\[\[\/h3\]\]/g,
      (_m: string, c: string) => `<h3 style="margin:0.5rem 0 0.3rem; font-size:1.1em; font-weight:800; color: inherit;">${c}</h3>`
    )
    .replace(
      /\[\[p\]\]([\s\S]*?)\[\[\/p\]\]/g,
      (_m: string, c: string) => `<p style="margin:0.35rem 0; color: inherit;">${c}</p>`
    )
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/__(.*?)__/g, '<u>$1</u>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    .replace(
      /(https?:\/\/[^\s<]+)|(www\.[^\s<]+)/g,
      (match: string, p1?: string, p2?: string) => {
        const raw = p1 || p2 || match;
        const href = raw.startsWith('http') ? raw : `https://${raw}`;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">${match}</a>`;
      }
    )
    .replace(/\n/g, '<br/>');
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
};

const PostFeed = ({ profileId, ownerUserId, accentColor, textColor, mutedColor, cardBg, borderColor, borderRadius }: PostFeedProps) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pinning, setPinning] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.id === ownerUserId;

  const loadPosts = useCallback(async (offset = 0, append = false) => {
    if (offset === 0) setLoading(true);
    else setLoadingMore(true);

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('profile_id', profileId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (data) {
      const typed = data as Post[];
      if (append) {
        setPosts(prev => [...prev, ...typed]);
      } else {
        setPosts(typed);
      }
      setHasMore(typed.length === PAGE_SIZE);
    }
    if (error) console.error(error);
    setLoading(false);
    setLoadingMore(false);
  }, [profileId]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Infinite scroll observer
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          loadPosts(posts.length, true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, posts.length, loadPosts]);

  const handlePin = async (postId: string) => {
    if (!isOwner) return;
    setPinning(postId);

    // For now, pin locally. In production this would trigger Stripe checkout for $10
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Faça login para fixar posts');
        setPinning(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke('pin-post-checkout', {
        body: { postId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
    setPinning(null);
  };

  const defaultStyles = {
    accent: accentColor || 'hsl(var(--primary))',
    text: textColor || 'hsl(var(--foreground))',
    muted: mutedColor || 'hsl(var(--muted-foreground))',
    card: cardBg || 'hsl(var(--card))',
    border: borderColor || 'hsl(var(--border))',
    radius: borderRadius || '12px',
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: defaultStyles.accent }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Composer for owner */}
      {isOwner && (
        <PostComposer
          profileId={profileId}
          userId={user!.id}
          onPostCreated={() => loadPosts()}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4" style={{ color: defaultStyles.accent }} />
        <h3 className="text-sm font-semibold" style={{ color: defaultStyles.text }}>
          Feed ({posts.length})
        </h3>
      </div>

      {posts.length === 0 && (
        <p className="text-center py-6 text-sm" style={{ color: defaultStyles.muted }}>
          Nenhum post publicado ainda.
        </p>
      )}

      {/* Posts */}
      {posts.map((post, i) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          style={{
            backgroundColor: defaultStyles.card,
            border: `1px solid ${defaultStyles.border}`,
            borderRadius: defaultStyles.radius,
            overflow: 'hidden',
            maxHeight: '200px',
            position: 'relative',
          }}
        >
          {/* Pinned badge */}
          {post.is_pinned && (
            <div
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: `${defaultStyles.accent}15`, color: defaultStyles.accent }}
            >
              <Pin className="h-3 w-3" /> Fixado
            </div>
          )}

          <div className="p-3 overflow-hidden" style={{ maxHeight: post.is_pinned ? '168px' : '200px' }}>
            {/* Content with rich text */}
            <div
              className="text-sm leading-relaxed overflow-hidden"
              style={{ color: defaultStyles.text, maxHeight: post.image_url ? '80px' : '140px' }}
              dangerouslySetInnerHTML={{ __html: formatRichText(post.content) }}
            />

            {/* Images (até 4) */}
            {(() => {
              const urls = (post.image_urls && post.image_urls.length > 0) ? post.image_urls : (post.image_url ? [post.image_url] : []);
              if (!urls.length) return null;
              return (
                <div className="mt-2 flex flex-wrap gap-1">
                  {urls.slice(0, 4).map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="rounded-lg object-cover"
                      style={{ maxHeight: '80px', width: urls.length === 1 ? '100%' : 'calc(50% - 4px)', borderRadius: defaultStyles.radius }}
                      loading="lazy"
                    />
                  ))}
                </div>
              );
            })()}

            {/* Footer */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 text-xs" style={{ color: defaultStyles.muted }}>
                <Clock className="h-3 w-3" />
                {timeAgo(post.created_at)}
                {!post.is_pinned && (
                  <FeedCountdown expiresAt={post.expires_at} className="ml-1" />
                )}
              </div>
              {isOwner && !post.is_pinned && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs gap-1 px-2"
                  onClick={() => handlePin(post.id)}
                  disabled={pinning === post.id}
                >
                  {pinning === post.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pin className="h-3 w-3" />}
                  Fixar $10
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={observerRef} className="flex justify-center py-4">
          {loadingMore && <Loader2 className="h-5 w-5 animate-spin" style={{ color: defaultStyles.accent }} />}
        </div>
      )}
    </div>
  );
};

export default PostFeed;
