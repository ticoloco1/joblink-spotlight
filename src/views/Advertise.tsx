import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { AD_PRODUCTS } from '@/lib/ad-products';
import { Upload, Image, ExternalLink, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';

type AdStatus = 'pending' | 'approved' | 'rejected';

interface AdRecord {
  id: string;
  title: string;
  placement: string;
  banner_url: string | null;
  target_url: string | null;
  status: string;
  impressions: number;
  clicks: number;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'text-amber-600 bg-amber-500/10',
  approved: 'text-accent bg-accent/10',
  rejected: 'text-destructive bg-destructive/10',
};

const statusIcons: Record<string, typeof CheckCircle> = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
};

const Advertise = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [ads, setAds] = useState<AdRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [placement, setPlacement] = useState<'header' | 'sidebar' | 'footer'>('header');
  const [targetUrl, setTargetUrl] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }
    if (user) loadAds();
  }, [user, authLoading]);

  const loadAds = async () => {
    const { data } = await supabase
      .from('ads')
      .select('*')
      .eq('advertiser_user_id', user!.id)
      .order('created_at', { ascending: false });
    if (data) setAds(data as AdRecord[]);
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!user || !title || !bannerFile) {
      toast.error('Preencha todos os campos e envie o banner');
      return;
    }

    setSubmitting(true);

    try {
      // Upload banner
      const ext = bannerFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('ad-banners')
        .upload(filePath, bannerFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('ad-banners')
        .getPublicUrl(filePath);

      // Create ad record
      const { error: insertError } = await supabase.from('ads').insert({
        advertiser_user_id: user.id,
        title,
        placement,
        banner_url: urlData.publicUrl,
        target_url: targetUrl || null,
        pricing_type: 'daily',
        status: 'pending',
      });

      if (insertError) throw insertError;

      toast.success('Banner enviado para aprovação!');
      setTitle('');
      setTargetUrl('');
      setBannerFile(null);
      setPreviewUrl('');
      loadAds();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar banner');
    } finally {
      setSubmitting(false);
    }
  };

  const product = placement === 'sidebar' ? AD_PRODUCTS.banner300x250 : AD_PRODUCTS.banner728x90;

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

  return (
    <>
      <Helmet>
        <title>Advertise | JobinLink</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen py-10">
        <div className="container mx-auto max-w-5xl px-4">
          <h1 className="text-3xl font-bold mb-2">Anuncie no JobinLink</h1>
          <p className="text-muted-foreground mb-8">
            Alcance profissionais e empresas com seus banners publicitários.
          </p>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Submit Form */}
            <div className="lg:col-span-2">
              <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h2 className="text-xl font-semibold mb-6">Enviar Banner</h2>

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="ad-title">Título do anúncio</Label>
                    <Input id="ad-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Promoção de verão" />
                  </div>

                  <div>
                    <Label>Posição do banner (header, sidebar ou footer)</Label>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setPlacement('header')}
                        className={`flex-1 min-w-[100px] rounded-xl border p-4 text-center transition-colors ${placement === 'header' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}
                      >
                        <div className="text-sm font-medium">Header</div>
                        <div className="text-xs text-muted-foreground mt-1">728×90 px</div>
                        <div className="text-lg font-bold mt-2 text-primary">{AD_PRODUCTS.banner728x90.price}<span className="text-xs font-normal text-muted-foreground">{AD_PRODUCTS.banner728x90.period}</span></div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlacement('sidebar')}
                        className={`flex-1 min-w-[100px] rounded-xl border p-4 text-center transition-colors ${placement === 'sidebar' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}
                      >
                        <div className="text-sm font-medium">Sidebar</div>
                        <div className="text-xs text-muted-foreground mt-1">300×250 px</div>
                        <div className="text-lg font-bold mt-2 text-primary">{AD_PRODUCTS.banner300x250.price}<span className="text-xs font-normal text-muted-foreground">{AD_PRODUCTS.banner300x250.period}</span></div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlacement('footer')}
                        className={`flex-1 min-w-[100px] rounded-xl border p-4 text-center transition-colors ${placement === 'footer' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}
                      >
                        <div className="text-sm font-medium">Footer</div>
                        <div className="text-xs text-muted-foreground mt-1">728×90 px</div>
                        <div className="text-lg font-bold mt-2 text-primary">{AD_PRODUCTS.banner728x90.price}<span className="text-xs font-normal text-muted-foreground">{AD_PRODUCTS.banner728x90.period}</span></div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="target-url">URL de destino (opcional)</Label>
                    <Input id="target-url" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} placeholder="https://seusite.com" />
                  </div>

                  <div>
                    <Label>Upload do Banner ({product.width}×{product.height}px)</Label>
                    <div className="mt-2 rounded-xl border-2 border-dashed border-border p-6 text-center hover:border-primary/50 transition-colors">
                      {previewUrl ? (
                        <div className="space-y-3">
                          <img src={previewUrl} alt="Preview" className="mx-auto max-h-40 rounded-lg object-contain" />
                          <button onClick={() => { setBannerFile(null); setPreviewUrl(''); }} className="text-sm text-destructive hover:underline">
                            Remover
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Clique para fazer upload</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF • {product.width}×{product.height}px</p>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                      )}
                    </div>
                  </div>

                  <Button onClick={handleSubmit} disabled={submitting} className="gradient-hero text-primary-foreground border-0">
                    {submitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Image className="h-4 w-4 mr-1" />}
                    Enviar para Aprovação
                  </Button>
                </div>
              </section>
            </div>

            {/* Info sidebar */}
            <div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h3 className="font-semibold mb-3">Como funciona</h3>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2"><span className="font-bold text-foreground">1.</span> Envie seu banner</li>
                  <li className="flex gap-2"><span className="font-bold text-foreground">2.</span> Aguarde aprovação do admin</li>
                  <li className="flex gap-2"><span className="font-bold text-foreground">3.</span> Após aprovado, faça o pagamento</li>
                  <li className="flex gap-2"><span className="font-bold text-foreground">4.</span> Seu banner fica visível no site!</li>
                </ol>
                <div className="mt-4 rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">
                    Pagamento via Stripe • CPM ou diária • Cancelamento a qualquer momento
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* My Ads */}
          {ads.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-semibold mb-4">Meus Anúncios</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ads.map(ad => {
                  const StatusIcon = statusIcons[ad.status] || Clock;
                  return (
                    <div key={ad.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
                      {ad.banner_url && (
                        <img src={ad.banner_url} alt={ad.title} className="w-full h-24 object-cover rounded-lg mb-3" />
                      )}
                      <h3 className="font-medium text-sm">{ad.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{ad.placement === 'header' ? '728×90' : '300×250'}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[ad.status] || ''}`}>
                          <StatusIcon className="h-3 w-3" />
                          {ad.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {ad.impressions} views • {ad.clicks} clicks
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Advertise;
