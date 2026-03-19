import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Save, Loader2, GripVertical, Type, Palette, Move, ImagePlus, X, MapPin, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Poppins', 'Raleway', 'Oswald', 'Playfair Display', 'Merriweather',
  'Nunito', 'Ubuntu', 'Rubik', 'Work Sans', 'Fira Sans',
  'Quicksand', 'Barlow', 'DM Sans', 'Josefin Sans', 'Cabin',
  'Archivo', 'Space Grotesk', 'Sora', 'Outfit', 'Plus Jakarta Sans',
  'Bebas Neue', 'Lobster', 'Pacifico', 'Dancing Script', 'Righteous',
  'Comfortaa', 'Satisfy', 'Permanent Marker', 'Fredoka One', 'Titan One',
];

const MODULE_LABELS: Record<string, string> = {
  video: '🎬 Vídeo',
  bio: '📝 Bio & Skills',
  links: '🔗 Links',
  cv: '💼 CV (Experiência / Educação)',
  contact: '📞 Contato',
  portfolio: '🎥 Portfólio de Vídeos',
  posts: '💬 Posts / Feed',
  classificados: '📋 Classificados',
  boost: '🚀 Boost',
  map: '📍 Mapa / Localização',
  social: '🌐 Redes Sociais',
  slugs: '🏷️ Slugs à venda',
};

const DEFAULT_MODULES = ['video', 'bio', 'links', 'social', 'cv', 'contact', 'portfolio', 'posts', 'boost', 'map'];

const COLOR_PRESETS = [
  { name: '🌑 Escuro Clássico', bg: '#1a1a2e', card: '#16213e', text: '#e0e0e0', heading: '#ffffff', accent: '#e94560' },
  { name: '☀️ Branco Limpo', bg: '#ffffff', card: '#f8f9fa', text: '#333333', heading: '#111111', accent: '#6366f1' },
  { name: '🌊 Oceano', bg: '#0a192f', card: '#112240', text: '#8892b0', heading: '#ccd6f6', accent: '#64ffda' },
  { name: '🌸 Rosa Suave', bg: '#fff5f5', card: '#ffffff', text: '#4a4a4a', heading: '#2d2d2d', accent: '#e91e63' },
  { name: '🍊 Laranja Vibrante', bg: '#fff8f0', card: '#ffffff', text: '#333333', heading: '#1a1a1a', accent: '#ff6b35' },
  { name: '💚 Verde Neon', bg: '#0d1117', card: '#161b22', text: '#c9d1d9', heading: '#f0f6fc', accent: '#39d353' },
  { name: '💜 Roxo Profundo', bg: '#13111c', card: '#1e1b2e', text: '#b4b4cc', heading: '#e8e8f0', accent: '#a855f7' },
  { name: '🌅 Sunset', bg: '#1a1423', card: '#2d1b3d', text: '#d4c5e2', heading: '#f5e6ff', accent: '#ff7eb3' },
  { name: '🏖️ Praia', bg: '#fef9ef', card: '#ffffff', text: '#5c4b37', heading: '#2c1810', accent: '#f4a261' },
  { name: '❄️ Gelo Azul', bg: '#f0f4f8', card: '#ffffff', text: '#334155', heading: '#0f172a', accent: '#0ea5e9' },
  { name: '🔥 Vermelho Escuro', bg: '#1c1917', card: '#292524', text: '#d6d3d1', heading: '#fafaf9', accent: '#ef4444' },
  { name: '🌿 Natureza', bg: '#fafdf7', card: '#ffffff', text: '#3d5a3d', heading: '#1a3a1a', accent: '#22c55e' },
];

export interface SocialLink {
  platform: string;
  url: string;
}

export interface MiniSitePageCustomization {
  id: string;
  title: string;
  module_order: string[];
  layout: 1 | 2 | 3;
}

