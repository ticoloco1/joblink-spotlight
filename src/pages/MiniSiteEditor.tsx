import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import {
  useMySite, useSiteLinks, useSiteVideos, useUpsertSite,
  useAddSiteLink, useDeleteSiteLink, useAddSiteVideo, useDeleteSiteVideo, useUpdateSiteVideo
} from "@/hooks/useMiniSite";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable/index";
import CvEditor from "@/components/CvEditor";
import {
  Globe, Link2, Plus, Trash2, Eye, Upload, Camera,
  LayoutGrid, Columns2, Columns3, Save, Youtube, ShieldCheck, Gem, RefreshCw,
  Palette, Lock, Layers, DollarSign, Image, MapPin, Building, Store
} from "lucide-react";
import SocialLinkPicker, { SOCIAL_NETWORKS } from "@/components/SocialLinkPicker";
import { useSitePhotos, useAddSitePhoto, useDeleteSitePhoto, useUserDomains, useUserProperties } from "@/hooks/useMiniSiteExtras";
import TemplatePickerGrid from "@/components/TemplatePickerGrid";
import { getTemplate, type MiniSiteTemplate } from "@/data/miniSiteTemplates";
import { useMyCollections, useLaunchCollection } from "@/hooks/useCollections";

const VIEW_TIERS = [
  { value: 1, label: "1 view" },
  { value: 5, label: "5 views" },
  { value: 20, label: "20 views" },
];

const THEMES = [
  { id: "cosmic", label: "Cosmic", colors: "from-purple-900 via-indigo-900 to-violet-800", accent: "#a855f7" },
  { id: "ocean", label: "Ocean", colors: "from-blue-900 via-cyan-900 to-teal-800", accent: "#06b6d4" },
  { id: "forest", label: "Forest", colors: "from-emerald-900 via-green-900 to-teal-900", accent: "#10b981" },
  { id: "sunset", label: "Sunset", colors: "from-orange-900 via-amber-900 to-yellow-800", accent: "#f59e0b" },
  { id: "midnight", label: "Midnight", colors: "from-slate-900 via-gray-900 to-zinc-900", accent: "#64748b" },
];

const BG_STYLES = [
  { id: "dark", label: "Escuro", preview: "bg-gray-900", textColor: "text-white" },
  { id: "white", label: "Branco", preview: "bg-white", textColor: "text-gray-900" },
  { id: "beige", label: "Bege", preview: "bg-amber-50", textColor: "text-amber-900" },
  { id: "sand", label: "Areia", preview: "bg-yellow-100", textColor: "text-yellow-900" },
  { id: "warm", label: "Calor", preview: "bg-orange-50", textColor: "text-orange-900" },
  { id: "yellow", label: "Amarelo", preview: "bg-yellow-50", textColor: "text-yellow-900" },
  { id: "pastel-blue", label: "Azul Claro", preview: "bg-sky-50", textColor: "text-sky-900" },
  { id: "pastel-pink", label: "Rosa", preview: "bg-pink-50", textColor: "text-pink-900" },
  { id: "pastel-lavender", label: "Lavanda", preview: "bg-violet-50", textColor: "text-violet-900" },
  { id: "light-gray", label: "Cinza Claro", preview: "bg-gray-100", textColor: "text-gray-800" },
  { id: "silver", label: "Prata", preview: "bg-slate-200", textColor: "text-slate-800" },
  { id: "brushed-steel", label: "Aço Escovado", preview: "bg-zinc-300", textColor: "text-zinc-900" },
];

const FONT_SIZES = [
  { id: "sm", label: "Pequena" },
  { id: "md", label: "Média" },
  { id: "lg", label: "Grande" },
];

const PHOTO_SHAPES = [
  { id: "round", label: "Redonda" },
  { id: "square", label: "Quadrada" },
];

const PHOTO_SIZES = [
  { id: "sm", label: "Pequena" },
  { id: "md", label: "Média" },
  { id: "lg", label: "Grande" },
];

const getThemeClasses = (themeId: string) => {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  return theme;
};

