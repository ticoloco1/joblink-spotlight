'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Tag, ArrowRightLeft, ShoppingBag, ChevronRight, X } from 'lucide-react';
import { getProfileUrl } from '@/lib/baseUrl';
import SellSlugCard from './SellSlugCard';

interface OwnedSlug {
  slug: string;
  expires_at: string | null;
}

interface DashboardSlugBarProps {
  userId: string;
  profileId: string | null;
  currentSlug: string;
  userType: string;
  onSlugSwitched: () => void;
}

export default function DashboardSlugBar({
  userId,
  profileId,
  currentSlug,
  userType,
  onSlugSwitched,
}: DashboardSlugBarProps) {
  const [owned, setOwned] = useState<OwnedSlug[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [showSwitch, setShowSwitch] = useState(false);
  const [sellSlug, setSellSlug] = useState<string | null>(null);

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
      setShowSwitch(false);
    } catch (e: any) {
      toast.error(e.message || 'Erro ao trocar');
    } finally {
      setSwitching(null);
    }
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://jobinlink.com';
  const profileUrl = getProfileUrl(currentSlug, userType === 'company');
  const profilePath = profileUrl.replace(baseUrl, '');

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando slug...
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Linha do slug acima da foto */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
        <Tag className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm text-muted-foreground shrink-0">Seu mini-site:</span>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono font-semibold text-primary hover:underline shrink-0"
        >
          {profilePath}
        </a>
        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          {owned.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1 h-8"
              onClick={() => setShowSwitch((v) => !v)}
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Trocar
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1 h-8"
            onClick={() => setSellSlug(sellSlug === currentSlug ? null : currentSlug)}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {sellSlug === currentSlug ? 'Fechar' : 'Vender'}
          </Button>
        </div>
      </div>

      {/* Lista de slugs que passa para o lado (trocar) */}
      {showSwitch && owned.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">Clique para usar no mini-site:</span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {owned.map(({ slug }) => (
              <button
                key={slug}
                type="button"
                onClick={() => handleUseOnMinisite(slug)}
                disabled={switching !== null || slug === currentSlug}
                className={`
                  shrink-0 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-mono
                  transition-colors
                  ${slug === currentSlug
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card hover:bg-muted/50'}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                /{slug}
                {slug === currentSlug && <span className="text-xs">(em uso)</span>}
                {switching === slug && <Loader2 className="h-3 w-3 animate-spin" />}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="shrink-0 h-8 w-8 p-0" onClick={() => setShowSwitch(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Colocar à venda (inline) */}
      {sellSlug && (
        <div className="mt-3 rounded-xl border border-border bg-card p-4">
          <SellSlugCard
            slug={sellSlug}
            profileId={profileId}
            userId={userId}
            userType={userType}
          />
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setSellSlug(null)}>
            Fechar
          </Button>
        </div>
      )}
    </div>
  );
}
