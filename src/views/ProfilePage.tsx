'use client';
import { useParams, useSearchParams, usePathname } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { getTemplateById, templates } from '@/data/templates';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TemplatedProfile from '@/components/TemplatedProfile';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { demoProfiles } from '@/data/demoContent';
import { mockProfiles, type ProfileData } from '@/data/mockProfiles';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ProfilePage = ({ prefix }: { prefix?: 'u' | 'c' } = {}) => {
  const params = useParams();
  const slug = (params?.slug as string) ?? '';
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isCompany = prefix === 'c' || pathname?.startsWith('/c/');
  const { t } = useLanguage();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [ownerUserId, setOwnerUserId] = useState<string | null>(null);
  const [avatarFrame, setAvatarFrame] = useState<string | null>(null);
  const [siteCustomization, setSiteCustomization] = useState<any>({});
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [boostScore, setBoostScore] = useState(0);
  const [homepageUntil, setHomepageUntil] = useState<string | null>(null);
  const [profileStatus, setProfileStatus] = useState<string>('active');
  const [loading, setLoading] = useState(true);
  const [paywall, setPaywall] = useState<{ enabled: boolean; mode: string; interval: string; price_cents: number }>({ enabled: false, mode: 'none', interval: 'monthly', price_cents: 0 });
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);

  const savedTemplateId = siteCustomization?.template_id || searchParams.get('template') || 'clean-white';
  const template = getTemplateById(savedTemplateId) || templates[0];

  useEffect(() => {
    loadProfile();
  }, [slug]);

  const loadProfile = async () => {
    let data: any = null;

    // Try direct slug match on profiles (RLS: só retorna se publicado ou se for o dono autenticado)
    const { data: directMatch } = await supabase
      .from('profiles')
      .select('*')
      .eq('slug', slug || '')
      .single();

    if (directMatch) {
      data = directMatch;
    } else {
      // Check purchased_slugs table for additional slugs (pode falhar para anon; ok)
      const { data: purchasedSlug } = await supabase
        .from('purchased_slugs' as any)
        .select('profile_id')
        .eq('slug', slug || '')
        .eq('is_active', true)
        .maybeSingle();

      if (purchasedSlug) {
        const { data: profileByPurchase } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', (purchasedSlug as any).profile_id)
          .single();

        if (profileByPurchase) data = profileByPurchase;
      }
    }

    if (data) {
      const mapped: ProfileData = {
        id: data.id,
        slug: data.slug,
        name: data.name,
        title: data.title || 'Professional',
        location: data.location || '',
        photo: data.photo_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
        bio: data.bio || '',
        skills: data.skills || [],
        links: Array.isArray(data.links) ? (data.links as any[]) : [],
        experience: Array.isArray(data.experience) ? (data.experience as any[]) : [],
        education: Array.isArray(data.education) ? (data.education as any[]) : [],
        contact: {
          email: data.contact_email || '',
          phone: data.contact_phone || '',
          linkedin: data.contact_linkedin || '',
        },
      };
      setProfile(mapped);
      setVideoUrl(data.video_url || null);
      setOwnerUserId(data.user_id || null);
      setAvatarFrame((data as any).avatar_frame || null);
      setSiteCustomization((data as any).site_customization || {});
      setBannerUrl((data as any).banner_url || null);
      setBoostScore((data as any).boost_score || 0);
      setHomepageUntil((data as any).homepage_until || null);
      setProfileStatus((data as any).status || 'active');
      setPaywall({
        enabled: !!(data as any).paywall_enabled,
        mode: (data as any).paywall_mode || 'none',
        interval: (data as any).paywall_interval || 'monthly',
        price_cents: (data as any).paywall_price_cents || 0,
      });
      setLoading(false);
      return;
    }

    // Se não veio dado por RLS, checar status sem PII (published/unpublished/not_found)
    const { data: status } = await supabase.rpc(
      'get_slug_public_status' as any,
      { p_slug: slug || '' } as any
    );
    if (status === 'unpublished') {
      setProfileStatus('unpublished');
    }

    // Fallback: demo/mock profiles
    const local = [...demoProfiles, ...mockProfiles].find((p) => p.slug === (slug || '')) || null;
    if (local) {
      setProfile(local);
      setVideoUrl(null);
      setOwnerUserId(null);
    }

    setLoading(false);
  };

  if (loading) {
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

  if (!profile || ['blocked', 'disabled', 'suspended', 'unpublished'].includes(profileStatus)) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <p className="text-muted-foreground text-lg font-medium">
            {profileStatus === 'blocked' ? 'Este perfil foi bloqueado.' :
             profileStatus === 'disabled' ? 'Este perfil está desabilitado.' :
             profileStatus === 'suspended' ? 'Este perfil está suspenso.' :
             profileStatus === 'unpublished' ? 'Este mini-site ainda não foi publicado.' :
             'Perfil não encontrado.'}
          </p>
          {profileStatus === 'unpublished' && (
            <p className="text-sm text-muted-foreground max-w-md text-center">
              O criador ainda não ativou a mensalidade obrigatória. Volte em breve.
            </p>
          )}
        </div>
        <Footer />
      </>
    );
  }

  const isOwner = user?.id && ownerUserId && user.id === ownerUserId;
  const paywallActive = paywall.enabled && paywall.mode === 'full' && !isOwner;

  const checkAccess = async () => {
    if (!paywallActive) return;
    if (!user) { setHasAccess(false); return; }
    setCheckingAccess(true);
    const { data } = await supabase
      .from('profile_paywall_access')
      .select('id, expires_at, status')
      .eq('subscriber_id', user.id)
      .eq('profile_id', profile.id)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    setHasAccess(!!data);
    setCheckingAccess(false);
  };

  useEffect(() => { checkAccess(); }, [paywallActive, user?.id, profile.id]);

  const handlePaywallCheckout = async () => {
    if (!user) {
      toast.error('Faça login para assinar');
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke('profile-paywall-checkout', {
        body: {
          profile_id: profile.id,
          interval: paywall.interval,
          amount_cents: paywall.price_cents || (paywall.interval === 'daily' ? 199 : 999),
        },
      });
      if (error) throw error;
      if (data?.already_active) {
        toast.success('Acesso já está ativo!');
        setHasAccess(true);
        return;
      }
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      toast.error(e.message || 'Erro ao iniciar checkout');
    }
  };

  if (paywallActive && !hasAccess) {
    return (
      <>
        <Navbar />
        <main className="min-h-[70vh] flex items-center justify-center py-16 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-elevated text-center">
            <img src={profile.photo} alt={profile.name} className="mx-auto h-24 w-24 rounded-full object-cover border border-border" />
            <h1 className="mt-4 text-2xl font-bold">{profile.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{profile.title}</p>
            <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-sm font-medium">Conteúdo exclusivo</p>
              <p className="text-xs text-muted-foreground mt-1">
                Este mini-site está protegido por paywall. Assine para acessar tudo (estilo OnlyFans).
              </p>
              <p className="mt-3 font-mono text-lg">
                {(Math.max(0, paywall.price_cents) / 100).toFixed(2)} USD / {paywall.interval === 'daily' ? 'dia' : 'mês'}
              </p>
            </div>
            <Button className="mt-6 w-full gradient-hero text-primary-foreground border-0" onClick={handlePaywallCheckout} disabled={checkingAccess}>
              {checkingAccess ? '...' : 'Assinar e desbloquear'}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">A plataforma cobra 20% do valor.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <TemplatedProfile profile={profile} template={template} videoUrl={videoUrl} ownerUserId={ownerUserId || undefined} avatarFrame={avatarFrame} siteCustomization={siteCustomization} bannerUrl={bannerUrl} boostScore={boostScore} homepageUntil={homepageUntil} />
      <Footer />
    </>
  );
};

export default ProfilePage;
