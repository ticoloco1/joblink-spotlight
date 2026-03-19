import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { Loader2, Ban, Settings, Settings2, Tag, Star, Image, UserCheck, DollarSign, Video, Briefcase, Building2, FolderOpen, MessageSquare, Megaphone, Lock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminSettingsCore from '@/components/admin/AdminSettingsCore';
import AdminPremiumSlugs from '@/components/admin/AdminPremiumSlugs';
import AdminSlugsBulk from '@/components/admin/AdminSlugsBulk';
import AdminAds from '@/components/admin/AdminAds';
import AdminProfiles from '@/components/admin/AdminProfiles';
import AdminBroadcast from '@/components/admin/AdminBroadcast';

const centsToDisplay = (_key: string, value: string) => {
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return (n / 100).toFixed(2);
};
const displayToCents = (_key: string, value: string) => {
  const n = parseFloat(String(value).replace(',', '.'));
  if (Number.isNaN(n)) return '0';
  return String(Math.round(n * 100));
};

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }
    if (user) checkAdmin();
  }, [user, authLoading]);

  const checkAdmin = async () => {
    try {
      const { data, error } = await supabase.rpc('is_admin', { _user_id: user!.id });
      if (!error && data === true) setIsAdmin(true);
      else setIsAdmin(false);
    } catch {
      setIsAdmin(false);
    }
    setChecking(false);
  };

  if (authLoading || checking) {
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

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <Ban className="h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-bold">Acesso Negado</h1>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel | JobinLink</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen py-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Painel Admin</h1>
            <p className="text-muted-foreground mt-1">Gerencie toda a plataforma: preços, perfis, anúncios e muito mais</p>
          </div>

          <Tabs defaultValue="core">
            <TabsList className="mb-6 flex-wrap h-auto gap-1">
              <TabsTrigger value="core" className="gap-1.5">
                <Settings2 className="h-4 w-4" /> Config global
              </TabsTrigger>
              <TabsTrigger value="profiles" className="gap-1.5">
                <UserCheck className="h-4 w-4" /> Perfis
              </TabsTrigger>
              <TabsTrigger value="minisite" className="gap-1.5">
                <Tag className="h-4 w-4" /> Mini-sites
              </TabsTrigger>
              <TabsTrigger value="slugs" className="gap-1.5">
                <Star className="h-4 w-4" /> Slugs
              </TabsTrigger>
              <TabsTrigger value="company" className="gap-1.5">
                <Building2 className="h-4 w-4" /> Empresas
              </TabsTrigger>
              <TabsTrigger value="jobs" className="gap-1.5">
                <Briefcase className="h-4 w-4" /> Vagas
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-1.5">
                <Video className="h-4 w-4" /> Vídeos
              </TabsTrigger>
              <TabsTrigger value="directory" className="gap-1.5">
                <FolderOpen className="h-4 w-4" /> Diretórios
              </TabsTrigger>
              <TabsTrigger value="posts" className="gap-1.5">
                <MessageSquare className="h-4 w-4" /> Posts/Feed
              </TabsTrigger>
              <TabsTrigger value="ads" className="gap-1.5">
                <Image className="h-4 w-4" /> Anúncios
              </TabsTrigger>
              <TabsTrigger value="pricing" className="gap-1.5">
                <DollarSign className="h-4 w-4" /> Boost/Contatos
              </TabsTrigger>
              <TabsTrigger value="broadcast" className="gap-1.5">
                <Megaphone className="h-4 w-4" /> Broadcast
              </TabsTrigger>
              <TabsTrigger value="paywall" className="gap-1.5">
                <Lock className="h-4 w-4" /> Paywall
              </TabsTrigger>
              <TabsTrigger value="credits" className="gap-1.5">
                <DollarSign className="h-4 w-4" /> Créditos
              </TabsTrigger>
              <TabsTrigger value="general" className="gap-1.5">
                <Settings className="h-4 w-4" /> Geral
              </TabsTrigger>
            </TabsList>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <TabsContent value="core" className="mt-0">
                <AdminSettingsCore />
              </TabsContent>
              <TabsContent value="profiles" className="mt-0">
                <AdminProfiles />
              </TabsContent>

              <TabsContent value="minisite" className="mt-0">
                <AdminSettings
                  category="minisite"
                  title="Preços de Mini-sites"
                  description="Defina preços em créditos (1 crédito = 1 centavo). Ex: 999 = $9.99/mês, 7999 = $79.99/ano."
                />
              </TabsContent>

              <TabsContent value="slugs" className="mt-0">
                <AdminSettings
                  category="slugs"
                  title="Preços de Slugs por Tamanho"
                  description="Defina os preços para slugs de 1, 2 e 3 caracteres (valor em USD, ex: 500.00 ou 5,00)"
                  formatValue={centsToDisplay}
                  parseValue={displayToCents}
                />
                <div className="my-6 border-t border-border" />
                <AdminPremiumSlugs />
                <div className="my-6 border-t border-border" />
                <AdminSlugsBulk />
              </TabsContent>

              <TabsContent value="company" className="mt-0">
                <AdminSettings
                  category="company"
                  title="Preços para Empresas"
                  description="Mensalidade, anuidade, publicação de vagas e destaque"
                />
              </TabsContent>

              <TabsContent value="jobs" className="mt-0">
                <AdminSettings
                  category="jobs"
                  title="Preços de Vagas"
                  description="Publicação, destaque e duração das vagas"
                />
              </TabsContent>

              <TabsContent value="videos" className="mt-0">
                <AdminSettings
                  category="videos"
                  title="Preços de Vídeo"
                  description="Valores em USD (ex: 5.99). Gerencie paywall, desbloqueio e comissões."
                  formatValue={centsToDisplay}
                  parseValue={displayToCents}
                />
              </TabsContent>

              <TabsContent value="paywall" className="mt-0">
                <AdminSettings
                  category="paywall"
                  title="Paywall (OnlyFans style)"
                  description="Comissão da plataforma (%), preço padrão mensal/diário (USD)."
                  formatValue={(key, value) => {
                    if (key.includes('percent')) return value;
                    return centsToDisplay(key, value);
                  }}
                  parseValue={(key, value) => {
                    if (key.includes('percent')) return String(Math.max(0, Math.min(100, parseInt(value || '0', 10) || 0)));
                    return displayToCents(key, value);
                  }}
                />
              </TabsContent>

              <TabsContent value="credits" className="mt-0">
                <AdminSettings
                  category="credits"
                  title="Créditos (Blockchain / USDC)"
                  description="Conversão USDC→créditos e parâmetros de on-ramp."
                />
              </TabsContent>

              <TabsContent value="directory" className="mt-0">
                <AdminSettings
                  category="directory"
                  title="Preços de Diretórios"
                  description="Diretório de vídeos, empresas e destaque"
                />
              </TabsContent>

              <TabsContent value="posts" className="mt-0">
                <AdminSettings
                  category="posts"
                  title="Configurações do Feed de Posts"
                  description="Duração, fixação, altura e funcionalidades dos posts"
                />
              </TabsContent>

              <TabsContent value="ads" className="mt-0">
                <AdminAds />
              </TabsContent>

              <TabsContent value="pricing" className="mt-0">
                <AdminSettings
                  category="pricing"
                  title="Todos os Preços e Comissões"
                  description="Valores em USD (ex: 1,00 ou 5.00). CV, contato, vídeo, boost e comissões."
                  formatValue={centsToDisplay}
                  parseValue={displayToCents}
                />
                <div className="my-6 border-t border-border" />
                <AdminSettings
                  category="boosts"
                  title="Preços de Boost"
                  description="Valores em USD (ex: 1,50 ou 5.00)"
                  formatValue={centsToDisplay}
                  parseValue={displayToCents}
                />
                <div className="my-6 border-t border-border" />
                <AdminSettings
                  category="contacts"
                  title="Desbloqueio de Contatos"
                  description="Valor em USD (ex: 5,00 ou 10.00)"
                  formatValue={centsToDisplay}
                  parseValue={displayToCents}
                />
              </TabsContent>

              <TabsContent value="broadcast" className="mt-0">
                <AdminBroadcast />
              </TabsContent>

              <TabsContent value="general" className="mt-0">
                <AdminSettings
                  category="general"
                  title="Configurações Gerais"
                  description="Nome do site, descrição e comissão da plataforma"
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Admin;
