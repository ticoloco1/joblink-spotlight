import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, ShoppingBag, DollarSign, Tag, TrendingUp, Sparkles } from 'lucide-react';
import SlugCard, { type SlugCardData } from '@/components/SlugCard';

interface MarketplaceItem {
  id: string;
  slug: string;
  price_cents: number;
  type: 'fixed' | 'auction';
  status: string;
  expires_at: string | null;
  owner_id: string;
}

export default function Marketplace() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [biddingId, setBiddingId] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState<Record<string, string>>({});
  const [topByPrice, setTopByPrice] = useState<{ slug: string; suggested_price: number | null }[]>([]);
  const [trending, setTrending] = useState<{ slug: string; score: number | null }[]>([]);
  const [slugStatsMap, setSlugStatsMap] = useState<Record<string, { views: number; score: number | null; tag: string | null; suggested_price: number | null }>>({});

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const buySuccess = searchParams.get('buy');
    if (sessionId && buySuccess === 'success' && user) {
      completePurchase(sessionId);
    }
  }, [searchParams, user]);

  const loadItems = async () => {
    const marketRes = await supabase
      .from('slug_marketplace' as any)
      .select('id, slug, price_cents, type, status, expires_at, owner_id' as any)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    const list = (marketRes.data as unknown as MarketplaceItem[]) ?? [];
    setItems(list);

    const slugNames = list.map((i) => i.slug);
    if (slugNames.length > 0) {
      const { data: slugsData } = await supabase
        .from('slugs' as any)
        .select('slug, views, score, tag, suggested_price' as any)
        .in('slug', slugNames);
      const map: Record<string, { views: number; score: number | null; tag: string | null; suggested_price: number | null }> = {};
      if (slugsData) {
        slugsData.forEach((s: any) => {
          map[s.slug] = { views: s.views ?? 0, score: s.score ?? null, tag: s.tag ?? null, suggested_price: s.suggested_price ?? null };
        });
      }
      setSlugStatsMap(map);
    }

    const [priceRes, trendRes] = await Promise.all([
      supabase.from('slugs' as any).select('slug, suggested_price' as any).not('suggested_price', 'is', null).order('suggested_price', { ascending: false }).limit(10),
      supabase.from('slugs' as any).select('slug, score' as any).not('score', 'is', null).order('score', { ascending: false }).limit(10),
    ]);
    if (!priceRes.error && priceRes.data) setTopByPrice(priceRes.data as unknown as { slug: string; suggested_price: number | null }[]);
    if (!trendRes.error && trendRes.data) setTrending(trendRes.data as unknown as { slug: string; score: number | null }[]);
    setLoading(false);
  };

  const completePurchase = async (sessionId: string) => {
    try {
      const { data: json, error } = await supabase.functions.invoke('slug-complete-purchase', {
        body: { session_id: sessionId },
      });
      if (error) throw error;
      if (json?.success) {
        toast.success(json.message || 'Slug adquirido!');
        loadItems();
        window.history.replaceState({}, '', '/marketplace');
      } else {
        toast.error(json?.error || 'Erro ao finalizar');
      }
    } catch (e) {
      toast.error('Erro ao confirmar compra');
    }
  };

  const handleBuy = async (marketplaceId: string) => {
    if (!user) {
      toast.error('Faça login para comprar');
      return;
    }
    setBuyingId(marketplaceId);
    try {
      const { data, error } = await supabase.functions.invoke('slug-buy-marketplace', {
        body: { marketplace_id: marketplaceId },
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
      setBuyingId(null);
    }
  };

  const handleBid = async (marketplaceId: string, amountStr: string) => {
    if (!user) {
      toast.error('Faça login para dar lance');
      return;
    }
    const amount = amountStr?.replace(',', '.');
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Informe um valor maior que o lance mínimo');
      return;
    }
    setBiddingId(marketplaceId);
    try {
      const res = await supabase.functions.invoke('slug-bid', {
        body: { marketplace_id: marketplaceId, amount: parseFloat(amount) },
      });
      if (res.error) throw new Error(res.error.message);
      toast.success('Lance registrado!');
      setBidAmount((prev) => ({ ...prev, [marketplaceId]: '' }));
      loadItems();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao dar lance');
    } finally {
      setBiddingId(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Marketplace de Slugs | JobinLink</title>
        <meta name="description" content="Compre ou dispute slugs em leilão. Domínio + identidade digital." />
      </Helmet>
      <Navbar />
      <main className="min-h-screen py-10">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <ShoppingBag className="h-4 w-4" /> Marketplace
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              Slugs à venda
            </h1>
            <p className="text-muted-foreground">
              Compre por preço fixo ou dispute em leilão. Comissão 20% da plataforma.
            </p>
          </div>

          {/* Ranking: mais caros + trending */}
          {(topByPrice.length > 0 || trending.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2 mb-10">
              {topByPrice.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="font-semibold flex items-center gap-2 text-primary mb-2">
                    <DollarSign className="h-4 w-4" /> Mais valiosos (preço sugerido)
                  </h3>
                  <ul className="text-sm space-y-1">
                    {topByPrice.map((r, i) => (
                      <li key={r.slug} className="flex justify-between items-center">
                        <span className="font-mono">/{r.slug}</span>
                        <span className="font-medium">${(r.suggested_price ?? 0).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {trending.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                    <TrendingUp className="h-4 w-4" /> Trending (score)
                  </h3>
                  <ul className="text-sm space-y-1">
                    {trending.map((r) => (
                      <li key={r.slug} className="flex justify-between items-center">
                        <span className="font-mono">/{r.slug}</span>
                        {(r.score ?? 0) >= 100 && (
                          <Badge variant="secondary" className="gap-0.5 text-amber-600">
                            <Sparkles className="h-3 w-3" /> Raro
                          </Badge>
                        )}
                        <span className="text-muted-foreground">{(r.score ?? 0).toFixed(0)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum slug à venda no momento.</p>
              <p className="text-sm mt-1">Coloque o seu à venda no Dashboard.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <SlugCard
                  key={item.id}
                  item={{
                    ...item,
                    ...slugStatsMap[item.slug],
                  } as SlugCardData}
                  currentUserId={user?.id}
                  onBuy={handleBuy}
                  onBid={handleBid}
                  bidAmount={bidAmount[item.id] ?? ''}
                  onBidAmountChange={(id, value) => setBidAmount((prev) => ({ ...prev, [id]: value }))}
                  buying={buyingId === item.id}
                  bidding={biddingId === item.id}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
