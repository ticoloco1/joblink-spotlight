import { useParams } from "react-router-dom";
import { usePublicSite, useSiteLinks, useSiteVideos, useBuyNft } from "@/hooks/useMiniSite";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useProtectedVideo } from "@/hooks/useProtectedVideo";
import {
  ExternalLink, Play, Gem, Lock, ChevronDown, ChevronUp, Globe, Eye, Mail, Phone, RefreshCw, Rss, DollarSign,
  Image, MapPin, Building, Store
} from "lucide-react";
import { useSitePhotos, useUserDomains, useUserProperties } from "@/hooks/useMiniSiteExtras";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import NftFlipCard from "@/components/NftFlipCard";
import Feed from "@/components/FeedPost";
import { SOCIAL_NETWORKS } from "@/components/SocialLinkPicker";
import AiChatWidget from "@/components/AiChatWidget";

const THEME_GRADIENTS: Record<string, string> = {
  cosmic: "from-purple-900 via-indigo-900 to-violet-800",
  ocean: "from-blue-900 via-cyan-900 to-teal-800",
  forest: "from-emerald-900 via-green-900 to-teal-900",
  sunset: "from-orange-900 via-amber-900 to-yellow-800",
  midnight: "from-slate-900 via-gray-900 to-zinc-900",
};

const THEME_ACCENTS: Record<string, string> = {
  cosmic: "#a855f7", ocean: "#06b6d4", forest: "#10b981", sunset: "#f59e0b", midnight: "#64748b",
};

const BG_STYLE_CLASSES: Record<string, { bg: string; text: string; subtext: string; card: string; border: string }> = {
  dark: { bg: "", text: "text-white", subtext: "text-white/60", card: "bg-white/10 border-white/10", border: "border-white/10" },
  white: { bg: "bg-white", text: "text-gray-900", subtext: "text-gray-500", card: "bg-gray-50 border-gray-200", border: "border-gray-200" },
  beige: { bg: "bg-amber-50", text: "text-amber-900", subtext: "text-amber-700/70", card: "bg-amber-100/50 border-amber-200", border: "border-amber-200" },
  sand: { bg: "bg-yellow-100", text: "text-yellow-900", subtext: "text-yellow-700/70", card: "bg-yellow-50 border-yellow-200", border: "border-yellow-200" },
  warm: { bg: "bg-orange-50", text: "text-orange-900", subtext: "text-orange-700/70", card: "bg-orange-100/50 border-orange-200", border: "border-orange-200" },
  yellow: { bg: "bg-yellow-50", text: "text-yellow-900", subtext: "text-yellow-700/60", card: "bg-yellow-100/50 border-yellow-200", border: "border-yellow-200" },
  "pastel-blue": { bg: "bg-sky-50", text: "text-sky-900", subtext: "text-sky-700/70", card: "bg-sky-100/50 border-sky-200", border: "border-sky-200" },
  "pastel-pink": { bg: "bg-pink-50", text: "text-pink-900", subtext: "text-pink-700/70", card: "bg-pink-100/50 border-pink-200", border: "border-pink-200" },
  "pastel-lavender": { bg: "bg-violet-50", text: "text-violet-900", subtext: "text-violet-700/70", card: "bg-violet-100/50 border-violet-200", border: "border-violet-200" },
  "light-gray": { bg: "bg-gray-100", text: "text-gray-800", subtext: "text-gray-500", card: "bg-white border-gray-200", border: "border-gray-200" },
  silver: { bg: "bg-slate-200", text: "text-slate-800", subtext: "text-slate-600", card: "bg-slate-100 border-slate-300", border: "border-slate-300" },
  "brushed-steel": { bg: "bg-zinc-300", text: "text-zinc-900", subtext: "text-zinc-700", card: "bg-zinc-200 border-zinc-400", border: "border-zinc-400" },
};

