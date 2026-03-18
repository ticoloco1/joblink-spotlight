'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Tag, ArrowRightLeft, ShoppingBag } from 'lucide-react';
import { getProfileUrl } from '@/lib/baseUrl';
import SellSlugCard from './SellSlugCard';

interface OwnedSlug {
  slug: string;
  expires_at: string | null;
}

interface MySlugsPanelProps {
  userId: string;
  profileId: string | null;
  currentSlug: string;
  userType: string;
  onSlugSwitched: () => void;
}

export default function MySlugsPanel({ userId, profileId, currentSlug, userType, onSlugSwitched }: MySlugsPanelProps) {
  const [owned, setOwned] = useState<OwnedSlug[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [sellingSlug, setSellingSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('slugs')
      .select('slug, expires_at')
      .eq('owner_id', userId)
      .then(({ data }) => {
        setOwned((data as OwnedSlug[]) || []);
        setLoading(false);
      });
  }, [userId]);

  const handleUseOnMinisite = async (slug: string) => {
    if (!profileId || slug === currentSlug) return;
    setSwitching(slug);
    try {
      const { error } = await supabase.from('profiles').update({ slug }).eq('id', profileId);
      if (error) throw error;
      toast.success(`Mini-site agora usa /${slug}`);
      onSlugSwitched();
    } catch (e: any) {
      toast.error(e.message || 'Erro ao trocar');
    } finally {
      setSwitching(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Carregando seus slugs...
      </div>
    );
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://jobinlink.com';

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-card mb-8">
      <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
        <Tag className="h-5 w-5 text-primary" /> Meus slugs
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Veja seus slugs, coloque à venda ou troque qual está em uso no mini-site. Todos podem negociar slugs.
      </p>

      {owned.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">Você ainda não tem slugs. Compre em <a href="/slugs" className="text-primary underline">Comprar Slugs</a> ou use o slug do seu perfil.</p>
      ) : (
        <ul className="space-y-3">
          {owned.map(({ slug, expires_at }) => (
            <li key={slug} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">/{slug}</span>
                <a href={getProfileUrl(slug, userType === 'company')} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary">
                  {getProfileUrl(slug, userType === 'company').replace(baseUrl, '')}
                </a>
                {slug === currentSlug && (
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">Em uso</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {slug !== currentSlug && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleUseOnMinisite(slug)}
                    disabled={!!switching}
                  >
                    {switching === slug ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRightLeft className="h-3 w-3" />}
                    Usar no mini-site
                  </Button>
                )}
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setSellingSlug(sellingSlug === slug ? null : slug)}>
                  <ShoppingBag className="h-3 w-3" /> {sellingSlug === slug ? 'Fechar' : 'Vender'}
                </Button>
              </div>
              {sellingSlug === slug && (
                <div className="w-full mt-2 pt-2 border-t border-border">
                  <SellSlugCard slug={slug} profileId={profileId} userId={userId} userType={userType} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex gap-2">
        <Button asChild variant="outline" size="sm">
          <a href="/slugs">Comprar Slugs</a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href="/marketplace">Marketplace</a>
        </Button>
      </div>
    </section>
  );
}