export interface SiteCustomization {
  font_family: string;
  body_font_size: number;
  heading_font_size: number;
  text_color: string;
  heading_color: string;
  accent_color: string;
  bg_color: string;
  card_bg_color: string;
  map_embed_url: string;
  map_address?: string;
  social_links: SocialLink[];
  photo_size: number;
  /** 'square' | 'round' - estilo da foto de perfil */
  photo_style?: 'square' | 'round';
  template_id?: string;

  /**
   * Novo modelo: múltiplas páginas.
   * Se `pages` não existir (legado), caímos para:
   * - `layout` e `module_order` (campos antigos) usados como "Page 1".
   */
  pages?: MiniSitePageCustomization[];

  // Legado (mantemos para compatibilidade com dados antigos)
  module_order?: string[];
  layout?: 1 | 2 | 3;
}

const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/usuario' },
  { id: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/usuario' },
  { id: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@canal' },
  { id: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@usuario' },
  { id: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/usuario' },
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/usuario' },
  { id: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/5511999999999' },
  { id: 'telegram', label: 'Telegram', placeholder: 'https://t.me/usuario' },
  { id: 'pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/usuario' },
  { id: 'github', label: 'GitHub', placeholder: 'https://github.com/usuario' },
  { id: 'dribbble', label: 'Dribbble', placeholder: 'https://dribbble.com/usuario' },
  { id: 'behance', label: 'Behance', placeholder: 'https://behance.net/usuario' },
  { id: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/artist/...' },
  { id: 'twitch', label: 'Twitch', placeholder: 'https://twitch.tv/usuario' },
  { id: 'website', label: 'Website', placeholder: 'https://meusite.com' },
];

const DEFAULT_CUSTOMIZATION: SiteCustomization = {
  font_family: '',
  body_font_size: 16,
  heading_font_size: 28,
  text_color: '',
  heading_color: '',
  accent_color: '',
  bg_color: '',
  card_bg_color: '',
  map_embed_url: '',
  map_address: '',
  social_links: [],
  photo_size: 112,
  photo_style: 'round',
  pages: [
    {
      id: 'page-1',
      title: 'Page 1',
      module_order: DEFAULT_MODULES,
      layout: 1,
    },
  ],
};

interface MiniSiteEditorProps {
  userId: string;
  initialCustomization?: Partial<SiteCustomization>;
  bannerUrl?: string | null;
  onBannerUploaded?: (url: string | null) => void;
}

const MiniSiteEditor = ({ userId, initialCustomization, bannerUrl, onBannerUploaded }: MiniSiteEditorProps) => {
  const [customization, setCustomization] = useState<SiteCustomization>(() => {
    const legacyModuleOrder =
      initialCustomization?.module_order?.length ? initialCustomization.module_order : DEFAULT_MODULES;
    const legacyLayout = initialCustomization?.layout ?? 1;

    const initialPages = (initialCustomization as any)?.pages;
    const pages: MiniSitePageCustomization[] =
      Array.isArray(initialPages) && initialPages.length
        ? initialPages.map((p: any, idx: number) => ({
            id: String(p.id ?? `page-${idx + 1}`),
            title: String(p.title ?? `Page ${idx + 1}`),
            module_order: Array.isArray(p.module_order) && p.module_order.length ? p.module_order : legacyModuleOrder,
            layout: ([1, 2, 3].includes(p.layout) ? p.layout : legacyLayout) as 1 | 2 | 3,
          }))
        : [
            {
              id: 'page-1',
              title: 'Page 1',
              module_order: legacyModuleOrder,
              layout: legacyLayout as 1 | 2 | 3,
            },
          ];

    return {
      ...DEFAULT_CUSTOMIZATION,
      ...initialCustomization,
      pages,
      // legado (mantém os campos antigos para fallback em outros componentes)
      module_order: legacyModuleOrder,
      layout: legacyLayout as 1 | 2 | 3,
      social_links: (initialCustomization as any)?.social_links || [],
      map_embed_url: (initialCustomization as any)?.map_embed_url || '',
      map_address: (initialCustomization as any)?.map_address || '',
      photo_size: (initialCustomization as any)?.photo_size || 112,
      photo_style: (initialCustomization as any)?.photo_style || 'round',
    };
  });
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [addModuleValue, setAddModuleValue] = useState('');
  const [activePageIndex, setActivePageIndex] = useState(0);

  const update = (field: keyof SiteCustomization, value: any) => {
    setCustomization(prev => ({ ...prev, [field]: value }));
  };

  const activePage = customization.pages?.[activePageIndex] ?? null;

  const updateActivePage = (field: keyof MiniSitePageCustomization, value: any) => {
    setCustomization((prev) => {
      const pages = prev.pages ? [...prev.pages] : [];
      if (!pages.length) return prev;
      const page = pages[activePageIndex];
      pages[activePageIndex] = { ...page, [field]: value };

      // Compatibilidade legado: se a edição for da Page 1, atualiza também os campos antigos.
      if (activePageIndex === 0) {
        const next: SiteCustomization = {
          ...prev,
          pages,
          module_order: field === 'module_order' ? (value as any) : prev.module_order,
          layout: field === 'layout' ? (value as any) : prev.layout,
        };
        return next;
      }

      return { ...prev, pages };
    });
  };

  const addPage = () => {
    setCustomization((prev) => {
      const pages = prev.pages ? [...prev.pages] : [];
      if (pages.length >= 10) return prev;

      const nextIndex = pages.length + 1;
      pages.push({
        id: `page-${Date.now()}-${nextIndex}`,
        title: `Page ${nextIndex}`,
        module_order: DEFAULT_MODULES,
        layout: 1,
      });

      return { ...prev, pages };
    });
    setActivePageIndex((i) => Math.min(9, i + 1));
  };

  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setCustomization(prev => ({
      ...prev,
      bg_color: preset.bg,
      card_bg_color: preset.card,
      text_color: preset.text,
      heading_color: preset.heading,
      accent_color: preset.accent,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    console.log('[v0] MiniSiteEditor - iniciando save, userId:', userId);
    try {
      const payload: Record<string, any> = {};
      Object.entries(customization).forEach(([k, v]) => {
        if (Array.isArray(v)) payload[k] = v;
        else if (typeof v === 'string' && v !== '') payload[k] = v;
        else if (typeof v === 'number') payload[k] = v;
      });
      console.log('[v0] MiniSiteEditor - payload a salvar:', payload);

      const { error, data } = await supabase
        .from('profiles')
        .update({ site_customization: payload } as any)
        .eq('user_id', userId)
        .select();
      console.log('[v0] MiniSiteEditor - resultado save:', { error, data });
      if (error) throw error;
      toast.success('Customizações salvas!');
    } catch (e: any) {
      console.error('[v0] MiniSiteEditor - erro ao salvar:', e);
      toast.error(e.message);
    }
    setSaving(false);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('[v0] MiniSiteEditor - banner selecionado:', file?.name, file?.size);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Banner deve ter no máximo 5MB');
      return;
    }
    setUploadingBanner(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${userId}/banner.${ext}`;
      console.log('[v0] MiniSiteEditor - tentando upload banner para:', path);
      const { error: upErr, data: uploadData } = await supabase.storage
        .from('profile-photos')
        .upload(path, file, { upsert: true });
      console.log('[v0] MiniSiteEditor - resultado upload banner:', { error: upErr, data: uploadData });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(path);
      console.log('[v0] MiniSiteEditor - URL banner:', publicUrl);
      
      const { error: updateErr } = await supabase.from('profiles').update({ banner_url: publicUrl } as any).eq('user_id', userId);
      console.log('[v0] MiniSiteEditor - resultado update banner:', { error: updateErr });
      onBannerUploaded?.(publicUrl);
      toast.success('Banner atualizado!');
    } catch (err: any) {
      console.error('[v0] MiniSiteEditor - erro banner:', err);
      toast.error(err.message);
    }
    setUploadingBanner(false);
  };

  const removeBanner = async () => {
    await supabase.from('profiles').update({ banner_url: null } as any).eq('user_id', userId);
    onBannerUploaded?.(null);
    toast.success('Banner removido');
  };

  const loadFont = (fontName: string) => {
    if (!fontName) return;
    const id = `gf-${fontName.replace(/\s/g, '-')}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;600;700&display=swap`;
    document.head.appendChild(link);
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); setDragOverIndex(index); };
  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) { setDraggedIndex(null); setDragOverIndex(null); return; }
    const baseOrder = activePage?.module_order ?? DEFAULT_MODULES;
    const newOrder = [...baseOrder];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, removed);
    updateActivePage('module_order', newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => { setDraggedIndex(null); setDragOverIndex(null); };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...customization.social_links];
    updated[index] = { ...updated[index], [field]: value };
    update('social_links', updated);
  };
  const addSocialLink = () => {
    update('social_links', [...customization.social_links, { platform: 'instagram', url: '' }]);
  };
  const removeSocialLink = (index: number) => {
    update('social_links', customization.social_links.filter((_, i) => i !== index));
  };

  if (customization.font_family) loadFont(customization.font_family);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">🎨 Editor do Mini-Site</h2>
        <p className="text-sm text-muted-foreground">Personalize cores, fontes, tamanho da foto, banner, redes sociais e módulos.</p>
      </div>

      {/* PAGES (até 10) */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-semibold">Páginas</p>
              <p className="text-xs text-muted-foreground">Selecione a página para editar módulos e layout.</p>
            </div>

            <Select
              value={String(activePageIndex)}
              onValueChange={(v) => setActivePageIndex(Math.max(0, Math.min(9, parseInt(v, 10) || 0)))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Escolha a página" />
              </SelectTrigger>
              <SelectContent>
                {(customization.pages || []).map((p, idx) => (
                  <SelectItem key={p.id} value={String(idx)}>
                    {idx + 1}. {p.title || `Page ${idx + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="button" variant="outline" size="sm" onClick={addPage} disabled={(customization.pages || []).length >= 10}>
            + Adicionar página (até 10)
          </Button>
        </div>
      </div>

      <Tabs defaultValue="fonts">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="fonts" className="gap-1.5"><Type className="h-4 w-4" /> Fontes & Foto</TabsTrigger>
          <TabsTrigger value="colors" className="gap-1.5"><Palette className="h-4 w-4" /> Cores</TabsTrigger>
          <TabsTrigger value="banner" className="gap-1.5"><ImagePlus className="h-4 w-4" /> Banner</TabsTrigger>
          <TabsTrigger value="social" className="gap-1.5"><Link2 className="h-4 w-4" /> Redes</TabsTrigger>
          <TabsTrigger value="map" className="gap-1.5"><MapPin className="h-4 w-4" /> Mapa</TabsTrigger>
          <TabsTrigger value="modules" className="gap-1.5"><Move className="h-4 w-4" /> Módulos</TabsTrigger>
        </TabsList>

        {/* FONTS & PHOTO TAB */}
        <TabsContent value="fonts" className="space-y-5">
          <div>
            <Label>Família da Fonte ({GOOGLE_FONTS.length} opções)</Label>
            <Select value={customization.font_family || '__default__'} onValueChange={(v) => { const val = v === '__default__' ? '' : v; update('font_family', val); if (val) loadFont(val); }}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Padrão do template" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="__default__">Padrão do template</SelectItem>
                {GOOGLE_FONTS.map(f => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {customization.font_family && (
            <div className="rounded-lg border border-border p-4 text-center" style={{ fontFamily: `'${customization.font_family}', sans-serif` }}>
              <p className="text-lg font-bold">Preview: {customization.font_family}</p>
              <p className="text-sm text-muted-foreground">AaBbCcDdEeFfGg 0123456789</p>
            </div>
          )}

          <div>
            <Label>Tamanho do Texto do Corpo: {customization.body_font_size}px</Label>
            <Slider className="mt-2" min={12} max={28} step={1} value={[customization.body_font_size]} onValueChange={([v]) => update('body_font_size', v)} />
          </div>
          <div>
            <Label>Tamanho dos Títulos (H1/H2): {customization.heading_font_size}px</Label>
            <Slider className="mt-2" min={18} max={72} step={1} value={[customization.heading_font_size]} onValueChange={([v]) => update('heading_font_size', v)} />
          </div>

          <div>
            <Label>Tamanho da Foto de Perfil: {customization.photo_size}px</Label>
            <Slider className="mt-2" min={60} max={200} step={4} value={[customization.photo_size]} onValueChange={([v]) => update('photo_size', v)} />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>60px (Pequena)</span>
              <span>200px (Grande)</span>
            </div>
          </div>
          <div>
            <Label>Estilo da Foto</Label>
            <div className="flex gap-2 mt-2">
              <Button type="button" variant={(customization as any).photo_style === 'round' ? 'default' : 'outline'} size="sm" onClick={() => update('photo_style', 'round')}>
                Redondo
              </Button>
              <Button type="button" variant={(customization as any).photo_style === 'square' ? 'default' : 'outline'} size="sm" onClick={() => update('photo_style', 'square')}>
                Quadrado
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* COLORS TAB */}
        <TabsContent value="colors" className="space-y-5">
          <div>
            <Label className="mb-2 block">Presets de Cores (Apple Glass)</Label>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
              {COLOR_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="flex items-center gap-2 rounded-xl border border-border/60 p-2.5 hover:border-primary/60 transition-all text-left text-xs backdrop-blur-sm"
                  style={{ background: `linear-gradient(135deg, ${preset.bg}22, ${preset.card}44)` }}
                >
                  <div className="flex gap-0.5 shrink-0">
                    {[preset.bg, preset.accent, preset.heading, preset.text].map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border border-border/50" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { key: 'text_color', label: 'Cor do Texto' },
              { key: 'heading_color', label: 'Cor dos Títulos' },
              { key: 'accent_color', label: 'Cor de Destaque (Accent)' },
              { key: 'bg_color', label: 'Cor de Fundo' },
              { key: 'card_bg_color', label: 'Cor do Card (Glass)' },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={(customization as any)[key] || '#000000'}
                    onChange={(e) => update(key as keyof SiteCustomization, e.target.value)}
                    className="h-10 w-14 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={(customization as any)[key] || ''}
                    placeholder="Padrão do template"
                    onChange={(e) => update(key as keyof SiteCustomization, e.target.value)}
                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm font-mono"
                  />
                  {(customization as any)[key] && (
                    <Button variant="ghost" size="sm" onClick={() => update(key as keyof SiteCustomization, '')}>
                      Limpar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Live preview */}
          <div
            className="rounded-2xl border border-white/10 p-6 text-center"
            style={{
              backgroundColor: customization.bg_color || '#ffffff',
              color: customization.text_color || '#333333',
              fontFamily: customization.font_family ? `'${customization.font_family}', sans-serif` : undefined,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ color: customization.heading_color || customization.text_color || '#000', fontSize: `${customization.heading_font_size}px`, fontWeight: 700 }}>
              Preview do Título
            </h3>
            <p style={{ fontSize: `${customization.body_font_size}px`, marginTop: '0.5rem' }}>
              Este é um texto de exemplo para visualizar suas cores e fontes.
            </p>
            <div
              className="inline-block mt-3 rounded-full px-6 py-2 text-sm font-semibold"
              style={{
                backgroundColor: customization.accent_color || '#6366f1',
                color: '#fff',
              }}
            >
              Botão de Destaque
            </div>
          </div>
        </TabsContent>

        {/* BANNER TAB */}
        <TabsContent value="banner" className="space-y-4">
          <p className="text-sm text-muted-foreground">Adicione um banner tipo X/Twitter ao topo do seu mini-site (1500x500 recomendado).</p>
          {bannerUrl && (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img src={bannerUrl} alt="Banner" className="w-full h-40 object-cover" />
              <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={removeBanner}>
                <X className="h-3 w-3 mr-1" /> Remover
              </Button>
            </div>
          )}
          <div>
            <Label>Upload de Banner</Label>
            <Input type="file" accept="image/*" onChange={handleBannerUpload} disabled={uploadingBanner} className="mt-1.5" />
            {uploadingBanner && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Enviando...</p>}
          </div>
        </TabsContent>

        {/* SOCIAL TAB */}
        <TabsContent value="social" className="space-y-4">
          <p className="text-sm text-muted-foreground">Adicione links de redes sociais ao seu mini-site.</p>
          {customization.social_links.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <Select value={link.platform} onValueChange={(v) => updateSocialLink(i, 'platform', v)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_PLATFORMS.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={link.url}
                onChange={(e) => updateSocialLink(i, 'url', e.target.value)}
                placeholder={SOCIAL_PLATFORMS.find(p => p.id === link.platform)?.placeholder || 'URL'}
                className="flex-1"
              />
              <Button variant="ghost" size="icon" onClick={() => removeSocialLink(i)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addSocialLink}>
            + Adicionar Rede Social
          </Button>
        </TabsContent>

        {/* MAP TAB */}
        <TabsContent value="map" className="space-y-4">
          <p className="text-sm text-muted-foreground">Cole a URL de embed do Google Maps para mostrar sua localização.</p>
          <div>
            <Label>URL do Google Maps Embed</Label>
            <Input
              value={customization.map_embed_url}
              onChange={(e) => update('map_embed_url', e.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Endereço (para link clicável)</Label>
            <Input
              value={customization.map_address || ''}
              onChange={(e) => update('map_address', e.target.value)}
              placeholder="Ex: 1600 Amphitheatre Parkway, Mountain View, CA"
              className="mt-1.5"
            />
          </div>
          {customization.map_embed_url && (
            <div className="rounded-xl overflow-hidden border border-border">
              <iframe src={customization.map_embed_url} width="100%" height="200" style={{ border: 0 }} loading="lazy" />
            </div>
          )}
        </TabsContent>

        {/* MODULES TAB */}
        <TabsContent value="modules" className="space-y-4">
          <div>
            <Label>Layout em colunas</Label>
            <p className="text-xs text-muted-foreground mb-1.5">Escolha quantas colunas os módulos usam na página.</p>
            <div className="flex gap-2 mt-1.5">
              {([1, 2, 3] as const).map((cols) => (
                <button
                  key={cols}
                  type="button"
                  onClick={() => updateActivePage('layout', cols)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    (activePage?.layout ?? 1) === cols
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card hover:bg-muted/50'
                  }`}
                >
                  {cols} coluna{cols > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Arraste para reordenar. Adicione ou remova módulos.</p>
          <Select
            value={addModuleValue}
            onValueChange={(v) => {
              if (v) {
                const baseOrder = activePage?.module_order ?? DEFAULT_MODULES;
                updateActivePage('module_order', [...baseOrder, v]);
                setAddModuleValue('');
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-48 mt-1">
              <SelectValue placeholder="+ Adicionar módulo" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(MODULE_LABELS)
                .filter(id => !(activePage?.module_order ?? DEFAULT_MODULES).includes(id))
                .map(id => (
                  <SelectItem key={id} value={id}>{MODULE_LABELS[id]}</SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="space-y-1.5 mt-2">
            {(activePage?.module_order ?? DEFAULT_MODULES).map((moduleId, index) => (
              <div
                key={moduleId}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-grab transition-all ${
                  dragOverIndex === index ? 'border-primary bg-primary/5' : 'border-border bg-card'
                } ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm flex-1">{MODULE_LABELS[moduleId] || moduleId}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => {
                    const baseOrder = activePage?.module_order ?? DEFAULT_MODULES;
                    updateActivePage('module_order', baseOrder.filter((_, i) => i !== index));
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Button onClick={handleSave} disabled={saving} className="gap-2 w-full sm:w-auto">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Salvar Customizações
      </Button>
    </div>
  );
};

export default MiniSiteEditor;
