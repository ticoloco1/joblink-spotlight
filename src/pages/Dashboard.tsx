import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { STRIPE_PRODUCTS } from '@/lib/stripe-products';
import { Loader2, Save, Eye, Star, Briefcase, Crown, CreditCard, ExternalLink, Wallet, Globe, Coins } from 'lucide-react';
import AvatarUpload from '@/components/AvatarUpload';
import MiniSiteEditor from '@/components/MiniSiteEditor';
import TemplateSelector from '@/components/TemplateSelector';
import SellSlugCard from '@/components/SellSlugCard';
import MySlugsPanel from '@/components/MySlugsPanel';
import DashboardSlugBar from '@/components/DashboardSlugBar';
import { getProfileUrl } from '@/lib/baseUrl';
import { templates, MiniSiteTemplate, getTemplateById } from '@/data/templates';

interface ProfileForm {
  name: string;
  title: string;
  bio: string;
  location: string;
  skills: string;
  contact_email: string;
  contact_phone: string;
  contact_linkedin: string;
  is_published: boolean;
  video_url: string | null;
  wallet_address: string;
  paywall_enabled: boolean;
  paywall_mode: 'none' | 'videos' | 'full';
  paywall_interval: 'monthly' | 'daily';
  paywall_price_cents: number;
  minisite_paid_until?: string | null;
  minisite_plan?: 'none' | 'monthly' | 'annual';
}

