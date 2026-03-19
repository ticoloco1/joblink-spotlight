'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Eye, Flame, Clock, DollarSign, Gavel, TrendingUp, ArrowLeft } from 'lucide-react';
import { getGrowthPercent, getSlugTag } from '@/lib/slugValuation';

interface SlugStats {
  slug: string;
  views: number;
  score: number | null;
  tag: string | null;
  suggested_price: number | null;
  expires_at: string | null;
  owner_id: string | null;
  auto_renew: boolean;
}

interface Listing {
  id: string;
  slug: string;
  price_cents: number;
  type: string;
  expires_at: string | null;
  owner_id: string;
}

export default function SlugDetail() {
  const params = useParams();
  const slug = (params?.slug as string) ?? '';
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<SlugStats | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [lastSold, setLastSold] = useState<{ price_cents: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [viewingNow] = useState(() => 2 + Math.floor(Math.random() * 5));
  const [autoRenew, setAutoRenew] = useState(false);

  useEffect(() => {
    if (!slug) return;
    loadData();
  }, [slug]);

  const loadData = async () => {
    if (!slug) return;
    const [statsRes, listingRes, soldRes] = await Promise.all([
      supabase.from('slugs' as any).select('slug, views, score, tag, suggested_price, expires_at, owner_id, auto_renew').eq('slug', slug).maybeSingle(),
      supabase.from('slug_marketplace' as any).select('id, slug, price_cents, type, expires_at, owner_id').eq('slug', slug).eq('status', 'active').maybeSingle(),
      supabase.from('slug_marketplace' as any).select('price_cents').eq('slug', slug).eq('status', 'sold').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (statsRes.data) {
      const s = statsRes.data as unknown as SlugStats;
      setStats(s);
      setAutoRenew(!!s.auto_renew);
    }
    if (listingRes.data) setListing(listingRes.data as unknown as Listing);
    if (soldRes.data) setLastSold(soldRes.data as unknown as { price_cents: number });
    setLoading(false);
  };

  const handleBuy = async () => {
    if (!listing || !user) return;
    setBuying(true);
    try {
      const { data, error } = await supabase.functions.invoke('slug-buy-marketplace', {
        body: { marketplace_id: listing.id },
      });
      if (error) throw new Error(error.message);
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error('Erro ao criar checkout');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao comprar');
    } finally {
      setBuying(false);
    }
  };

  const handleBid = async () => {
    if (!listing || !bidAmount) return;
    const amount = parseFloat(bidAmount.replace(',', '.'));
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error('Informe um valor válido');
      return;
    }
    setBidding(true);
    try {
      const { error } = await supabase.functions.invoke('slug-bid', {
        body: { marketplace_id: listing.id, amount },
      });
      if (error) throw new Error(error.message);
      toast.success('Lance registrado!');
      setBidAmount('');
      loadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao dar lance');
    } finally {
      setBidding(false);
    }
  };

  const handleAutoRenew = async (checked: boolean) => {
    if (!stats?.owner_id || stats.owner_id !== user?.id) return;
    setAutoRenew(checked);
    const { error } = await supabase.from('slugs').update({ auto_renew: checked } as any).eq('slug', slug);
    if (error) toast.error('Erro ao salvar');
    else toast.success(checked ? 'Renovação automática ativada' : 'Renovação automática desativada');
  };

  if (loading || !slug) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  const views = stats?.views ?? 0;
  const score = stats?.score ?? 0;
  const tag = stats?.tag ?? getSlugTag(views, slug.length, score);
  const growth = getGrowthPercent(score);
  const isOwner = user?.id && stats?.owner_id === user.id;
  const daysLeft = stats?.expires_at
    ? Math.max(0, Math.ceil((new Date(stats.expires_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : null;

  return (
    <>
      <Helmet>
        <title>{slug} | Marketplace JobinLink</title>
        <meta name="description" content={`Slug ${slug} — identidade digital. ${tag ?? ''} ${growth > 0 ? `+${growth}% crescimento.` : ''}`} />
        <meta property="og:title" content={`${slug} | JobinLink`} />
        <meta property="og:description" content={`Slug profissional jobinlink.com/${slug}`} />
        <meta property="og:url" content={`https://jobinlink.com/marketplace/slug/${slug}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: slug,
              description: `${slug} — identidade digital no JobinLink`,
              url: `https://jobinlink.com/marketplace/slug/${slug}`,
            }),
          }}
        />
      </Helmet>
      <Navbar />
      <main className="min-h-screen bg-zinc-950 text-white py-10">
        <div className="container mx-auto max-w-2xl px-4">
          <button
            type="button"
            onClick={() => router.push('/marketplace')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao marketplace
          </button>

          <h1 className="text-4xl font-bold tracking-tight mb-2">{slug}</h1>
          {tag && <p className="text-emerald-400 font-medium mb-2">{tag}</p>}
          {growth > 0 && (
            <p className="text-emerald-400 text-lg mb-4">+{growth}% crescimento</p>
          )}

          <div className="flex flex-wrap gap-4 text-zinc-400 text-sm mb-6">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" /> {views.toLocaleString('pt-BR')} visualizações
            </span>
            <span className="flex items-center gap-1">
              <Flame className="h-4 w-4" /> {viewingNow} pessoas vendo agora
            </span>
          </div>

          {/* Urgência */}
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 mb-6 space-y-2">
            {daysLeft !== null && daysLeft <= 30 && (
              <p className="flex items-center gap-2 text-amber-400">
                <Clock className="h-4 w-4" /> Expira em {daysLeft} dias
              </p>
            )}
            {lastSold && (
              <p className="flex items-center gap-2 text-zinc-400">
                <DollarSign className="h-4 w-4" /> Último vendido por R$ {(lastSold.price_cents / 100).toFixed(2).replace('.', ',')}
              </p>
            )}
          </div>

          {/* Gráfico placeholder */}
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 mb-6 flex items-center justify-center h-32">
            <TrendingUp className="h-12 w-12 text-zinc-600" />
            <span className="ml-2 text-zinc-500 text-sm">Histórico de valorização</span>
          </div>

          {listing && !isOwner && (
            <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
              <p className="text-2xl font-bold text-amber-400 mb-4">
                R$ {(listing.price_cents / 100).toFixed(2).replace('.', ',')}
              </p>
              {listing.type === 'auction' ? (
                <div className="space-y-2">
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="Seu lance"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                  <Button
                    className="w-full bg-amber-600 hover:bg-amber-500"
                    onClick={handleBid}
                    disabled={bidding}
                  >
                    {bidding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gavel className="h-4 w-4" />}
                    Dar lance
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-500 py-6 text-lg"
                  onClick={handleBuy}
                  disabled={buying}
                >
                  {buying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Comprar agora'}
                </Button>
              )}
            </div>
          )}

          {stats?.owner_id === user?.id && (
            <div className="mt-6 rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={autoRenew}
                  onChange={(e) => handleAutoRenew(e.target.checked)}
                  className="rounded border-zinc-600"
                />
                Renovar automaticamente (R$ 5/ano)
              </label>
            </div>
          )}

          {!listing && !stats?.owner_id && (
            <p className="text-zinc-500 text-center py-8">Este slug não está à venda no momento.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
