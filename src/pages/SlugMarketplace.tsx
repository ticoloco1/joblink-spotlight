import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Search, ShoppingCart, Loader2, Check, X, Globe, Sparkles, Tag, Trash2, CreditCard,
} from 'lucide-react';

interface SlugPricing {
  slug_price_1_char: number;
  slug_price_2_chars: number;
  slug_price_3_chars: number;
  slug_price_4_chars: number;
  slug_price_5_chars: number;
  slug_price_6_chars: number;
  slug_price_7_chars: number;
  slug_price_8_plus: number;
  slug_price_default: number;
}

interface CartItem {
  slug: string;
  priceCents: number;
  type: 'premium' | 'length' | 'free';
}

const SlugMarketplace = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [pricing, setPricing] = useState<SlugPricing>({
    slug_price_1_char: 100000,
    slug_price_2_chars: 200000,
    slug_price_3_chars: 150000,
    slug_price_4_chars: 130000,
    slug_price_5_chars: 100000,
    slug_price_6_chars: 60000,
    slug_price_7_chars: 40000,
    slug_price_8_plus: 599,
    slug_price_default: 599,
  });
  const [premiumSlugs, setPremiumSlugs] = useState<{ slug: string; price_cents: number; category: string }[]>([]);
  const [existingSlugs, setExistingSlugs] = useState<Set<string>>(new Set());
  const [purchasedSlugs, setPurchasedSlugs] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [userSlugs, setUserSlugs] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    // Load pricing, premium slugs, existing profiles slugs in parallel
    const [settingsRes, premiumRes, profilesRes] = await Promise.all([
      supabase.from('platform_settings').select('key, value').eq('category', 'slugs'),
      supabase.from('premium_slugs').select('slug, price_cents, category').eq('is_reserved', true),
      supabase.from('profiles').select('slug'),
    ]);

    if (settingsRes.data) {
      const p: any = { ...pricing };
      settingsRes.data.forEach((s: any) => {
        if (s.key in p) p[s.key] = parseInt(s.value) || 0;
      });
      setPricing(p);
    }

    if (premiumRes.data) setPremiumSlugs(premiumRes.data as any);

    const slugSet = new Set<string>();
    if (profilesRes.data) profilesRes.data.forEach((p: any) => slugSet.add(p.slug));
    setExistingSlugs(slugSet);

    // Load user's purchased slugs and profile
    if (user) {
      const [purchasedRes, userProfileRes] = await Promise.all([
        supabase.from('purchased_slugs' as any).select('slug').eq('user_id', user.id),
        supabase.from('profiles').select('id, slug').eq('user_id', user.id),
      ]);
      if (purchasedRes.data) {
        const ps = new Set<string>();
        const userSlugList: string[] = [];
        (purchasedRes.data as any[]).forEach((p: any) => {
          ps.add(p.slug);
          userSlugList.push(p.slug);
        });
        setPurchasedSlugs(ps);
        if (userProfileRes.data && userProfileRes.data.length > 0) {
          setHasProfile(true);
          setUserSlugs([userProfileRes.data[0].slug, ...userSlugList]);
        }
      } else if (userProfileRes.data && userProfileRes.data.length > 0) {
        setHasProfile(true);
        setUserSlugs([userProfileRes.data[0].slug]);
      }
    }

    setLoading(false);
  };

  const getSlugPrice = (slug: string): { priceCents: number; type: 'premium' | 'length' | 'free' } => {
    const clean = slug.toLowerCase().trim();
    const premium = premiumSlugs.find(p => p.slug === clean);
    if (premium) return { priceCents: premium.price_cents, type: 'premium' };

    const len = clean.length;
    if (len === 1) return { priceCents: pricing.slug_price_1_char, type: 'length' };
    if (len === 2) return { priceCents: pricing.slug_price_2_chars, type: 'length' };
    if (len === 3) return { priceCents: pricing.slug_price_3_chars, type: 'length' };
    if (len === 4) return { priceCents: pricing.slug_price_4_chars, type: 'length' };
    if (len === 5) return { priceCents: pricing.slug_price_5_chars, type: 'length' };
    if (len === 6) return { priceCents: pricing.slug_price_6_chars, type: 'length' };
    if (len === 7) return { priceCents: pricing.slug_price_7_chars, type: 'length' };
    return { priceCents: pricing.slug_price_8_plus, type: 'length' };
  };

  const isSlugAvailable = (slug: string): boolean => {
    const clean = slug.toLowerCase().trim();
    if (existingSlugs.has(clean)) return false;
    if (purchasedSlugs.has(clean)) return false;
    if (cart.some(c => c.slug === clean)) return false;
    return clean.length > 0 && /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(clean);
  };

  const formatPrice = (cents: number) => {
    if (cents === 0) return 'Grátis';
    const value = (cents / 100).toFixed(2);
    return `$${value.replace('.', ',')}`;
  };

  const addToCart = (slug: string) => {
    const clean = slug.toLowerCase().trim();
    if (!isSlugAvailable(clean)) return;
    const { priceCents, type } = getSlugPrice(clean);
    setCart(prev => [...prev, { slug: clean, priceCents, type }]);
    toast.success(`"${clean}" adicionado ao carrinho`);
  };

  const removeFromCart = (slug: string) => {
    setCart(prev => prev.filter(c => c.slug !== slug));
  };

  const totalCents = useMemo(() => cart.reduce((sum, c) => sum + c.priceCents, 0), [cart]);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (!hasProfile) {
      toast.error('Você precisa ter um perfil para comprar slugs.');
      return;
    }
    if (cart.length === 0) return;

    setPurchasing(true);
    try {
      // For free slugs, register directly
      const freeSlugs = cart.filter(c => c.priceCents === 0);
      const paidSlugs = cart.filter(c => c.priceCents > 0);

      // Register free slugs directly
      if (freeSlugs.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          for (const s of freeSlugs) {
            await supabase.from('purchased_slugs' as any).insert({
              user_id: user.id,
              profile_id: profileData.id,
              slug: s.slug,
              price_cents: 0,
            } as any);
          }
          toast.success(`${freeSlugs.length} slug(s) gratuito(s) registrado(s)!`);
        }
      }

      // For paid slugs, create Stripe checkout
      if (paidSlugs.length > 0) {
        const { data, error } = await supabase.functions.invoke('create-slug-checkout', {
          body: { slugs: paidSlugs.map(s => ({ slug: s.slug, price_cents: s.priceCents })) },
        });
        if (error) throw error;
        if (data?.url) {
          window.open(data.url, '_blank');
        }
      }

      setCart([]);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar compra');
    }
    setPurchasing(false);
  };

  const cleanSearch = search.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');

  // Search results: show the exact slug + suggestions
  const searchResults = useMemo(() => {
    if (!cleanSearch) return [];
    const results: { slug: string; available: boolean; priceCents: number; type: string }[] = [];

    // Exact match
    const { priceCents, type } = getSlugPrice(cleanSearch);
    results.push({
      slug: cleanSearch,
      available: isSlugAvailable(cleanSearch),
      priceCents,
      type,
    });

    // Suggestions with numbers
    if (cleanSearch.length >= 2) {
      for (const suffix of ['1', '2', '99', 'pro', 'dev', 'art']) {
        const suggestion = `${cleanSearch}${suffix}`;
        if (suggestion !== cleanSearch && isSlugAvailable(suggestion)) {
          const sp = getSlugPrice(suggestion);
          results.push({ slug: suggestion, available: true, ...sp });
          if (results.length >= 6) break;
        }
      }
    }

    return results;
  }, [cleanSearch, existingSlugs, premiumSlugs, pricing, cart]);

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

  return (
    <>
      <Helmet>
        <title>Comprar Slug | JobinLink</title>
        <meta name="description" content="Escolha seu slug personalizado para seu mini-site JobinLink. Pesquise, veja o preço e compre!" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen py-10">
        <div className="container mx-auto max-w-3xl px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Globe className="h-4 w-4" /> Slug Marketplace
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              Seu link perfeito
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Garanta <span className="font-semibold text-foreground">jobinlink.com/seunome</span> — pesquise, veja o preço e compre quantos quiser.
            </p>
          </div>

          {/* My Slugs */}
          {userSlugs.length > 0 && (
            <div className="mb-8 rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" /> Seus Slugs
              </h3>
              <div className="flex flex-wrap gap-2">
                {userSlugs.map(s => (
                  <Badge key={s} variant="secondary" className="font-mono text-sm">
                    /{s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Digite o slug desejado... ex: dev, joao, ceo"
              className="pl-12 h-14 text-lg rounded-xl border-2 border-border focus:border-primary"
            />
          </div>

          {/* Results */}
          {searchResults.length > 0 && (
            <div className="space-y-3 mb-8">
              <h3 className="text-sm font-medium text-muted-foreground">Resultados</h3>
              {searchResults.map(r => (
                <div
                  key={r.slug}
                  className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
                    r.available
                      ? 'border-border bg-card hover:border-primary/40'
                      : 'border-destructive/20 bg-destructive/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {r.available ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
                        <X className="h-4 w-4 text-destructive" />
                      </div>
                    )}
                    <div>
                      <p className="font-mono font-semibold text-base">
                        jobinlink.com/<span className="text-primary">{r.slug}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {r.type === 'premium' && (
                          <Badge variant="default" className="text-[10px] gap-1">
                            <Sparkles className="h-3 w-3" /> Premium
                          </Badge>
                        )}
                        {!r.available && (
                          <span className="text-xs text-destructive">Indisponível</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${r.priceCents === 0 ? 'text-green-600' : 'text-foreground'}`}>
                      {formatPrice(r.priceCents)}
                    </span>
                    {r.available && (
                      <Button
                        size="sm"
                        onClick={() => addToCart(r.slug)}
                        disabled={cart.some(c => c.slug === r.slug)}
                        className="gap-1"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {cart.some(c => c.slug === r.slug) ? 'No carrinho' : 'Adicionar'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pricing Table */}
          {!search && (
            <div className="rounded-xl border border-border bg-card p-6 mb-8">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" /> Tabela de Preços (nomes fortes)
              </h3>
              <p className="text-xs text-muted-foreground mb-4">Taxa anual $7 por slug. Quem paga mensalidade do mini-site tem 1 slug incluso.</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { len: 1, key: 'slug_price_1_char', ex: '/a, /x' },
                  { len: 2, key: 'slug_price_2_chars', ex: '/ai, /js' },
                  { len: 3, key: 'slug_price_3_chars', ex: '/dev, /ceo' },
                  { len: 4, key: 'slug_price_4_chars', ex: '/joao, /link' },
                  { len: 5, key: 'slug_price_5_chars', ex: '/maria' },
                  { len: 6, key: 'slug_price_6_chars', ex: '/empresa' },
                  { len: 7, key: 'slug_price_7_chars', ex: '/designer' },
                  { len: '8+', key: 'slug_price_8_plus', ex: '$5.99' },
                ].map(({ len, key, ex }) => (
                  <div key={String(len)} className="rounded-lg bg-muted/40 p-4">
                    <p className="text-sm text-muted-foreground">{len} {len === '8+' ? 'caracteres' : 'caractere' + (len !== 1 ? 's' : '')}</p>
                    <p className="text-xl font-bold">{formatPrice((pricing as any)[key])}</p>
                    <p className="text-xs text-muted-foreground">{ex}</p>
                  </div>
                ))}
              </div>
              {premiumSlugs.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-amber-500" /> Slugs Premium
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {premiumSlugs.slice(0, 20).map(p => (
                      <button
                        key={p.slug}
                        onClick={() => setSearch(p.slug)}
                        className="rounded-full border border-amber-500/30 bg-amber-500/5 px-3 py-1 text-sm font-mono hover:bg-amber-500/10 transition-colors"
                      >
                        /{p.slug} <span className="text-amber-600 font-semibold ml-1">{formatPrice(p.price_cents)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cart */}
          {cart.length > 0 && (
            <div className="sticky bottom-4 z-50 rounded-2xl border-2 border-primary bg-card shadow-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Carrinho ({cart.length})
                </h3>
                <span className="text-2xl font-bold text-primary">{formatPrice(totalCents)}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {cart.map(c => (
                  <div key={c.slug} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
                    <span className="font-mono font-medium">/{c.slug}</span>
                    <span className="text-muted-foreground">{formatPrice(c.priceCents)}</span>
                    <button onClick={() => removeFromCart(c.slug)} className="ml-1 text-destructive hover:text-destructive/80">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleCheckout}
                disabled={purchasing}
                className="w-full h-12 text-base gap-2"
              >
                {purchasing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CreditCard className="h-5 w-5" />
                )}
                {totalCents > 0 ? `Comprar por ${formatPrice(totalCents)}` : 'Registrar Slugs Grátis'}
              </Button>
              {!user && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Você precisa fazer login para comprar
                </p>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SlugMarketplace;