const MiniSiteEditor = () => {
  const { user, loading } = useAuth();
  const { data: site, isLoading } = useMySite();
  const { data: links } = useSiteLinks(site?.id);
  const { data: videos } = useSiteVideos(site?.id);
  const upsertSite = useUpsertSite();
  const addLink = useAddSiteLink();
  const deleteLink = useDeleteSiteLink();
  const addVideo = useAddSiteVideo();
  const deleteVideo = useDeleteSiteVideo();
  const updateVideo = useUpdateSiteVideo();
  const { data: myCollections } = useMyCollections();
  const launchCollection = useLaunchCollection();
  const { data: photos } = useSitePhotos(site?.id);
  const addPhoto = useAddSitePhoto();
  const deletePhoto = useDeleteSitePhoto();
  const { data: userDomains } = useUserDomains(user?.id);
  const { data: userProperties } = useUserProperties(user?.id);

  const [siteName, setSiteName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [layoutCols, setLayoutCols] = useState(2);
  const [showCv, setShowCv] = useState(false);
  const [cvContent, setCvContent] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("cosmic");
  const [templateId, setTemplateId] = useState("blank");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPrice, setContactPrice] = useState("20");
  const [cvHeadline, setCvHeadline] = useState("");
  const [cvLocation, setCvLocation] = useState("");
  const [cvSkills, setCvSkills] = useState<string[]>([]);
  const [cvExperience, setCvExperience] = useState<any[]>([]);
  const [cvEducation, setCvEducation] = useState<any[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [bgStyle, setBgStyle] = useState("dark");
  const [address, setAddress] = useState("");
  const [showDomains, setShowDomains] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [fontSize, setFontSize] = useState("md");
  const [photoShape, setPhotoShape] = useState("round");
  const [photoSize, setPhotoSize] = useState("md");

  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const [ytUrl, setYtUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [nftEnabled, setNftEnabled] = useState(false);
  const [nftPrice, setNftPrice] = useState("1.00");
  const [nftMaxViews, setNftMaxViews] = useState("1");
  const [nftMaxEditions, setNftMaxEditions] = useState("");
  const [rechargeEnabled, setRechargeEnabled] = useState(false);
  const [rechargePrice, setRechargePrice] = useState("0.50");
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [paywallEnabled, setPaywallEnabled] = useState(false);
  const [paywallPrice, setPaywallPrice] = useState("0.15");

  useEffect(() => {
    if (site) {
      setSiteName(site.site_name || "");
      setSlug(site.slug || "");
      setBio(site.bio || "");
      setLayoutCols(site.layout_columns || 2);
      setShowCv(site.show_cv || false);
      setCvContent(site.cv_content || "");
      setSelectedTheme(site.theme || "cosmic");
      setTemplateId((site as any).template_id || "blank");
      setContactEmail((site as any).contact_email || "");
      setContactPhone((site as any).contact_phone || "");
      setContactPrice(String((site as any).contact_price ?? 20));
      setCvHeadline((site as any).cv_headline || "");
      setCvLocation((site as any).cv_location || "");
      setCvSkills((site as any).cv_skills || []);
      setCvExperience((site as any).cv_experience || []);
      setCvEducation((site as any).cv_education || []);
      setAvatarUrl(site.avatar_url || "");
      setBgStyle((site as any).bg_style || "dark");
      setFontSize((site as any).font_size || "md");
      setPhotoShape((site as any).photo_shape || "round");
      setPhotoSize((site as any).photo_size || "md");
      setAddress((site as any).address || "");
      setShowDomains((site as any).show_domains || false);
      setShowProperties((site as any).show_properties || false);
      setShowPhotos((site as any).show_photos || false);
    }
  }, [site]);

  if (loading || isLoading) return <div className="min-h-screen bg-background"><Header /><div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Loading...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const handleSaveSite = async () => {
    try {
      await upsertSite.mutateAsync({
        site_name: siteName,
        slug: slug || user.email?.split("@")[0],
        bio,
        layout_columns: layoutCols,
        show_cv: showCv,
        cv_content: cvContent,
        theme: selectedTheme,
        template_id: templateId,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        contact_price: parseFloat(contactPrice) || 20,
        cv_headline: cvHeadline,
        cv_location: cvLocation,
        cv_skills: cvSkills,
        cv_experience: cvExperience,
        cv_education: cvEducation,
        avatar_url: avatarUrl || null,
        bg_style: bgStyle,
        font_size: fontSize,
        photo_shape: photoShape,
        photo_size: photoSize,
        address,
        show_domains: showDomains,
        show_properties: showProperties,
        show_photos: showPhotos,
      });
      toast.success("Mini-site saved!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user!.id}/avatar.${ext}`;
      const { error } = await supabase.storage.from("platform-assets").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("platform-assets").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
      toast.success("Avatar uploaded!");
    } catch (e: any) { toast.error(e.message); }
    setUploadingAvatar(false);
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    return match?.[1] || url;
  };

  const uploadPreview = async (file: File, ytId: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/${ytId}-preview.${ext}`;
    const { error } = await supabase.storage.from("video-previews").upload(path, file, { upsert: true });
    if (error) { toast.error("Preview upload failed: " + error.message); return null; }
    const { data } = supabase.storage.from("video-previews").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAddVideo = async () => {
    if (!site?.id || !ytUrl) return;
    const ytId = extractYouTubeId(ytUrl);
    let previewUrl: string | undefined;
    if (previewFile) { const url = await uploadPreview(previewFile, ytId); if (url) previewUrl = url; }
    try {
      await addVideo.mutateAsync({
        site_id: site.id, youtube_video_id: ytId, title: videoTitle || `Video ${ytId}`,
        thumbnail_url: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        nft_enabled: nftEnabled, nft_price: nftEnabled ? (parseFloat(nftPrice) || 1) : 0,
        nft_max_views: parseInt(nftMaxViews) || 1,
        nft_max_editions: nftMaxEditions ? parseInt(nftMaxEditions) : undefined,
        preview_url: previewUrl, recharge_enabled: rechargeEnabled,
        recharge_price: rechargeEnabled ? (parseFloat(rechargePrice) || 0) : 0,
        view_tier: parseInt(nftMaxViews) || 1,
        paywall_enabled: paywallEnabled,
        paywall_price: paywallEnabled ? (parseFloat(paywallPrice) || 0.15) : 0,
      });
      setYtUrl(""); setVideoTitle(""); setNftEnabled(false); setNftPrice("1.00");
      setNftMaxViews("1"); setNftMaxEditions(""); setPreviewFile(null);
      setRechargeEnabled(false); setRechargePrice("0.50");
      setPaywallEnabled(false); setPaywallPrice("0.15");
      toast.success("Video added!");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleAddLink = async (title?: string, url?: string, icon?: string) => {
    const t = title || linkTitle;
    const u = url || linkUrl;
    if (!site?.id || !t || !u) return;
    try {
      await addLink.mutateAsync({ site_id: site.id, title: t, url: u, icon: icon || "link" });
      if (!title) { setLinkTitle(""); setLinkUrl(""); }
      toast.success("Link added!");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin, extraParams: { prompt: "select_account" },
    });
    if (error) toast.error("Google sign-in failed");
  };

  const publicUrl = `${window.location.origin}/s/${slug || "preview"}`;
  const currentTheme = getThemeClasses(selectedTheme);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-black text-foreground">Mini-Site Editor</h1>
          </div>
          <div className="flex items-center gap-3">
            <a href={publicUrl} target="_blank" className="flex items-center gap-1.5 text-xs text-primary hover:underline">
              <Eye className="w-3.5 h-3.5" /> Preview
            </a>
            <a href="/marketplace" className="flex items-center gap-1.5 text-xs text-accent hover:underline">
              <Gem className="w-3.5 h-3.5" /> Marketplace
            </a>
            <button onClick={handleSaveSite} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90">
              <Save className="w-4 h-4" /> Save Site
            </button>
          </div>
        </div>

        {/* Template Picker */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 mb-6">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4" /> Escolha um Template
          </h2>
          <TemplatePickerGrid
            selectedId={templateId}
            onSelect={(tpl: MiniSiteTemplate) => {
              setTemplateId(tpl.id);
              setSelectedTheme(tpl.theme);
              setLayoutCols(tpl.layoutColumns);
              setShowCv(tpl.showCv);
              toast.success(`Template "${tpl.name}" aplicado!`);
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Editor panels */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" /> Perfil
              </h2>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Username (URL)</label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{window.location.origin}/s/</span>
                  <Input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="seuusername" />
                </div>
              </div>
              {/* Avatar Upload */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1"><Camera className="w-3 h-3" /> Profile Photo</label>
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="w-14 h-14 rounded-full object-cover border-2 border-primary" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-2xl font-black text-muted-foreground border-2 border-border">
                      {siteName?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div>
                    <Input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }} className="text-xs w-48" disabled={uploadingAvatar} />
                    {uploadingAvatar && <p className="text-[10px] text-accent animate-pulse">Uploading...</p>}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Display Name</label>
                <Input value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="Seu Nome" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Bio</label>
                <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} />
              </div>
            </div>

            {/* Theme */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4" /> Tema de Cor
              </h2>
              <div className="flex gap-3">
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`relative flex flex-col items-center gap-1.5 transition-all ${selectedTheme === theme.id ? "scale-105" : "opacity-70 hover:opacity-100"}`}
                  >
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${theme.colors} border-2 ${selectedTheme === theme.id ? "border-primary ring-2 ring-primary/30" : "border-border"} flex items-center justify-center`}>
                      {selectedTheme === theme.id && <span className="text-white text-lg">✓</span>}
                    </div>
                    <span className="text-[10px] font-bold text-foreground">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Style */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4" /> Fundo do Site
              </h2>
              <div className="flex flex-wrap gap-3">
                {BG_STYLES.map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => setBgStyle(bg.id)}
                    className={`relative flex flex-col items-center gap-1.5 transition-all ${bgStyle === bg.id ? "scale-105" : "opacity-70 hover:opacity-100"}`}
                  >
                    <div className={`w-14 h-14 rounded-xl ${bg.preview} border-2 ${bgStyle === bg.id ? "border-primary ring-2 ring-primary/30" : "border-border"} flex items-center justify-center shadow-sm`}>
                      {bgStyle === bg.id && <span className={`text-lg ${bg.id === "dark" ? "text-white" : "text-gray-800"}`}>✓</span>}
                    </div>
                    <span className="text-[10px] font-bold text-foreground">{bg.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Tamanho da Fonte</h2>
              <div className="flex gap-2">
                {FONT_SIZES.map(fs => (
                  <button key={fs.id} onClick={() => setFontSize(fs.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${fontSize === fs.id ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:border-primary/50"}`}>
                    {fs.id === "sm" ? "A" : fs.id === "md" ? "A+" : "A++"} {fs.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Shape & Size */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4" /> Formato da Foto
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-2 block">Formato</label>
                  <div className="flex gap-2">
                    {PHOTO_SHAPES.map(ps => (
                      <button key={ps.id} onClick={() => setPhotoShape(ps.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${photoShape === ps.id ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:border-primary/50"}`}>
                        <div className={`w-5 h-5 bg-muted-foreground/30 ${ps.id === "round" ? "rounded-full" : "rounded-sm"}`} />
                        {ps.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-2 block">Tamanho</label>
                  <div className="flex gap-2">
                    {PHOTO_SIZES.map(ps => (
                      <button key={ps.id} onClick={() => setPhotoSize(ps.id)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${photoSize === ps.id ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:border-primary/50"}`}>
                        {ps.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Layout */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Video Layout</h2>
              <div className="flex gap-2">
                {[1, 2, 3].map(n => (
                  <button key={n} onClick={() => setLayoutCols(n)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${layoutCols === n ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:border-primary/50"}`}>
                    {n === 3 ? <Columns3 className="w-4 h-4" /> : <Columns2 className="w-4 h-4" />}
                    {n} {n === 1 ? "Column" : "Columns"}
                  </button>
                ))}
              </div>
            </div>

            {/* CV & Contact */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4" /> CV / Resume & Contact
              </h2>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground">Show Expandable CV</label>
                <Switch checked={showCv} onCheckedChange={setShowCv} />
              </div>
              {showCv && (
                <CvEditor
                  cvContent={cvContent} setCvContent={setCvContent}
                  cvHeadline={cvHeadline} setCvHeadline={setCvHeadline}
                  cvLocation={cvLocation} setCvLocation={setCvLocation}
                  cvSkills={cvSkills} setCvSkills={setCvSkills}
                  cvExperience={cvExperience} setCvExperience={setCvExperience}
                  cvEducation={cvEducation} setCvEducation={setCvEducation}
                  contactEmail={contactEmail} setContactEmail={setContactEmail}
                  contactPhone={contactPhone} setContactPhone={setContactPhone}
                  contactPrice={contactPrice} setContactPrice={setContactPrice}
                />
              )}
            </div>

            {/* Videos */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Youtube className="w-4 h-4 text-destructive" /> Videos
              </h2>
              <div className="bg-secondary/50 border border-border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">YouTube URL or ID</label>
                    <Input value={ytUrl} onChange={e => setYtUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Title</label>
                    <Input value={videoTitle} onChange={e => setVideoTitle(e.target.value)} placeholder="Video title" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Upload className="w-3 h-3" /> Preview Clip (optional)</label>
                  <Input type="file" accept="video/*,.gif" onChange={e => setPreviewFile(e.target.files?.[0] || null)} className="text-xs" />
                  {previewFile && <p className="text-[10px] text-accent">{previewFile.name}</p>}
                </div>
                {/* Video Paywall (pay to watch, no NFT) */}
                <div className="flex items-center gap-3">
                  <Switch checked={paywallEnabled} onCheckedChange={c => { setPaywallEnabled(c); if (c) setNftEnabled(false); }} />
                  <span className="text-xs font-bold text-foreground flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-accent" /> Video Paywall (pay to watch)</span>
                </div>
                {paywallEnabled && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Price (USDC)</label>
                    <Input type="number" value={paywallPrice} onChange={e => setPaywallPrice(e.target.value)} min="0.10" step="0.01" className="w-32" />
                    <p className="text-[10px] text-muted-foreground italic">Access lasts 12 hours. Min $0.10 embed / $0.60 bunny.net. 60% Creator / 40% Platform.</p>
                  </div>
                )}
                {/* NFT Paywall (ownership + limited views) */}
                <div className="flex items-center gap-3">
                  <Switch checked={nftEnabled} onCheckedChange={c => { setNftEnabled(c); if (c) setPaywallEnabled(false); }} />
                  <span className="text-xs font-bold text-foreground flex items-center gap-1"><Gem className="w-3.5 h-3.5 text-primary" /> NFT Paywall (ownership + limited views)</span>
                </div>
                {nftEnabled && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Price (USDC)</label>
                        <Input type="number" value={nftPrice} onChange={e => setNftPrice(e.target.value)} min="0" step="0.01" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">View Tier</label>
                        <div className="flex gap-1">
                          {VIEW_TIERS.map(t => (
                            <button key={t.value} onClick={() => setNftMaxViews(String(t.value))}
                              className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold border transition-all ${nftMaxViews === String(t.value) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:border-primary/50"}`}>
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Max Editions (∞ = blank)</label>
                        <Input type="number" value={nftMaxEditions} onChange={e => setNftMaxEditions(e.target.value)} min="1" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <Switch checked={rechargeEnabled} onCheckedChange={setRechargeEnabled} />
                      <span className="text-xs font-bold text-foreground flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5 text-accent" /> Allow Recharge</span>
                      {rechargeEnabled && (
                        <div className="flex items-center gap-1">
                          <label className="text-[10px] font-bold text-muted-foreground">Price:</label>
                          <Input type="number" value={rechargePrice} onChange={e => setRechargePrice(e.target.value)} min="0" step="0.01" className="w-24 h-7 text-xs" />
                          <span className="text-[10px] text-muted-foreground">USDC</span>
                        </div>
                      )}
                    </div>
                    {!rechargeEnabled && <p className="text-[10px] text-muted-foreground italic">Without recharge, NFT becomes collectible after views run out.</p>}
                  </>
                )}
                <button onClick={handleAddVideo} disabled={!ytUrl || !site?.id} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 disabled:opacity-50">
                  <Plus className="w-4 h-4" /> Add Video
                </button>
              </div>
              {(videos || []).length > 0 && (
                <div className="space-y-2">
                  {(videos || []).map((v: any) => (
                    <div key={v.id} className="flex items-center gap-3 bg-secondary/30 rounded-lg p-3 border border-border">
                      <img src={v.thumbnail_url || `https://img.youtube.com/vi/${v.youtube_video_id}/default.jpg`} alt="" className="w-20 h-12 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{v.title}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {v.nft_enabled && <span className="text-[10px] text-primary font-bold">NFT · ${v.nft_price} · {v.nft_max_views} view(s) · {v.nft_editions_sold || 0}{v.nft_max_editions ? `/${v.nft_max_editions}` : ""} sold</span>}
                          {(v as any).paywall_enabled && <span className="text-[10px] text-accent font-bold flex items-center gap-0.5"><DollarSign className="w-2.5 h-2.5" /> Paywall ${(v as any).paywall_price}</span>}
                          {v.recharge_enabled && <span className="text-[10px] text-accent font-bold flex items-center gap-0.5"><RefreshCw className="w-2.5 h-2.5" /> ${v.recharge_price}</span>}
                          {!v.nft_enabled && !(v as any).paywall_enabled && <span className="text-[10px] text-muted-foreground">Free</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/* Launch Collection Button */}
                        {v.nft_enabled && site?.id && !myCollections?.some((c: any) => c.video_id === v.id) && (
                          <button
                            onClick={() => {
                              if (!confirm(`Launch NFT Collection for "${v.title}"?\n\nFee: $300 (deducted from wallet)\nEditions: ${v.nft_max_editions || "1,000,000"}\nPrice: $${v.nft_price}/NFT\nSplit: 70% Creator / 30% Platform`)) return;
                              launchCollection.mutate({
                                video_id: v.id,
                                site_id: site.id,
                                title: v.title,
                                max_editions: v.nft_max_editions || 1000000,
                                price_per_nft: v.nft_price,
                                view_tier: v.nft_max_views,
                                recharge_enabled: v.recharge_enabled,
                                recharge_price: v.recharge_price,
                                thumbnail_url: v.thumbnail_url,
                              });
                            }}
                            disabled={launchCollection.isPending}
                            className="px-2 py-1.5 bg-primary/10 text-primary rounded text-[10px] font-bold hover:bg-primary/20 transition-colors flex items-center gap-1 whitespace-nowrap"
                            title="Launch NFT Collection ($300)"
                          >
                            🚀 Launch
                          </button>
                        )}
                        {myCollections?.some((c: any) => c.video_id === v.id) && (
                          <Link to="/marketplace" className="px-2 py-1.5 bg-accent/10 text-accent rounded text-[10px] font-bold flex items-center gap-1 whitespace-nowrap">
                            ✅ Live
                          </Link>
                        )}
                        <button onClick={() => deleteVideo.mutateAsync(v.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!site && <p className="text-xs text-muted-foreground italic">Save your site first, then add videos.</p>}
            </div>

            {/* Links */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2"><Link2 className="w-4 h-4 text-primary" /> Links & Social</h2>
              <SocialLinkPicker onAdd={(title, url, icon) => handleAddLink(title, url, icon)} disabled={!site?.id} />
              <div className="border-t border-border pt-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Custom Link</p>
                <div className="flex gap-2">
                  <Input value={linkTitle} onChange={e => setLinkTitle(e.target.value)} placeholder="Link title" className="flex-1" />
                  <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." className="flex-1" />
                  <button onClick={() => handleAddLink()} disabled={!linkTitle || !linkUrl || !site?.id} className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 disabled:opacity-50"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              {(links || []).map((l: any) => {
                const social = SOCIAL_NETWORKS.find(s => s.id === l.icon);
                return (
                  <div key={l.id} className="flex items-center justify-between bg-secondary/30 rounded-lg px-4 py-2 border border-border">
                    <div className="flex items-center gap-2">
                      {social ? <span style={{ color: social.color }}>{social.icon}</span> : <Link2 className="w-4 h-4 text-muted-foreground" />}
                      <div><p className="text-xs font-bold text-foreground">{l.title}</p><p className="text-[10px] text-muted-foreground truncate">{l.url}</p></div>
                    </div>
                    <button onClick={() => deleteLink.mutateAsync(l.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                );
              })}
            </div>

            {/* Address / Location */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Endereço / Localização
              </h2>
              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Cidade, Estado, País" />
            </div>

            {/* Photos Gallery */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Image className="w-4 h-4" /> Galeria de Fotos
              </h2>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground">Mostrar galeria no site</label>
                <Switch checked={showPhotos} onCheckedChange={setShowPhotos} />
              </div>
              {showPhotos && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Upload className="w-3 h-3" /> Upload Foto</label>
                    <Input type="file" accept="image/*" disabled={uploadingPhoto || !site?.id} className="text-xs" onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f || !site?.id) return;
                      setUploadingPhoto(true);
                      try {
                        const ext = f.name.split(".").pop();
                        const path = `${user!.id}/photos/${Date.now()}.${ext}`;
                        const { error } = await supabase.storage.from("platform-assets").upload(path, f, { upsert: true });
                        if (error) throw error;
                        const { data } = supabase.storage.from("platform-assets").getPublicUrl(path);
                        await addPhoto.mutateAsync({ site_id: site.id, url: data.publicUrl });
                        toast.success("Foto adicionada!");
                      } catch (err: any) { toast.error(err.message); }
                      setUploadingPhoto(false);
                    }} />
                    {uploadingPhoto && <p className="text-[10px] text-accent animate-pulse">Uploading...</p>}
                  </div>
                  {(photos || []).length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {(photos || []).map((p: any) => (
                        <div key={p.id} className="relative group">
                          <img src={p.url} alt={p.caption || ""} className="w-full aspect-square object-cover rounded-lg border border-border" />
                          <button onClick={() => deletePhoto.mutateAsync(p.id)} className="absolute top-1 right-1 p-1 bg-destructive/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Show Domains Toggle */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Store className="w-4 h-4" /> Seções Extras
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <label className="text-xs font-bold text-muted-foreground">Mostrar Domínios à Venda</label>
                  </div>
                  <Switch checked={showDomains} onCheckedChange={setShowDomains} />
                </div>
                {showDomains && (
                  <p className="text-[10px] text-muted-foreground italic">
                    {(userDomains || []).length} domínio(s) ativos serão exibidos. <a href="/domains" className="text-primary hover:underline">Gerenciar domínios →</a>
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <label className="text-xs font-bold text-muted-foreground">Mostrar Imóveis à Venda</label>
                  </div>
                  <Switch checked={showProperties} onCheckedChange={setShowProperties} />
                </div>
                {showProperties && (
                  <p className="text-[10px] text-muted-foreground italic">
                    {(userProperties || []).length} imóvel(is) ativos serão exibidos. <a href="/domains" className="text-primary hover:underline">Gerenciar imóveis →</a>
                  </p>
                )}
              </div>
            </div>

            {/* Google Auth */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-accent" /> Google Account</h2>
              <p className="text-xs text-muted-foreground">Connect your Google account to verify YouTube channel ownership.</p>
              <button onClick={handleGoogleSignIn} className="flex items-center gap-2 px-4 py-2 bg-foreground text-background font-bold text-xs rounded-lg hover:opacity-90">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Sign in with Google
              </button>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Preview</h3>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                  Tema: {currentTheme.label}
                </span>
              </div>
              <div className={`bg-gradient-to-br ${currentTheme.colors} rounded-2xl p-6 min-h-[500px] border border-border/20 shadow-xl`}>
                {/* Avatar placeholder */}
                <div className="flex flex-col items-center text-center space-y-3 mb-6">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white/90 border-2 border-white/20" style={{ backgroundColor: currentTheme.accent }}>
                    {siteName?.[0]?.toUpperCase() || "?"}
                  </div>
                  <h4 className="text-lg font-black text-white">{siteName || "Seu Nome"}</h4>
                  {bio && <p className="text-xs text-white/60 max-w-[200px]">{bio}</p>}
                </div>

                {/* Links preview */}
                <div className="space-y-2 mb-4">
                  {(links || []).slice(0, 3).map((l: any) => (
                    <div key={l.id} className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/10">
                      <Link2 className="w-3 h-3 text-white/50" />
                      <span className="text-xs text-white/80">{l.title}</span>
                    </div>
                  ))}
                  {(!links || links.length === 0) && ["Instagram", "Twitter", "YouTube"].map(name => (
                    <div key={name} className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/10">
                      <Link2 className="w-3 h-3 text-white/30" />
                      <span className="text-xs text-white/40">{name}</span>
                    </div>
                  ))}
                </div>

                {/* Videos preview */}
                {(videos || []).length > 0 && (
                  <div className={`grid gap-2 ${layoutCols === 1 ? "grid-cols-1" : layoutCols === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                    {(videos || []).slice(0, 4).map((v: any) => (
                      <div key={v.id} className="bg-white/10 rounded-lg overflow-hidden border border-white/10">
                        <img src={v.thumbnail_url || `https://img.youtube.com/vi/${v.youtube_video_id}/default.jpg`} alt="" className="w-full aspect-video object-cover" />
                        <div className="p-1.5">
                          <p className="text-[9px] text-white/80 font-bold truncate">{v.title}</p>
                          {v.nft_enabled && (
                            <span className="text-[8px] font-bold" style={{ color: currentTheme.accent }}>${v.nft_price}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CV preview */}
                {showCv && (
                  <div className="mt-4 bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-[10px] text-white/50 font-bold mb-1">📄 CV / Resume</p>
                    <p className="text-[9px] text-white/40 line-clamp-2">{cvContent || "Your experience..."}</p>
                    {contactEmail && (
                      <div className="mt-2 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-white/30" />
                        <span className="text-[9px] text-white/30">Contact locked · ${contactPrice} to unlock</span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-[8px] text-white/20 text-center mt-6">hashpo.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniSiteEditor;