const FONT_SIZE_MAP: Record<string, { h1: string; body: string; small: string }> = {
  sm: { h1: "text-xl", body: "text-xs", small: "text-[9px]" },
  md: { h1: "text-3xl", body: "text-sm", small: "text-[10px]" },
  lg: { h1: "text-4xl md:text-5xl", body: "text-base", small: "text-xs" },
};

const PHOTO_SIZE_MAP: Record<string, string> = { sm: "w-16 h-16", md: "w-24 h-24", lg: "w-36 h-36" };

const MiniSitePublic = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: site, isLoading } = usePublicSite(slug || "");
  const { data: links } = useSiteLinks(site?.id);
  const { data: videos } = useSiteVideos(site?.id);
  const { user } = useAuth();
  const buyNft = useBuyNft();
  const qc = useQueryClient();
  const { data: photos } = useSitePhotos(site?.id);
  const siteUserId = site?.user_id;
  const showDomains = (site as any)?.show_domains;
  const showProperties = (site as any)?.show_properties;
  const showPhotos = (site as any)?.show_photos;
  const { data: domains } = useUserDomains(showDomains ? siteUserId : undefined);
  const { data: properties } = useUserProperties(showProperties ? siteUserId : undefined);
  const { fetchProtectedVideo, loading: loadingProtected, clearCache: clearVideoCache } = useProtectedVideo();
  const [cvOpen, setCvOpen] = useState(false);
  const [buyConfirm, setBuyConfirm] = useState<any>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [protectedIds, setProtectedIds] = useState<Map<string, string>>(new Map());
  const [unlockConfirm, setUnlockConfirm] = useState(false);
  const [paywallConfirm, setPaywallConfirm] = useState<any>(null);

  const { data: myPurchases } = useQuery({
    queryKey: ["my-nft-access", user?.id, site?.id],
    queryFn: async () => {
      const { data } = await supabase.from("nft_purchases").select("id, video_id, buyer_id, views_allowed, views_used").eq("buyer_id", user!.id);
      return data || [];
    },
    enabled: !!user && !!site,
  });

  const { data: myPaywallUnlocks } = useQuery({
    queryKey: ["my-paywall-unlocks", user?.id, site?.id],
    queryFn: async () => {
      const { data } = await supabase.from("video_paywall_unlocks" as any).select("video_id, expires_at").eq("user_id", user!.id);
      // Filter to only non-expired unlocks
      return ((data as any[]) || [])
        .filter((d: any) => !d.expires_at || new Date(d.expires_at) > new Date())
        .map((d: any) => d.video_id as string);
    },
    enabled: !!user && !!site,
  });

  const { data: profile } = useQuery({
    queryKey: ["site-profile", site?.user_id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", site!.user_id).single();
      return data;
    },
    enabled: !!site,
  });

  const { data: contactUnlocked } = useQuery({
    queryKey: ["cv-unlock", user?.id, site?.id],
    queryFn: async () => {
      const { data } = await supabase.from("cv_unlocks").select("id").eq("buyer_id", user!.id).eq("site_id", site!.id).limit(1);
      return (data || []).length > 0;
    },
    enabled: !!user && !!site,
  });

  const unlockContact = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("cv_unlocks").insert({
        buyer_id: user!.id,
        creator_id: site!.user_id,
        site_id: site!.id,
        amount_paid: (site as any).contact_price || 20,
        creator_share: ((site as any).contact_price || 20) / 2,
        platform_share: ((site as any).contact_price || 20) / 2,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cv-unlock"] });
      toast.success("Contact unlocked!");
      setUnlockConfirm(false);
    },
  });

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">Loading...</div>;
  if (!site) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">Site not found</div>;
  if ((site as any).blocked) return <div className="min-h-screen bg-background flex items-center justify-center text-destructive text-sm font-bold">Este site foi bloqueado pela administração.</div>;

  const hasNftAccess = (videoId: string) =>
    myPurchases?.some((p: any) => p.video_id === videoId && p.views_used < p.views_allowed);

  const hasPaywallAccess = (videoId: string) => myPaywallUnlocks?.includes(videoId);

  const handleBuy = async () => {
    if (!buyConfirm) return;
    try { await buyNft.mutateAsync(buyConfirm); toast.success("NFT purchased!"); setBuyConfirm(null); }
    catch (e: any) { toast.error(e.message); }
  };

  const handlePaywallBuy = async () => {
    if (!paywallConfirm || !user) return;
    const price = (paywallConfirm as any).paywall_price || 0.15;
    try {
      const { error } = await supabase.from("video_paywall_unlocks" as any).insert({
        user_id: user.id,
        video_id: paywallConfirm.id,
        amount_paid: price,
        creator_share: price * 0.6,
        platform_share: price * 0.4,
      });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["my-paywall-unlocks"] });
      clearVideoCache(paywallConfirm.id);
      toast.success("Video unlocked!");
      const videoId = paywallConfirm.id;
      setPaywallConfirm(null);
      // Fetch the protected URL now that payment is done
      const result = await fetchProtectedVideo(videoId);
      if (result.access && result.youtube_video_id) {
        setProtectedIds(prev => new Map(prev).set(videoId, result.youtube_video_id!));
        setPlayingId(videoId);
      }
    } catch (e: any) { toast.error(e.message); }
  };

  const handlePlay = async (video: any) => {
    if (!user) { toast.error("Please sign in first"); return; }

    // Free video — fetch via edge function anyway (owner check, etc.)
    if (!video.nft_enabled && !(video as any).paywall_enabled) {
      const result = await fetchProtectedVideo(video.id);
      if (result.access && result.youtube_video_id) {
        setProtectedIds(prev => new Map(prev).set(video.id, result.youtube_video_id!));
        setPlayingId(video.id);
      } else {
        toast.error(result.reason || "Cannot play this video");
      }
      return;
    }

    // Video paywall
    if ((video as any).paywall_enabled) {
      if (hasPaywallAccess(video.id)) {
        const result = await fetchProtectedVideo(video.id);
        if (result.access && result.youtube_video_id) {
          setProtectedIds(prev => new Map(prev).set(video.id, result.youtube_video_id!));
          setPlayingId(video.id);
        } else {
          toast.error(result.reason || "Access denied");
        }
        return;
      }
      setPaywallConfirm(video);
      return;
    }

    // NFT paywall
    if (video.nft_enabled) {
      if (hasNftAccess(video.id)) {
        const purchase = myPurchases?.find((p: any) => p.video_id === video.id && p.views_used < p.views_allowed);
        if (purchase) await supabase.from("nft_purchases").update({ views_used: purchase.views_used + 1 }).eq("id", purchase.id);
        const result = await fetchProtectedVideo(video.id);
        if (result.access && result.youtube_video_id) {
          setProtectedIds(prev => new Map(prev).set(video.id, result.youtube_video_id!));
          setPlayingId(video.id);
        } else {
          toast.error(result.reason || "Access denied");
        }
      } else { setBuyConfirm(video); }
    }
  };

  const themeGrad = THEME_GRADIENTS[site.theme] || THEME_GRADIENTS.cosmic;
  const themeAccent = THEME_ACCENTS[site.theme] || THEME_ACCENTS.cosmic;
  const colClass = site.layout_columns === 1 ? "grid-cols-1" : site.layout_columns === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2";
  const initial = profile?.display_name?.[0]?.toUpperCase() || site.site_name?.[0]?.toUpperCase() || "H";
  const siteAny = site as any;
  const bgStyleId = siteAny.bg_style || "dark";
  const isDark = bgStyleId === "dark";
  const bs = BG_STYLE_CLASSES[bgStyleId] || BG_STYLE_CLASSES.dark;
  const fs = FONT_SIZE_MAP[siteAny.font_size || "md"] || FONT_SIZE_MAP.md;
  const pShape = siteAny.photo_shape || "round";
  const photoSizeCls = PHOTO_SIZE_MAP[siteAny.photo_size || "md"] || PHOTO_SIZE_MAP.md;
  const photoRound = pShape === "round" ? "rounded-full" : "rounded-xl";

  return (
    <div className={`min-h-screen ${isDark ? `bg-gradient-to-b ${themeGrad}` : bs.bg}`}>
      {/* Buy NFT Dialog */}
      <AlertDialog open={!!buyConfirm} onOpenChange={o => !o && setBuyConfirm(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Gem className="w-5 h-5 text-primary" /> Purchase Video NFT</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p><strong>{buyConfirm?.title}</strong></p>
                <p>Price: <span className="font-mono font-bold text-primary">${buyConfirm?.nft_price}</span></p>
                <p>You'll get <strong>{buyConfirm?.nft_max_views} view(s)</strong>.</p>
                {buyConfirm?.nft_max_editions && <p className="text-[10px] text-muted-foreground">{buyConfirm.nft_editions_sold}/{buyConfirm.nft_max_editions} editions sold</p>}
                {buyConfirm?.recharge_enabled && <p className="text-[10px] text-accent">♻️ Recharge at ${buyConfirm.recharge_price}/cycle</p>}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBuy} className="bg-primary text-primary-foreground">Buy for ${buyConfirm?.nft_price}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Video Paywall Dialog */}
      <AlertDialog open={!!paywallConfirm} onOpenChange={o => !o && setPaywallConfirm(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-accent" /> Unlock Video</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p><strong>{paywallConfirm?.title}</strong></p>
                <p>Price: <span className="font-mono font-bold text-accent">${(paywallConfirm as any)?.paywall_price || 0.15} USDC</span></p>
                <p>Pay once for <strong>12 hours</strong> of access to this video.</p>
                <p className="text-[10px] text-muted-foreground">60% goes to the creator, 40% to HASHPO.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePaywallBuy} className="bg-accent text-accent-foreground">
              Unlock for ${(paywallConfirm as any)?.paywall_price || 0.15}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unlock Contact Dialog */}
      <AlertDialog open={unlockConfirm} onOpenChange={setUnlockConfirm}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> Unlock Contact Info</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>Unlock this creator's email and phone for <strong>${siteAny.contact_price || 20} USDC</strong>.</p>
                <p className="text-[10px] text-muted-foreground">50% goes to the creator, 50% to HASHPO.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => unlockContact.mutate()} className="bg-primary text-primary-foreground">
              Unlock for ${siteAny.contact_price || 20}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-8 text-center space-y-4">
        {(site.avatar_url || profile?.avatar_url) ? (
          <img src={site.avatar_url || profile?.avatar_url || ""} alt="" className={`${photoSizeCls} ${photoRound} mx-auto object-cover border-4 shadow-lg`} style={{ borderColor: themeAccent + "40" }} />
        ) : (
          <div className={`${photoSizeCls} ${photoRound} flex items-center justify-center text-3xl font-black mx-auto shadow-lg ${isDark ? "text-white" : bs.text}`} style={{ backgroundColor: themeAccent }}>
            {initial}
          </div>
        )}
        <h1 className={`${fs.h1} font-black ${bs.text}`}>{site.site_name || profile?.display_name || "My Site"}</h1>
        {site.bio && <p className={`${fs.body} ${bs.subtext} max-w-md mx-auto leading-relaxed`}>{site.bio}</p>}

        {/* Address */}
        {(site as any).address && (
          <p className={`${fs.body} ${bs.subtext} flex items-center gap-1.5 justify-center`}>
            <MapPin className="w-3.5 h-3.5" /> {(site as any).address}
          </p>
        )}

        {/* CV Section */}
        {site.show_cv && site.cv_content && (
          <div className="max-w-lg mx-auto">
            <button onClick={() => setCvOpen(!cvOpen)} className="flex items-center gap-1.5 mx-auto text-xs font-bold hover:underline" style={{ color: themeAccent }}>
              {cvOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {cvOpen ? "Hide CV" : "View CV / Resume"}
            </button>
            {cvOpen && (
              <div className={`mt-3 backdrop-blur-sm border rounded-xl p-6 text-left ${fs.body} whitespace-pre-wrap animate-in slide-in-from-top-2 ${bs.card} ${bs.text}`}>
                {site.cv_content}

                {/* Contact section */}
                {(siteAny.contact_email || siteAny.contact_phone) && (
                  <div className={`mt-4 pt-4 border-t ${bs.border}`}>
                    <p className={`text-xs font-bold ${bs.subtext} mb-2 flex items-center gap-1.5`}>
                      <Lock className="w-3 h-3" /> Contact Information
                    </p>
                    {contactUnlocked ? (
                      <div className="space-y-1.5">
                        {siteAny.contact_email && (
                          <a href={`mailto:${siteAny.contact_email}`} className="flex items-center gap-2 text-xs hover:underline" style={{ color: themeAccent }}>
                            <Mail className="w-3.5 h-3.5" /> {siteAny.contact_email}
                          </a>
                        )}
                        {siteAny.contact_phone && (
                          <a href={`tel:${siteAny.contact_phone}`} className="flex items-center gap-2 text-xs hover:underline" style={{ color: themeAccent }}>
                            <Phone className="w-3.5 h-3.5" /> {siteAny.contact_phone}
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-white/40 mb-2">Contact info is locked. Pay to unlock.</p>
                        <button
                          onClick={() => user ? setUnlockConfirm(true) : toast.error("Please sign in first")}
                          className="px-4 py-2 rounded-lg text-xs font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: themeAccent }}
                        >
                          <Lock className="w-3 h-3 inline mr-1" /> Unlock for ${siteAny.contact_price || 20}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Photo Gallery */}
      {showPhotos && photos && photos.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <Image className={`w-4 h-4 ${bs.subtext}`} />
            <h2 className={`text-sm font-bold ${bs.subtext} uppercase tracking-wider`}>Fotos</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((p: any) => (
              <div key={p.id} className={`rounded-xl overflow-hidden border ${bs.border}`}>
                <img src={p.url} alt={p.caption || ""} className="w-full aspect-square object-cover hover:scale-105 transition-transform" />
                {p.caption && <p className={`p-2 text-[10px] ${bs.subtext}`}>{p.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Domains for Sale */}
      {showDomains && domains && domains.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <Globe className={`w-4 h-4 ${bs.subtext}`} />
            <h2 className={`text-sm font-bold ${bs.subtext} uppercase tracking-wider`}>Domínios à Venda</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {domains.map((d: any) => (
              <a key={d.id} href={`/domains`} className={`backdrop-blur-sm border rounded-xl p-4 ${bs.card} hover:opacity-80 transition-all block`}>
                <p className={`${fs.body} font-bold ${bs.text}`}>{d.domain_name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[10px] ${bs.subtext} uppercase`}>{d.domain_type} · {d.tld || ".com"}</span>
                  <span className="text-sm font-bold" style={{ color: themeAccent }}>${d.price}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Properties for Sale */}
      {showProperties && properties && properties.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <Building className={`w-4 h-4 ${bs.subtext}`} />
            <h2 className={`text-sm font-bold ${bs.subtext} uppercase tracking-wider`}>Imóveis</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {properties.map((p: any) => (
              <div key={p.id} className={`backdrop-blur-sm border rounded-xl overflow-hidden ${bs.card}`}>
                {p.image_urls?.[0] && <img src={p.image_urls[0]} alt={p.title} className="w-full aspect-video object-cover" />}
                <div className="p-4">
                  <p className={`${fs.body} font-bold ${bs.text}`}>{p.title}</p>
                  <p className={`text-[10px] ${bs.subtext} mt-1`}>{p.city}{p.state ? `, ${p.state}` : ""}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[10px] ${bs.subtext}`}>{p.bedrooms}🛏 · {p.area_sqm}m²</span>
                    <span className="text-sm font-bold" style={{ color: themeAccent }}>${p.price?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="max-w-3xl mx-auto px-6 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <Rss className={`w-4 h-4 ${bs.subtext}`} />
          <h2 className={`text-sm font-bold ${bs.subtext} uppercase tracking-wider`}>Feed</h2>
        </div>
        <Feed siteId={site.id} userId={site.user_id} isOwner={user?.id === site.user_id} />
      </div>
      {links && links.length > 0 && (
        <div className="max-w-md mx-auto px-6 pb-8 space-y-2">
          {links.map((l: any) => {
            const social = SOCIAL_NETWORKS.find(s => s.id === l.icon);
            return (
              <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                className={`flex items-center justify-between w-full px-5 py-3 backdrop-blur-sm border rounded-xl ${fs.body} font-bold ${bs.card} ${bs.text} hover:opacity-80 transition-all group`}>
                <div className="flex items-center gap-3">
                  {social ? <span style={{ color: social.color }}>{social.icon}</span> : null}
                  <span>{l.title}</span>
                </div>
                <ExternalLink className={`w-4 h-4 ${bs.subtext}`} />
              </a>
            );
          })}
        </div>
      )}

      {/* Videos Grid */}
      {videos && videos.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 pb-16">
          <div className={`grid ${colClass} gap-4`}>
            {videos.map((v: any) => {
              const isPlaying = playingId === v.id;
              const canPlay = !v.nft_enabled || hasNftAccess(v.id);
              const soldOut = v.nft_max_editions && v.nft_editions_sold >= v.nft_max_editions;
              const isPaywalled = (v as any).paywall_enabled && !hasPaywallAccess(v.id);
              const protectedId = protectedIds.get(v.id) || null;

              if (v.nft_enabled) {
                return <NftFlipCard key={v.id} video={v} canPlay={canPlay} isPlaying={isPlaying} onPlay={() => handlePlay(v)} onBuy={() => setBuyConfirm(v)} soldOut={soldOut} themeAccent={themeAccent} protectedVideoId={protectedId} loadingVideo={loadingProtected && playingId === v.id} />;
              }

              return (
                <div key={v.id} className={`backdrop-blur-sm border rounded-xl overflow-hidden group hover:opacity-90 transition-all ${bs.card}`}>
                  <div className="relative aspect-video bg-black/20">
                    {isPlaying && protectedId ? (
                      <iframe src={`https://www.youtube.com/embed/${protectedId}?autoplay=1`} allow="autoplay; encrypted-media" allowFullScreen className="w-full h-full" />
                    ) : (
                      <>
                        {v.preview_url ? (
                          <video src={v.preview_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        ) : (
                          <img src={v.thumbnail_url || "/placeholder.svg"} alt={v.title} className="w-full h-full object-cover" />
                        )}
                        <button onClick={() => handlePlay(v)} className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          {loadingProtected && playingId === v.id ? (
                            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Play className="w-12 h-12 text-white fill-white drop-shadow-lg" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                  <div className="p-3">
                    <p className={`${fs.body} font-bold ${bs.text} line-clamp-2`}>{v.title}</p>
                    {(v as any).paywall_enabled && (
                      <span className="text-[10px] font-bold mt-1 inline-flex items-center gap-1" style={{ color: themeAccent }}>
                        <DollarSign className="w-3 h-3" /> {hasPaywallAccess(v.id) ? "Unlocked" : `$${(v as any).paywall_price} to watch`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pb-8">
        <a href="/" className={`text-[10px] ${bs.subtext} hover:opacity-70 transition-colors flex items-center gap-1 justify-center`}>
          <Globe className="w-3 h-3" /> Powered by HASHPO
        </a>
      </div>

      {/* AI Chat Widget */}
      <AiChatWidget
        siteId={site.id}
        siteName={site.site_name || site.slug || "Mini Site"}
        siteContext={`Site: ${site.site_name || site.slug}. Bio: ${site.bio || ""}. ${site.cv_headline ? `Headline: ${site.cv_headline}` : ""}`}
        accentColor={themeAccent}
      />
    </div>
  );
};

export default MiniSitePublic;
