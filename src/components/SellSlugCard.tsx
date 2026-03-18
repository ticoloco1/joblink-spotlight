import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Tag, DollarSign, Gavel, XCircle } from 'lucide-react';
import { getProfileUrl } from '@/lib/baseUrl';

interface SellSlugCardProps {
  slug: string;
  profileId: string | null;
  userId: string;
  userType: string;
}

type ListingType = 'fixed' | 'auction';

interface Listing {
  id: string;
  slug: string;
  price_cents: number;
  type: ListingType;
  status: string;
}

export default function SellSlugCard({ slug, profileId, userId, userType }: SellSlugCardProps) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [price, setPrice] = useState('');
  const [type, setType] = useState<ListingType>('fixed');

  const profileUrl = getProfileUrl(slug, userType === 'company');

  useEffect(() => {
    if (!slug || !userId) return;
    const fetchListing = async () => {
      const { data } = await supabase
        .from('slug_marketplace' as any)
        .select('id, slug, price_cents, type, status')
        .eq('owner_id', userId)
        .eq('slug', slug)
        .eq('status', 'active')
        .maybeSingle();
      // `data` pode vir com tipo de erro do Supabase (por causa das tipagens de relacionamento).
      // Este cast mantém o comportamento runtime e remove erro de build/TS.
      setListing(data as unknown as Listing | null);
      setLoading(false);
    };
    fetchListing();
  }, [slug, userId]);

  const handleList = async () => {
    const value = parseFloat(price.replace(',', '.'));
    if (Number.isNaN(value) || value <= 0) {
      toast.error('Informe um preço válido (ex: 99.90)');
      return;
    }
    const priceCents = Math.round(value * 100);
    const expiresAt = type === 'auction'
      ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      : null;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('slug_marketplace' as any).insert({
        slug,
        owner_id: userId,
        profile_id: profileId || null,
        price_cents: priceCents,
        type,
        status: 'active',
        expires_at: expiresAt,
      });
      if (error) throw error;
      toast.success(type === 'auction' ? 'Slug em leilão (24h)!' : 'Slug colocado à venda!');
      const { data: inserted } = await supabase
        .from('slug_marketplace' as any)
        .select('id')
        .eq('owner_id', userId)
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      const insertedId = (inserted as any)?.id as string | undefined;
      if (insertedId) setListing({ id: insertedId, slug, price_cents: priceCents, type, status: 'active' });
      setPrice('');
    } catch (e: any) {
      toast.error(e.message || 'Erro ao publicar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!listing?.id) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('slug_marketplace' as any)
        .update({ status: 'cancelled' })
        .eq('id', listing.id);
      if (error) throw error;
      toast.success('Anúncio cancelado');
      setListing(null);
    } catch (e: any) {
      toast.error(e.message || 'Erro ao cancelar');
    } finally {
      setSubmitting(false);
    }
  };

  if (!slug) return null;
  if (loading) {
    return (
      <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
      </div>
    );
  }

  if (listing) {
    return (
      <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium mb-1">
          <Tag className="h-4 w-4" /> Slug à venda
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-mono font-semibold">/{slug}</span> — {(listing.price_cents / 100).toFixed(2)} USD ({listing.type === 'auction' ? 'leilão' : 'preço fixo'})
        </p>
        <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={handleCancel} disabled={submitting}>
          {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
          Cancelar venda
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 font-medium mb-2">
        <Tag className="h-4 w-4 text-primary" /> Colocar slug à venda
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        <span className="font-mono">/{slug}</span> — Venda por preço fixo ou leilão. Comissão 20%.
      </p>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="w-28">
          <Label className="text-xs">Preço (USD)</Label>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="99.90"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('fixed')}
            className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-sm ${type === 'fixed' ? 'border-primary bg-primary/10 text-primary' : 'border-border'}`}
          >
            <DollarSign className="h-4 w-4" /> Fixo
          </button>
          <button
            type="button"
            onClick={() => setType('auction')}
            className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-sm ${type === 'auction' ? 'border-primary bg-primary/10 text-primary' : 'border-border'}`}
          >
            <Gavel className="h-4 w-4" /> Leilão
          </button>
        </div>
        <Button size="sm" onClick={handleList} disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Colocar à venda
        </Button>
      </div>
    </div>
  );
}