const Dashboard = () => {
  const { user, loading: authLoading, subscriptions, checkSubscription } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<ProfileForm | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [userType, setUserType] = useState('seeker');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [credits, setCredits] = useState(0);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [siteCustomization, setSiteCustomization] = useState<any>({});
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MiniSiteTemplate>(templates[0]);
  const [topupTx, setTopupTx] = useState('');
  const [toppingUp, setToppingUp] = useState(false);
  const [billing, setBilling] = useState<{ minisite_monthly_credits: number; minisite_annual_credits: number; paywall_default_monthly_cents: number; paywall_default_daily_cents: number }>({
    minisite_monthly_credits: 999,
    minisite_annual_credits: 7999,
    paywall_default_monthly_cents: 999,
    paywall_default_daily_cents: 199,
  });
  const [payingMinisite, setPayingMinisite] = useState<'monthly' | 'annual' | null>(null);
  const bioRef = useRef<HTMLTextAreaElement | null>(null);

  const insertBioMarkup = (open: string, close: string) => {
    if (!profile) return;
    const textarea = bioRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? start;
    const before = profile.bio.slice(0, start);
    const selected = profile.bio.slice(start, end);
    const after = profile.bio.slice(end);

    const wrapped = selected.length ? `${open}${selected}${close}` : `${open}${close}`;
    const nextBio = before + wrapped + after;

    if (nextBio.length > 200) {
      toast.error('Bio no máximo 200 caracteres');
      return;
    }

    setProfile({ ...profile, bio: nextBio });

    // Ajusta o cursor depois do state
    const cursorPos = selected.length ? before.length + open.length + selected.length + close.length : before.length + open.length;
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = cursorPos;
      textarea.focus();
    }, 0);
  };

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      toast.success('Assinatura realizada com sucesso!');
      checkSubscription();
    }
    if (searchParams.get('pin') === 'success') {
      const postId = searchParams.get('post_id');
      if (postId) {
        const pinPost = async () => {
          const pinnedUntil = new Date();
          pinnedUntil.setDate(pinnedUntil.getDate() + 365);
          await supabase
            .from('posts')
            .update({
              is_pinned: true,
              pinned_until: pinnedUntil.toISOString(),
              expires_at: pinnedUntil.toISOString(),
            } as any)
            .eq('id', postId);
          toast.success('Post fixado por 365 dias!');
        };
        pinPost();
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user) loadProfile();
  }, [user, authLoading]);

  const loadProfile = async () => {
    // billing settings
    supabase.from('platform_settings').select('key, value').in('key', [
      'minisite_monthly_credits',
      'minisite_annual_credits',
      'paywall_default_monthly_cents',
      'paywall_default_daily_cents',
    ]).then(({ data }) => {
      if (!data) return;
      const map: any = {};
      data.forEach((s: any) => { map[s.key] = s.value; });
      setBilling((prev) => ({
        ...prev,
        minisite_monthly_credits: parseInt(map.minisite_monthly_credits || String(prev.minisite_monthly_credits), 10),
        minisite_annual_credits: parseInt(map.minisite_annual_credits || String(prev.minisite_annual_credits), 10),
        paywall_default_monthly_cents: parseInt(map.paywall_default_monthly_cents || String(prev.paywall_default_monthly_cents), 10),
        paywall_default_daily_cents: parseInt(map.paywall_default_daily_cents || String(prev.paywall_default_daily_cents), 10),
      }));
    });

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user!.id)
      .single();

    if (data) {
      setProfile({
        name: data.name,
        title: data.title || '',
        bio: data.bio || '',
        location: data.location || '',
        skills: (data.skills || []).join(', '),
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        contact_linkedin: data.contact_linkedin || '',
        is_published: data.is_published || false,
        video_url: data.video_url,
        wallet_address: (data as any).wallet_address || '',
        paywall_enabled: (data as any).paywall_enabled || false,
        paywall_mode: ((data as any).paywall_mode || 'none') as any,
        paywall_interval: ((data as any).paywall_interval || 'monthly') as any,
        paywall_price_cents: (data as any).paywall_price_cents || 0,
        minisite_paid_until: (data as any).minisite_paid_until || null,
        minisite_plan: ((data as any).minisite_plan || 'none') as any,
      });
      setProfileId(data.id);
      setSlug(data.slug);
      setUserType(data.user_type);
      setCredits(data.credits || 0);
      setPhotoUrl(data.photo_url || null);
      setSiteCustomization((data as any).site_customization || {});
      setBannerUrl((data as any).banner_url || null);
      // Load saved template
      const savedTemplateId = ((data as any).site_customization as any)?.template_id;
      if (savedTemplateId) {
        const tmpl = getTemplateById(savedTemplateId);
        if (tmpl) setSelectedTemplate(tmpl);
      }
    }
    setLoading(false);
  };

  // Se está publicado mas minisite_paid_until venceu, despublica (mensalidade obrigatória via créditos)
  useEffect(() => {
    if (!user || !profileId || !profile?.is_published) return;
    const until = profile.minisite_paid_until ? new Date(profile.minisite_paid_until).getTime() : 0;
    if (!until || until < Date.now()) {
      supabase.from('profiles').update({ is_published: false, minisite_plan: 'none' } as any).eq('id', profileId).then(() => {
        setProfile((prev) => (prev ? { ...prev, is_published: false, minisite_plan: 'none' } : prev));
        toast.error('Seu perfil foi despublicado: a mensalidade do mini-site venceu.');
      });
    }
  }, [user?.id, profileId, profile?.is_published, profile?.minisite_paid_until]);

  const handlePayMinisite = async (plan: 'monthly' | 'annual') => {
    setPayingMinisite(plan);
    try {
      const { data, error } = await supabase.rpc('pay_minisite_with_credits', { _plan: plan } as any);
      if (error) throw error;
      const dataAny = data as any;
      if (dataAny?.ok) {
        toast.success(plan === 'monthly' ? 'Mensalidade paga! Seu mini-site foi publicado.' : 'Anuidade paga! Seu mini-site foi publicado.');
        await loadProfile();
      } else {
        toast.error('Créditos insuficientes. Faça um topup via USDC.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Erro ao pagar');
    } finally {
      setPayingMinisite(null);
    }
  };

  const handleSave = async () => {
    if (!profile || !user) return;
    if (profile.is_published) {
      const until = profile.minisite_paid_until ? new Date(profile.minisite_paid_until).getTime() : 0;
      if (!until || until < Date.now()) {
        toast.error('Para publicar, pague a mensalidade do mini-site com créditos.');
        return;
      }
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        location: profile.location,
        skills: profile.skills.split(',').map(s => s.trim()).filter(Boolean),
        contact_email: profile.contact_email,
        contact_phone: profile.contact_phone,
        contact_linkedin: profile.contact_linkedin,
        is_published: profile.is_published,
        wallet_address: profile.wallet_address || null,
        paywall_enabled: profile.paywall_enabled,
        paywall_mode: profile.paywall_mode,
        paywall_interval: profile.paywall_interval,
        paywall_price_cents: profile.paywall_price_cents,
        minisite_paid_until: profile.minisite_paid_until || null,
        minisite_plan: profile.minisite_plan || 'none',
      } as any)
      .eq('user_id', user.id);

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Perfil salvo!');
    }
  };

  const handleSelectTemplate = async (tmpl: MiniSiteTemplate) => {
    setSelectedTemplate(tmpl);
    // Save template_id into site_customization
    const updatedCustomization = { ...siteCustomization, template_id: tmpl.id };
    setSiteCustomization(updatedCustomization);
    await supabase
      .from('profiles')
      .update({ site_customization: updatedCustomization } as any)
      .eq('user_id', user!.id);
    toast.success(`Template "${tmpl.name}" aplicado!`);
  };

  const handleCheckout = async (priceId: string) => {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { priceId },
    });
    if (error) { toast.error(error.message); return; }
    if (data?.url) window.open(data.url, '_blank');
  };

  const handleTopUp = async () => {
    if (!topupTx.trim()) return;
    setToppingUp(true);
    try {
      const { data, error } = await supabase.functions.invoke('blockchain-credit-from-tx', {
        body: { tx_hash: topupTx.trim(), network: 'polygon' },
      });
      if (error) throw error;
      if (data?.ok) {
        toast.success(`Créditos adicionados: ${data.credits_added}`);
        setCredits(data.balance_after || credits);
        setTopupTx('');
      } else {
        toast.error(data?.error || 'Falha ao creditar');
      }
    } catch (e: any) {
      toast.error(e.message || 'Erro no topup');
    } finally {
      setToppingUp(false);
    }
  };

  const handleManageSubscription = async () => {
    const { data, error } = await supabase.functions.invoke('customer-portal');
    if (error) { toast.error(error.message); return; }
    if (data?.url) window.open(data.url, '_blank');
  };

  const hasSubscription = (productId: string) =>
    subscriptions.some(s => s.product_id === productId);

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  if (!profile) return null;

  const prefix = userType === 'company' ? 'c' : 'u';

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-10">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <a href={getProfileUrl(slug, userType === 'company')} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" /> Ver Perfil
              </Button>
            </a>
          </div>

          {/* Profile Form */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card mb-8">
            <h2 className="text-xl font-semibold mb-6">Editar Perfil</h2>
            <DashboardSlugBar
              userId={user!.id}
              profileId={profileId}
              currentSlug={slug}
              userType={userType}
              onSlugSwitched={() => loadProfile()}
            />
            <div className="flex justify-center mb-6">
              <AvatarUpload
                userId={user!.id}
                currentUrl={photoUrl}
                name={profile.name}
                onUploaded={(url) => setPhotoUrl(url)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="title">Título Profissional</Label>
                <Input id="title" value={profile.title} onChange={e => setProfile({ ...profile, title: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="location">Localização</Label>
                <Input id="location" value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="skills">Skills (separadas por vírgula)</Label>
                <Input id="skills" value={profile.skills} onChange={e => setProfile({ ...profile, skills: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <div className="mb-2">
                  <Label htmlFor="bio">
                    Bio ({profile.bio.length}/200) — use botões: `H1`, `H2`, `H3`, `Parágrafo` e `Bold` + links (http/https/www) + emojis 😎🔥
                  </Label>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => insertBioMarkup('[[h1]]', '[[/h1]]')} className="h-8">
                      H1
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => insertBioMarkup('[[h2]]', '[[/h2]]')} className="h-8">
                      H2
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => insertBioMarkup('[[h3]]', '[[/h3]]')} className="h-8">
                      H3
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => insertBioMarkup('[[p]]', '[[/p]]')} className="h-8">
                      Parágrafo
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => insertBioMarkup('**', '**')} className="h-8">
                      Bold
                    </Button>
                  </div>
                </div>
                <Textarea
                  ref={bioRef}
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) setProfile({ ...profile, bio: e.target.value });
                  }}
                  rows={3}
                  maxLength={200}
                  placeholder="Ex: [[h1]]Meu CV[[/h1]]\n[[p]]**Resumo**: etc... https://site.com"
                />
              </div>
              <div>
                <Label htmlFor="email">Email de contato</Label>
                <Input id="email" value={profile.contact_email} onChange={e => setProfile({ ...profile, contact_email: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={profile.contact_phone} onChange={e => setProfile({ ...profile, contact_phone: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input id="linkedin" value={profile.contact_linkedin} onChange={e => setProfile({ ...profile, contact_linkedin: e.target.value })} />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={profile.is_published}
                  onChange={e => setProfile({ ...profile, is_published: e.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="published">Publicar perfil no diretório</Label>
              </div>
            </div>

            {/* Paywall OnlyFans style (opcional) */}
            <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">Paywall (OnlyFans style)</p>
                  <p className="text-xs text-muted-foreground">Ative para cobrar acesso ao mini-site inteiro (mensal ou diário). Comissão da plataforma: 20%.</p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.paywall_enabled}
                  onChange={(e) => setProfile({ ...profile, paywall_enabled: e.target.checked, paywall_mode: e.target.checked ? 'full' : 'none' })}
                  className="h-4 w-4 rounded border-border"
                />
              </div>
              {profile.paywall_enabled && (
                <div className="mt-4 grid gap-3 sm:grid-cols-3 items-end">
                  <div>
                    <Label className="text-xs">Cobrança</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Button type="button" size="sm" variant={profile.paywall_interval === 'monthly' ? 'default' : 'outline'} onClick={() => setProfile({ ...profile, paywall_interval: 'monthly' })}>
                        Mensal
                      </Button>
                      <Button type="button" size="sm" variant={profile.paywall_interval === 'daily' ? 'default' : 'outline'} onClick={() => setProfile({ ...profile, paywall_interval: 'daily' })}>
                        Diário
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Preço (USD)</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      className="mt-1.5"
                      value={((profile.paywall_price_cents || (profile.paywall_interval === 'monthly' ? billing.paywall_default_monthly_cents : billing.paywall_default_daily_cents)) / 100).toFixed(2)}
                      onChange={(e) => {
                        const n = parseFloat(e.target.value.replace(',', '.'));
                        setProfile({ ...profile, paywall_price_cents: Number.isFinite(n) ? Math.round(n * 100) : 0 });
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {profile.paywall_interval === 'monthly' ? 'Assinatura mensal obrigatória' : 'Pagamento diário (24h)'}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                Salvar Perfil
              </Button>
            </div>
            <MySlugsPanel
              userId={user!.id}
              profileId={profileId}
              currentSlug={slug}
              userType={userType}
              onSlugSwitched={() => loadProfile()}
            />
          </section>

          {/* Template Selector */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card mb-8">
            <h2 className="text-xl font-semibold mb-4">🎨 Escolher Template</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Selecione um template para o seu mini-site. A escolha é salva automaticamente.
            </p>
            <TemplateSelector selectedId={selectedTemplate.id} onSelect={handleSelectTemplate} />
          </section>

          {/* Video Section */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card mb-8">
            <h2 className="text-xl font-semibold mb-4">Vídeo Profissional</h2>
            <p className="text-muted-foreground mb-4">Grave ou envie vídeos profissionais hospedados em CDN global com Bunny.net.</p>
            <Button asChild variant="outline">
              <a href="/videos">
                <ExternalLink className="h-4 w-4 mr-2" /> Ir para Vídeos
              </a>
            </Button>
          </section>

          {/* Blockchain Wallet */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Carteira Polygon (Blockchain)</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-1">
              Cadastre seu endereço Polygon para receber créditos automaticamente ao enviar USDC ou MATIC para nossa carteira.
            </p>
            <p className="text-sm font-medium mb-1">
              Seu saldo de créditos: <span className="text-primary font-bold">{credits} créditos</span> <span className="text-xs text-muted-foreground">(= ${(credits / 100).toFixed(2)})</span>
            </p>
            <div className="mt-4 rounded-xl bg-muted/40 border border-border p-4 text-sm text-muted-foreground mb-4">
              <p className="font-semibold text-foreground mb-1">Como funciona:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Cadastre sua wallet Polygon abaixo</li>
                <li>Envie USDC ou MATIC para o endereço da plataforma (fornecido ao suporte)</li>
                <li>O sistema detecta automaticamente e adiciona créditos ao seu perfil</li>
                <li>Taxa: <strong>1 USDC = 100 créditos</strong> (1 crédito = 1 centavo)</li>
              </ol>
            </div>
            <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" /> Creditar via Tx Hash (USDC)
              </p>
              <p className="text-xs text-muted-foreground mt-1">Cole o hash da transação USDC (Polygon) enviada para a carteira da plataforma.</p>
              <div className="flex gap-2 mt-3">
                <Input
                  placeholder="0x..."
                  className="font-mono text-sm"
                  value={topupTx}
                  onChange={(e) => setTopupTx(e.target.value)}
                />
                <Button onClick={handleTopUp} disabled={toppingUp || !topupTx.trim()} className="gap-2">
                  {toppingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
                  Creditar
                </Button>
              </div>
            </div>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label htmlFor="wallet">Seu endereço Polygon (0x...)</Label>
                <Input
                  id="wallet"
                  placeholder="0x..."
                  value={profile?.wallet_address || ''}
                  onChange={e => profile && setProfile({ ...profile, wallet_address: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
              <Button onClick={handleSave} disabled={saving} variant="outline">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar
              </Button>
            </div>
          </section>

          {/* Mini-Site Editor */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card mb-8">
            <MiniSiteEditor userId={user!.id} initialCustomization={siteCustomization} bannerUrl={bannerUrl} onBannerUploaded={(url) => setBannerUrl(url)} />
          </section>

          {/* Minisite billing via credits */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card mb-8">
            <h2 className="text-xl font-semibold mb-2">Mensalidade do Mini-site (Créditos)</h2>
            <p className="text-sm text-muted-foreground">
              O mini-site só fica público quando a mensalidade/anuidade estiver paga. Pague com créditos (USDC→créditos).
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-4">
              <div className="text-sm">
                <p className="font-semibold">Status</p>
                <p className="text-muted-foreground text-xs">
                  {profile?.minisite_paid_until ? `Pago até ${new Date(profile.minisite_paid_until).toLocaleString('pt-BR', { dateStyle: 'medium' })}` : 'Não pago'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePayMinisite('monthly')}
                  disabled={!!payingMinisite}
                >
                  {payingMinisite === 'monthly' ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Pagar mensal ({(billing.minisite_monthly_credits / 100).toFixed(2)} USD)
                </Button>
                <Button
                  size="sm"
                  onClick={() => handlePayMinisite('annual')}
                  disabled={!!payingMinisite}
                >
                  {payingMinisite === 'annual' ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Pagar anual ({(billing.minisite_annual_credits / 100).toFixed(2)} USD)
                </Button>
              </div>
            </div>
          </section>

          {/* Subscription Plans */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Planos Premium</h2>
              {subscriptions.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                  <CreditCard className="h-4 w-4 mr-1" /> Gerenciar Assinaturas
                </Button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className={`rounded-xl border p-5 ${hasSubscription(STRIPE_PRODUCTS.featuredUser.product_id) ? 'border-amber-500 bg-amber-500/5' : 'border-border'}`}>
                <Star className="h-6 w-6 text-amber-500 mb-2" />
                <h3 className="font-semibold">{STRIPE_PRODUCTS.featuredUser.name}</h3>
                <p className="text-2xl font-bold mt-1">{STRIPE_PRODUCTS.featuredUser.price}<span className="text-sm text-muted-foreground font-normal">{STRIPE_PRODUCTS.featuredUser.period}</span></p>
                {hasSubscription(STRIPE_PRODUCTS.featuredUser.product_id) ? (
                  <p className="mt-3 text-sm text-amber-600 font-medium">✓ Ativo</p>
                ) : (
                  <Button className="mt-3 w-full" variant="outline" size="sm" onClick={() => handleCheckout(STRIPE_PRODUCTS.featuredUser.price_id)}>
                    Assinar
                  </Button>
                )}
              </div>
              <div className={`rounded-xl border p-5 ${hasSubscription(STRIPE_PRODUCTS.jobPosting.product_id) ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <Briefcase className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold">{STRIPE_PRODUCTS.jobPosting.name}</h3>
                <p className="text-2xl font-bold mt-1">{STRIPE_PRODUCTS.jobPosting.price}<span className="text-sm text-muted-foreground font-normal">{STRIPE_PRODUCTS.jobPosting.period}</span></p>
                {hasSubscription(STRIPE_PRODUCTS.jobPosting.product_id) ? (
                  <p className="mt-3 text-sm text-primary font-medium">✓ Ativo</p>
                ) : (
                  <Button className="mt-3 w-full" size="sm" onClick={() => handleCheckout(STRIPE_PRODUCTS.jobPosting.price_id)}>
                    Assinar
                  </Button>
                )}
              </div>
              <div className={`rounded-xl border p-5 ${hasSubscription(STRIPE_PRODUCTS.companyHighlight.product_id) ? 'border-violet-500 bg-violet-500/5' : 'border-border'}`}>
                <Crown className="h-6 w-6 text-violet-500 mb-2" />
                <h3 className="font-semibold">{STRIPE_PRODUCTS.companyHighlight.name}</h3>
                <p className="text-2xl font-bold mt-1">{STRIPE_PRODUCTS.companyHighlight.price}<span className="text-sm text-muted-foreground font-normal">{STRIPE_PRODUCTS.companyHighlight.period}</span></p>
                {hasSubscription(STRIPE_PRODUCTS.companyHighlight.product_id) ? (
                  <p className="mt-3 text-sm text-violet-600 font-medium">✓ Ativo</p>
                ) : (
                  <Button className="mt-3 w-full" variant="outline" size="sm" onClick={() => handleCheckout(STRIPE_PRODUCTS.companyHighlight.price_id)}>
                    Assinar
                  </Button>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Dashboard;
