import { ProfileData } from '@/data/mockProfiles';
import { MiniSiteTemplate } from '@/data/templates';
import { Play, Film, Globe, Instagram, Twitter, Youtube, Facebook, Github, Music, Tv, Compass, Linkedin, MessageCircle, Send, Share2 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import VideoPortfolioGrid from '@/components/VideoPortfolioGrid';
import PostFeed from '@/components/PostFeed';
import BoostBar from '@/components/BoostBar';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ExternalLink, Lock, ChevronDown, ChevronUp, Briefcase, GraduationCap, Loader2 } from 'lucide-react';
import { useState, CSSProperties, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SiteCustomization, SocialLink } from '@/components/MiniSiteEditor';

interface TemplatedProfileProps {
  profile: ProfileData;
  template: MiniSiteTemplate;
  videoUrl?: string | null;
  ownerUserId?: string;
  avatarFrame?: string | null;
  siteCustomization?: Partial<SiteCustomization>;
  bannerUrl?: string | null;
  boostScore?: number;
  homepageUntil?: string | null;
}

const TemplatedProfile = ({ profile, template: t, videoUrl, ownerUserId, siteCustomization: sc, bannerUrl, boostScore = 0, homepageUntil }: TemplatedProfileProps) => {
  const { t: tr } = useLanguage();
  const { toast } = useToast();
  const [cvOpen, setCvOpen] = useState(false);
  const [cvUnlocked, setCvUnlocked] = useState(false);
  const [unlockingCv, setUnlockingCv] = useState(false);
  const [contactUnlocked, setContactUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [videoUnlocked, setVideoUnlocked] = useState(!videoUrl);
  const [unlockingVideo, setUnlockingVideo] = useState(false);
  const [unlockedVideoIds, setUnlockedVideoIds] = useState<Set<string>>(new Set());
  const [unlockingVideoId, setUnlockingVideoId] = useState<string | null>(null);
  const [currentBoost, setCurrentBoost] = useState(boostScore);
  const [contactUnlockPriceCents, setContactUnlockPriceCents] = useState<number>(500);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Check if current user is the owner (auto-unlock everything for owner)
  useEffect(() => {
    const checkOwner = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && ownerUserId && session.user.id === ownerUserId) {
        setCvUnlocked(true);
        setContactUnlocked(true);
        setVideoUnlocked(true);
      }
    };
    checkOwner();
  }, [ownerUserId]);

  // Check if current user already unlocked this profile (contact/CV)
  useEffect(() => {
    let mounted = true;
    const checkContactUnlock = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || ownerUserId === session.user.id) return;
      const { data } = await supabase
        .from('contact_unlocks')
        .select('id')
        .eq('company_user_id', session.user.id)
        .eq('profile_id', profile.id)
        .maybeSingle();
      if (mounted && data) {
        setContactUnlocked(true);
        setCvUnlocked(true);
      }
    };
    checkContactUnlock();
    return () => { mounted = false; };
  }, [profile.id, ownerUserId]);

  // Preço do desbloqueio (créditos) para exibir na UI
  useEffect(() => {
    let mounted = true;
    const fetchPrice = async () => {
      try {
        const { data } = await supabase.functions.invoke('unlock-contact', {
          body: { profile_id: profile.id, get_price: true },
        });
        if (mounted && data?.price_cents != null) setContactUnlockPriceCents(data.price_cents);
      } catch (_) {}
    };
    fetchPrice();
    return () => { mounted = false; };
  }, [profile.id]);

  const doUnlockWithCredits = async (): Promise<{ ok: boolean; already_unlocked?: boolean; unlocked?: boolean; url?: string; error_code?: string; required?: number; available?: number }> => {
    const { data, error } = await supabase.functions.invoke('unlock-contact', {
      body: { profile_id: profile.id, profile_slug: profile.slug, use_credits: true },
    });
    if (error) throw error;
    return data ?? {};
  };

  const handleUnlockContact = async () => {
    setUnlocking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: tr('minisite.loginRequired'), variant: 'destructive' });
        setUnlocking(false);
        return;
      }
      const data = await doUnlockWithCredits();
      if (data.already_unlocked) {
        setContactUnlocked(true);
        setCvUnlocked(true);
        setUnlocking(false);
        return;
      }
      if (data.unlocked) {
        setContactUnlocked(true);
        setCvUnlocked(true);
        toast({ title: 'Contato desbloqueado com créditos!' });
        setUnlocking(false);
        return;
      }
      if (data.error_code === 'INSUFFICIENT_CREDITS') {
        toast({
          title: 'Saldo insuficiente',
          description: `Necessário: ${data.required ?? 0} créditos. Você tem: ${data.available ?? 0}. Adicione créditos no seu painel.`,
          variant: 'destructive',
        });
      }
      if (data.url) window.open(data.url, '_blank');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setUnlocking(false);
    }
  };

  const handleUnlockCv = async () => {
    setUnlockingCv(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: tr('minisite.loginRequired'), variant: 'destructive' });
        setUnlockingCv(false);
        return;
      }
      const data = await doUnlockWithCredits();
      if (data.already_unlocked || data.unlocked) {
        setCvUnlocked(true);
        setContactUnlocked(true);
        if (data.unlocked) toast({ title: 'CV desbloqueado com créditos!' });
      }
      if (data.error_code === 'INSUFFICIENT_CREDITS') {
        toast({
          title: 'Saldo insuficiente',
          description: `Necessário: ${data.required ?? 0} créditos. Você tem: ${data.available ?? 0}.`,
          variant: 'destructive',
        });
      }
      if (data.url) window.open(data.url, '_blank');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setUnlockingCv(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const checkVideoAccess = async () => {
      if (!videoUrl) { if (mounted) setVideoUnlocked(true); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session) { setVideoUnlocked(false); return; }
      if (ownerUserId && session.user.id === ownerUserId) { setVideoUnlocked(true); return; }
      const { data } = await supabase
        .from('video_unlocks')
        .select('id')
        .eq('profile_id', profile.id)
        .eq('buyer_user_id', session.user.id)
        .maybeSingle();
      if (mounted) setVideoUnlocked(!!data);
    };
    checkVideoAccess();
    return () => { mounted = false; };
  }, [videoUrl, ownerUserId, profile.id]);

  const handleUnlockVideo = async () => {
    setUnlockingVideo(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: tr('minisite.loginRequired'), variant: 'destructive' });
        return;
      }
      const { data, error } = await supabase.functions.invoke('unlock-video', {
        body: { profile_id: profile.id },
      });
      if (error) throw error;
      if (data?.error_code === 'INSUFFICIENT_CREDITS') {
        toast({ title: 'Créditos insuficientes', description: `Você tem ${data.available} e precisa de ${data.required}.`, variant: 'destructive' });
        return;
      }
      if (data?.ok || data?.already_unlocked) {
        setVideoUnlocked(true);
        toast({ title: 'Vídeo desbloqueado com sucesso!' });
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setUnlockingVideo(false);
    }
  };

  const handleUnlockPortfolioVideo = async (videoId: string) => {
    setUnlockingVideoId(videoId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: tr('minisite.loginRequired'), variant: 'destructive' }); return; }
      const video = profile.videoPortfolio?.find(v => v.id === videoId);
      const price = video?.price ?? 5;
      const { data, error } = await supabase.functions.invoke('unlock-video', {
        body: { profile_id: profile.id, price },
      });
      if (error) throw error;
      if (data?.error_code === 'INSUFFICIENT_CREDITS') {
        toast({ title: 'Créditos insuficientes', description: `Você tem ${data.available} e precisa de ${data.required}.`, variant: 'destructive' });
        return;
      }
      if (data?.ok || data?.already_unlocked) {
        // Evita spread de `Set` (TS exige target es2015+ ou downlevelIteration).
        setUnlockedVideoIds((prev) => {
          const next = new Set(prev);
          next.add(videoId);
          return next;
        });
        toast({ title: '🎬 Vídeo desbloqueado com sucesso!' });
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setUnlockingVideoId(null);
    }
  };

  const { colors, style } = t;

  // Load custom Google Font
  const customFont = sc?.font_family;
  if (customFont) {
    const fontId = `gf-${customFont.replace(/\s/g, '-')}`;
    if (typeof document !== 'undefined' && !document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(customFont)}:wght@400;600;700&display=swap`;
      document.head.appendChild(link);
    }
  }

  const fontFamily: Record<string, string> = {
    serif: "'Playfair Display', serif",
    sans: "'DM Sans', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
    display: "'Playfair Display', serif",
  };

  const resolvedFont = customFont ? `'${customFont}', sans-serif` : fontFamily[style.fontVibe];
  const resolvedTextColor = sc?.text_color || colors.text;
  const resolvedHeadingColor = sc?.heading_color || colors.text;
  const resolvedAccent = sc?.accent_color || colors.accent;
  const resolvedBg = sc?.bg_color || colors.bg;
  const resolvedCardBg = sc?.card_bg_color || colors.card;
  const resolvedBodySize = sc?.body_font_size ? `${sc.body_font_size}px` : undefined;
  const resolvedHeadingSize = sc?.heading_font_size ? `${sc.heading_font_size}px` : undefined;
  const resolvedPhotoSize = (sc as any)?.photo_size || 112;
  const photoStyle = (sc as any)?.photo_style || 'round';
  const avatarRadius = photoStyle === 'square' ? '12px' : '50%';

  const radius: Record<string, string> = {
    none: '0px', sm: '4px', md: '8px', lg: '16px', full: '9999px',
  };

  // Apple Glass card style - always glass morphism
  const cardBase: CSSProperties = {
    backgroundColor: `${resolvedCardBg}BB`,
    border: `1px solid rgba(255,255,255,0.12)`,
    borderRadius: '20px',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.08)',
    padding: '1.5rem',
  };

  const legacyModuleOrder: string[] =
    Array.isArray((sc as any)?.module_order) && (sc as any)?.module_order.length
      ? (sc as any).module_order
      : ['video', 'bio', 'links', 'social', 'cv', 'contact', 'portfolio', 'posts', 'boost', 'map'];
  const legacyLayout = ([1, 2, 3].includes((sc as any)?.layout) ? (sc as any)?.layout : 1) as 1 | 2 | 3;

  const pages = (() => {
    const p = (sc as any)?.pages as any[] | undefined;
    if (Array.isArray(p) && p.length) {
      return p.map((x, idx) => ({
        id: String(x?.id ?? `page-${idx + 1}`),
        title: String(x?.title ?? `Page ${idx + 1}`),
        module_order: Array.isArray(x?.module_order) && x.module_order.length ? x.module_order : legacyModuleOrder,
        layout: ([1, 2, 3].includes(x?.layout) ? x.layout : legacyLayout) as 1 | 2 | 3,
      }));
    }
    return [
      {
        id: 'page-1',
        title: 'Page 1',
        module_order: legacyModuleOrder,
        layout: legacyLayout,
      },
    ];
  })();

  const currentPage = pages[Math.min(pages.length - 1, Math.max(0, activePageIndex))];

  const layout = Math.min(3, Math.max(1, (currentPage?.layout as number) || 1)) as 1 | 2 | 3;
  const layouts: Record<1 | 2 | 3, string> = {
    1: '1fr',
    2: '1fr 1fr',
    3: '1fr 1fr 1fr',
  };
  const maxW = layout === 1 ? '640px' : layout === 2 ? '960px' : '1280px';

  // Module order (por página)
  const moduleOrder = currentPage?.module_order?.length ? currentPage.module_order : legacyModuleOrder;
  const [slugListings, setSlugListings] = useState<{ slug: string; price_cents: number }[]>([]);

  // Página ativa: vem do hash (`#page-2`) ou query (`?page=2`)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const readIndex = () => {
      const params = new URLSearchParams(window.location.search);
      const paramPage = params.get('page');
      const fromParam = paramPage ? parseInt(paramPage, 10) : NaN;
      if (Number.isFinite(fromParam)) {
        const idx = fromParam - 1;
        if (idx >= 0 && idx < pages.length) return idx;
      }

      const m = window.location.hash.match(/page-(\d+)/i);
      const fromHash = m ? parseInt(m[1], 10) : NaN;
      if (Number.isFinite(fromHash)) {
        const idx = fromHash - 1;
        if (idx >= 0 && idx < pages.length) return idx;
      }
      return 0;
    };

    setActivePageIndex(readIndex());
    const onChange = () => setActivePageIndex(readIndex());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, [pages.length]);
  useEffect(() => {
    if (!ownerUserId) return;
    import('@/integrations/supabase/client').then(({ supabase: s }) => {
      // A tipagem do Supabase pode ficar "profunda demais" e quebrar o build.
      // Aqui tratamos a query como `any` e preservamos o runtime.
      s.from('slug_marketplace' as any)
        .select('slug, price_cents' as any)
        .eq('owner_id', ownerUserId)
        .eq('status', 'active')
        .then(({ data }) => {
          if (data?.length) setSlugListings(data as any);
        });
    });
  }, [ownerUserId]);

  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const formatBioRichText = (text: string) => {
    const escaped = escapeHtml(text || '');

    return escaped
      .replace(
        /\[\[h1\]\]([\s\S]*?)\[\[\/h1\]\]/g,
        (_m: string, c: string) =>
          `<h1 style="margin:0.75rem 0 0.4rem; font-size:1.7rem; font-weight:900; color: ${resolvedHeadingColor}; font-family: ${resolvedFont};">${c}</h1>`
      )
      .replace(
        /\[\[h2\]\]([\s\S]*?)\[\[\/h2\]\]/g,
        (_m: string, c: string) =>
          `<h2 style="margin:0.65rem 0 0.35rem; font-size:1.35rem; font-weight:900; color: ${resolvedHeadingColor}; font-family: ${resolvedFont};">${c}</h2>`
      )
      .replace(
        /\[\[h3\]\]([\s\S]*?)\[\[\/h3\]\]/g,
        (_m: string, c: string) =>
          `<h3 style="margin:0.55rem 0 0.3rem; font-size:1.15rem; font-weight:800; color: ${resolvedHeadingColor}; font-family: ${resolvedFont};">${c}</h3>`
      )
      .replace(
        /\[\[p\]\]([\s\S]*?)\[\[\/p\]\]/g,
        (_m: string, c: string) =>
          `<p style="margin:0.35rem 0; color: ${resolvedTextColor}; font-family: ${resolvedFont}; font-size: ${resolvedBodySize || 'inherit'};">${c}</p>`
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

  const renderModule = (moduleId: string, delay: number) => {
    switch (moduleId) {
      case 'video':
        return videoUrl ? (
          <motion.div
            key="video"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            style={{ ...cardBase }}
          >
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: resolvedFont, display: 'flex', alignItems: 'center', gap: '0.5rem', color: resolvedHeadingColor }}>
              <Play style={{ width: '1.1rem', height: '1.1rem', color: resolvedAccent }} />
              {tr('minisite.video')}
            </h2>
            {videoUnlocked ? (
              <div style={{ marginTop: '0.75rem', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/9' }}>
                {videoUrl.includes('mediadelivery.net') ? (
                  <iframe src={videoUrl} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" />
                ) : (
                  <video src={videoUrl} controls style={{ width: '100%', maxHeight: '400px', borderRadius: '16px' }} />
                )}
              </div>
            ) : (
              <div style={{ marginTop: '0.75rem', borderRadius: '16px', border: `1px solid rgba(255,255,255,0.1)`, padding: '2rem', textAlign: 'center', background: `${resolvedCardBg}60` }}>
                <Lock style={{ width: '2rem', height: '2rem', color: `${resolvedAccent}88`, margin: '0 auto' }} />
                <p style={{ color: resolvedTextColor, fontSize: '0.875rem', marginTop: '0.75rem', opacity: 0.7 }}>
                  Vídeo pago: 5 créditos ($5)
                </p>
                <button onClick={handleUnlockVideo} disabled={unlockingVideo} style={{
                  marginTop: '0.9rem', padding: '0.65rem 1.4rem', backgroundColor: resolvedAccent, color: colors.accentFg, border: 'none', borderRadius: '12px', fontWeight: 600, cursor: unlockingVideo ? 'wait' : 'pointer', fontSize: '0.875rem', fontFamily: resolvedFont, opacity: unlockingVideo ? 0.7 : 1, display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  {unlockingVideo && <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />}
                  Desbloquear — 5 créditos
                </button>
              </div>
            )}
          </motion.div>
        ) : null;

      case 'bio':
        return (
          <motion.div key="bio" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} style={cardBase}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: resolvedFont, color: resolvedHeadingColor }}>
                  {tr('minisite.about')}
                </h2>
                <div
                  style={{ color: resolvedTextColor, marginTop: '0.5rem', lineHeight: 1.7, fontSize: resolvedBodySize }}
                  dangerouslySetInnerHTML={{ __html: formatBioRichText(profile.bio || '') }}
                />
              </div>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '1.5rem', fontFamily: resolvedFont, color: resolvedHeadingColor }}>
              {tr('minisite.skills')}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
              {profile.skills.map((skill) => (
                <span key={skill} style={{
                  backgroundColor: `${resolvedAccent}18`,
                  color: resolvedAccent,
                  padding: '0.3rem 0.85rem',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  border: `1px solid ${resolvedAccent}25`,
                  backdropFilter: 'blur(8px)',
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        );

      case 'links':
        return (
          <motion.div key="links" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} style={cardBase}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: resolvedFont, color: resolvedHeadingColor }}>
              {tr('minisite.links')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
              {profile.links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
                    color: resolvedTextColor, backgroundColor: `${resolvedAccent}10`, borderRadius: '14px',
                    border: `1px solid rgba(255,255,255,0.06)`, transition: 'all 0.2s',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {link.label}
                  <ExternalLink style={{ width: '1rem', height: '1rem', opacity: 0.5 }} />
                </a>
              ))}
            </div>
          </motion.div>
        );

      case 'cv':
        return (
          <motion.div key="cv" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} style={cardBase}>
            <button
              onClick={() => cvUnlocked ? setCvOpen(!cvOpen) : handleUnlockCv()}
              style={{
                display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between',
                background: 'none', border: 'none', cursor: 'pointer', color: resolvedTextColor,
                fontFamily: resolvedFont, fontWeight: 600, fontSize: '1.1rem', padding: 0,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase style={{ width: '1.2rem', height: '1.2rem', color: resolvedAccent }} />
                {tr('minisite.cv')}
              </span>
              {cvUnlocked ? (
                cvOpen
                  ? <ChevronUp style={{ width: '1.2rem', height: '1.2rem', color: `${resolvedTextColor}80` }} />
                  : <ChevronDown style={{ width: '1.2rem', height: '1.2rem', color: `${resolvedTextColor}80` }} />
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: resolvedAccent }}>
                  <Lock style={{ width: '0.9rem', height: '0.9rem' }} />
                  Desbloquear — $10 (50/50)
                </span>
              )}
            </button>

            {!cvUnlocked && (
              <div style={{ marginTop: '1rem', textAlign: 'center', padding: '1.5rem', borderRadius: '14px', background: `${resolvedCardBg}40`, border: `1px solid rgba(255,255,255,0.06)` }}>
                <Lock style={{ width: '2.5rem', height: '2.5rem', color: `${resolvedAccent}60`, margin: '0 auto' }} />
                <p style={{ color: resolvedTextColor, fontSize: '0.875rem', marginTop: '0.75rem', opacity: 0.7 }}>
                  CV completo com experiência e educação
                </p>
                <p style={{ color: resolvedAccent, fontSize: '1rem', fontWeight: 700, marginTop: '0.5rem' }}>
                  $10.00 — Split 50/50
                </p>
                <p style={{ color: `${resolvedTextColor}60`, fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  50% para o profissional, 50% para a plataforma
                </p>
                <button
                  onClick={handleUnlockCv}
                  disabled={unlockingCv}
                  style={{
                    marginTop: '1rem', padding: '0.75rem 2rem', backgroundColor: resolvedAccent,
                    color: colors.accentFg, border: 'none', borderRadius: '12px', fontWeight: 600,
                    cursor: unlockingCv ? 'wait' : 'pointer', fontSize: '0.875rem', fontFamily: resolvedFont,
                    opacity: unlockingCv ? 0.7 : 1, display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  }}
                >
                  {unlockingCv && <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />}
                  🔓 Desbloquear CV
                </button>
              </div>
            )}

            <AnimatePresence>
              {cvUnlocked && cvOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                    {/* Experience */}
                    <div>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1rem', fontFamily: resolvedFont, color: resolvedHeadingColor }}>
                        <Briefcase style={{ width: '1rem', height: '1rem', color: resolvedAccent }} />
                        {tr('minisite.experience')}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {profile.experience.map((exp, i) => (
                          <div key={i} style={{ borderLeft: `3px solid ${resolvedAccent}`, borderRadius: '0 14px 14px 0', background: `${resolvedCardBg}30`, padding: '1rem 1.25rem', backdropFilter: 'blur(8px)' }}>
                            <h4 style={{ fontWeight: 700, color: resolvedTextColor, fontSize: '0.95rem' }}>{exp.role}</h4>
                            <p style={{ fontSize: '0.85rem', color: resolvedAccent, fontWeight: 600, marginTop: '0.15rem' }}>{exp.company}</p>
                            <p style={{ fontSize: '0.75rem', color: `${resolvedTextColor}60`, marginTop: '0.1rem', fontStyle: 'italic' }}>{exp.period}</p>
                            {exp.description && (
                              <p style={{ fontSize: '0.85rem', color: `${resolvedTextColor}90`, marginTop: '0.5rem', lineHeight: 1.7 }}>{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Education */}
                    <div>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1rem', fontFamily: resolvedFont, color: resolvedHeadingColor }}>
                        <GraduationCap style={{ width: '1rem', height: '1rem', color: resolvedAccent }} />
                        {tr('minisite.education')}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                        {profile.education.map((edu, i) => (
                          <div key={i} style={{ borderLeft: `3px solid ${resolvedAccent}60`, borderRadius: '0 14px 14px 0', background: `${resolvedCardBg}20`, padding: '0.85rem 1.25rem', backdropFilter: 'blur(8px)' }}>
                            <h4 style={{ fontWeight: 700, color: resolvedTextColor, fontSize: '0.95rem' }}>{edu.degree}</h4>
                            <p style={{ fontSize: '0.85rem', color: `${resolvedTextColor}80` }}>{edu.school} · {edu.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Additional CV sections: Skills Summary, Certifications, Languages */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                    {/* Certifications placeholder */}
                    {profile.skills.length > 0 && (
                      <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.95rem', fontFamily: resolvedFont, color: resolvedHeadingColor, marginBottom: '0.75rem' }}>
                          🏅 Competências
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {profile.skills.map((skill) => (
                            <span key={skill} style={{
                              backgroundColor: `${resolvedAccent}15`, color: resolvedAccent,
                              padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem',
                              fontWeight: 500, border: `1px solid ${resolvedAccent}20`,
                            }}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Contact info in CV */}
                    <div>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.95rem', fontFamily: resolvedFont, color: resolvedHeadingColor, marginBottom: '0.75rem' }}>
                        📋 Resumo Profissional
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: `${resolvedTextColor}90`, lineHeight: 1.7 }}>
                        {profile.bio || 'Profissional com experiência e dedicação na área de atuação.'}
                      </p>
                      {profile.location && (
                        <p style={{ fontSize: '0.8rem', color: `${resolvedTextColor}60`, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          📍 {profile.location}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      case 'contact':
        return (
          <motion.div key="contact" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} style={cardBase}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: resolvedFont, color: resolvedHeadingColor }}>
              {tr('minisite.contact')}
            </h2>
            {!contactUnlocked ? (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Lock style={{ width: '2.5rem', height: '2.5rem', color: `${resolvedAccent}60`, margin: '0 auto' }} />
                <p style={{ color: `${resolvedTextColor}80`, fontSize: '0.875rem', marginTop: '0.75rem' }}>
                  {tr('minisite.contactLocked')}
                </p>
                <p style={{ color: resolvedAccent, fontSize: '1.1rem', fontWeight: 700, marginTop: '0.5rem' }}>
                  {contactUnlockPriceCents} créditos (${(contactUnlockPriceCents / 100).toFixed(2)})
                </p>
                <p style={{ color: `${resolvedTextColor}60`, fontSize: '0.75rem' }}>
                  {tr('minisite.splitInfo')}
                </p>
                <button onClick={handleUnlockContact} disabled={unlocking} style={{
                  marginTop: '1rem', padding: '0.75rem 2rem', backgroundColor: resolvedAccent, color: colors.accentFg,
                  border: 'none', borderRadius: '12px', fontWeight: 600, cursor: unlocking ? 'wait' : 'pointer',
                  fontSize: '0.875rem', fontFamily: resolvedFont, opacity: unlocking ? 0.7 : 1,
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  {unlocking && <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />}
                  {tr('minisite.unlock')} — {contactUnlockPriceCents} créditos
                </button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: resolvedTextColor }}><span style={{ fontWeight: 500 }}>Email:</span> {profile.contact.email}</p>
                <p style={{ fontSize: '0.875rem', color: resolvedTextColor }}><span style={{ fontWeight: 500 }}>Phone:</span> {profile.contact.phone}</p>
                <p style={{ fontSize: '0.875rem', color: resolvedTextColor }}><span style={{ fontWeight: 500 }}>LinkedIn:</span> {profile.contact.linkedin}</p>
              </motion.div>
            )}
          </motion.div>
        );

      case 'portfolio':
        return profile.videoPortfolio && profile.videoPortfolio.length > 0 ? (
          <motion.div key="portfolio" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} style={cardBase}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: resolvedFont, color: resolvedHeadingColor, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Film style={{ width: '1.1rem', height: '1.1rem', color: resolvedAccent }} />
              Portfólio de Vídeos
              <span style={{ fontSize: '0.75rem', backgroundColor: resolvedAccent, color: colors.accentFg, padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>
                {profile.videoPortfolio.length} vídeos
              </span>
            </h2>
            <VideoPortfolioGrid videos={profile.videoPortfolio} template={t} unlockedVideoIds={unlockedVideoIds} onUnlock={handleUnlockPortfolioVideo} unlockingId={unlockingVideoId} />
          </motion.div>
        ) : null;

      case 'posts':
        return (
          <motion.div key="posts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
            style={{ ...cardBase, maxHeight: 'none', overflow: 'visible' }}
          >
            <div style={{ maxHeight: '600px', overflowY: 'auto', overflowX: 'hidden' }}>
              <PostFeed
                profileId={profile.id}
                ownerUserId={ownerUserId}
                accentColor={resolvedAccent}
                textColor={resolvedTextColor}
                mutedColor={sc?.text_color ? `${sc.text_color}99` : colors.textMuted}
                cardBg={resolvedCardBg}
                borderColor={`rgba(255,255,255,0.08)`}
                borderRadius="14px"
              />
            </div>
          </motion.div>
        );

      case 'boost':
        return (
          <motion.div key="boost" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
            <BoostBar profileId={profile.id} profileName={profile.name} boostScore={currentBoost} homepageUntil={homepageUntil} onBoosted={(newScore) => setCurrentBoost(newScore)} />
          </motion.div>
        );

      case 'social': {
        const socialLinks: SocialLink[] = (sc as any)?.social_links || [];
        if (!socialLinks.length) return null;
        const socialIcons: Record<string, any> = {
          instagram: Instagram, twitter: Twitter, youtube: Youtube, facebook: Facebook,
          linkedin: Linkedin, whatsapp: MessageCircle, telegram: Send, pinterest: Share2,
          github: Github, spotify: Music, twitch: Tv, tiktok: Music,
          dribbble: Compass, behance: Compass, website: Globe,
        };
        return (
          <motion.div key="social" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} style={cardBase}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: resolvedFont, color: resolvedHeadingColor, marginBottom: '0.75rem' }}>
              🌐 Social
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {socialLinks.filter(l => l.url).map((link) => {
                const Icon = socialIcons[link.platform] || Globe;
                return (
                  <a key={link.platform + link.url} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
                    backgroundColor: `${resolvedAccent}12`, color: resolvedAccent, borderRadius: '12px',
                    fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s',
                    border: `1px solid ${resolvedAccent}20`, backdropFilter: 'blur(8px)',
                  }}>
                    <Icon style={{ width: '1rem', height: '1rem' }} />
                    {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                  </a>
                );
              })}
            </div>
          </motion.div>
        );
      }

      case 'slugs':
        if (!slugListings.length) return null;
        return (
          <motion.div key="slugs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} style={cardBase}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: resolvedFont, color: resolvedHeadingColor, marginBottom: '0.75rem' }}>
              🏷️ Slugs à venda
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {slugListings.map((l) => (
                <a
                  key={l.slug}
                  href={`/marketplace?q=${encodeURIComponent(l.slug)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem',
                    backgroundColor: `${resolvedAccent}18`, color: resolvedAccent, borderRadius: '10px',
                    fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none',
                  }}
                >
                  /{l.slug} · R$ {(l.price_cents / 100).toFixed(2)}
                </a>
              ))}
            </div>
          </motion.div>
        );

      case 'classificados':
        return (
          <motion.div key="classificados" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} style={cardBase}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: resolvedFont, color: resolvedHeadingColor, marginBottom: '0.75rem' }}>
              📋 Classificados
            </h2>
            <p style={{ fontSize: '0.9rem', color: resolvedTextColor }}>Em breve: artigos e classificados com editor de texto e drag-and-drop.</p>
          </motion.div>
        );

      case 'map': {
        const mapUrl = (sc as any)?.map_embed_url;
        const mapAddress = (sc as any)?.map_address;
        const mapsLink = mapAddress
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(mapAddress))}`
          : '';

        if (!mapUrl && !mapsLink) return null;
        return (
          <motion.div key="map" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} style={cardBase}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: resolvedFont, color: resolvedHeadingColor, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin style={{ width: '1.1rem', height: '1.1rem', color: resolvedAccent }} />
              Localização
              {mapsLink && (
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: resolvedAccent, textDecoration: 'none' }}
                >
                  <ExternalLink style={{ width: '1rem', height: '1rem', opacity: 0.8 }} />
                  Abrir no Maps
                </a>
              )}
            </h2>
            {mapUrl ? (
              <div style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <iframe src={mapUrl} width="100%" height="300" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            ) : (
              <div style={{ marginTop: '0.5rem', padding: '1rem', borderRadius: '16px', backgroundColor: `${resolvedCardBg}40`, border: `1px solid rgba(255,255,255,0.06)` }}>
                <p style={{ color: resolvedTextColor, fontSize: '0.9rem' }}>Adicione um embed do mapa para visualizar aqui.</p>
              </div>
            )}
          </motion.div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div style={{
      backgroundColor: resolvedBg,
      color: resolvedTextColor,
      fontFamily: resolvedFont,
      fontSize: resolvedBodySize,
      minHeight: '100vh',
    }}>
      {/* Banner */}
      {bannerUrl && (
        <div style={{ width: '100%', maxHeight: '280px', overflow: 'hidden' }}>
          <img src={bannerUrl} alt="Banner" style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ maxWidth: maxW, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header - just photo, no frame */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginTop: bannerUrl ? '-4rem' : '0' }}
          className="mb-8"
        >
          <div style={{
            display: 'inline-block',
            border: bannerUrl ? `4px solid ${resolvedBg}` : 'none',
            borderRadius: avatarRadius,
            backgroundColor: resolvedBg,
          }}>
            {profile.photo ? (
              <img
                src={profile.photo}
                alt={profile.name}
                style={{
                  width: resolvedPhotoSize,
                  height: resolvedPhotoSize,
                  borderRadius: avatarRadius,
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div style={{
                width: resolvedPhotoSize,
                height: resolvedPhotoSize,
                borderRadius: avatarRadius,
                backgroundColor: `${resolvedAccent}20`,
                color: resolvedAccent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: resolvedPhotoSize * 0.3,
              }}>
                {profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <h1 style={{
            fontSize: resolvedHeadingSize || '1.8rem',
            fontWeight: 700,
            marginTop: '1rem',
            fontFamily: resolvedFont,
            color: resolvedHeadingColor,
          }}>
            {profile.name}
          </h1>
          <p style={{ color: resolvedAccent, fontSize: '1.1rem', marginTop: '0.25rem', fontWeight: 500 }}>
            {profile.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginTop: '0.5rem', color: `${resolvedTextColor}80`, fontSize: '0.875rem' }}>
            <MapPin style={{ width: '1rem', height: '1rem' }} />
            {profile.location}
          </div>
        </motion.div>

        {/* Navegação entre páginas */}
        {pages.length > 1 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              justifyContent: 'center',
              marginTop: '-0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            {pages.map((p, idx) => {
              const active = idx === activePageIndex;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setActivePageIndex(idx);
                    if (typeof window !== 'undefined') window.location.hash = `page-${idx + 1}`;
                  }}
                  style={{
                    padding: '0.5rem 0.9rem',
                    borderRadius: '9999px',
                    border: `1px solid ${active ? `${resolvedAccent}55` : 'rgba(255,255,255,0.12)'}`,
                    backgroundColor: active ? `${resolvedAccent}18` : 'rgba(0,0,0,0.0)',
                    color: active ? resolvedAccent : resolvedTextColor,
                    fontFamily: resolvedFont,
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {idx + 1}. {p.title?.replace(/^Page\s+/i, '') || `Page ${idx + 1}`}
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic grid: 1, 2 ou 3 colunas */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: layouts[layout],
            gap: '1.25rem',
          }}
        >
          {moduleOrder.map((moduleId, i) => renderModule(moduleId, 0.05 + i * 0.05))}
        </div>
      </div>
    </div>
  );
};

export default TemplatedProfile;
