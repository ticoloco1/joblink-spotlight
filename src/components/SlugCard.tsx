import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Gavel, Loader2, DollarSign } from 'lucide-react';
import { getSlugTag, getGrowthPercent } from '@/lib/slugValuation';

export interface SlugCardData {
  id: string;
  slug: string;
  price_cents: number;
  type: 'fixed' | 'auction';
  expires_at: string | null;
  owner_id: string;
  views?: number;
  score?: number | null;
  tag?: string | null;
  suggested_price?: number | null;
}

interface SlugCardProps {
  item: SlugCardData;
  currentUserId?: string | null;
  onBuy: (id: string) => void;
  onBid?: (id: string, amount: string) => void;
  bidAmount?: string;
  onBidAmountChange?: (id: string, value: string) => void;
  buying?: boolean;
  bidding?: boolean;
}

const formatPrice = (cents: number) =>
  `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;

export default function SlugCard({
  item,
  currentUserId,
  onBuy,
  onBid,
  bidAmount = '',
  onBidAmountChange,
  buying,
  bidding,
}: SlugCardProps) {
  const views = item.views ?? 0;
  const score = item.score ?? 0;
  const tag = item.tag ?? getSlugTag(views, item.slug.length, score);
  const growth = getGrowthPercent(score);
  const isOwner = currentUserId && item.owner_id === currentUserId;

  return (
    <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 hover:scale-[1.02] hover:border-zinc-600 transition-all duration-200">
      <Link to={`/marketplace/slug/${item.slug}`} className="block mb-2">
        <h2 className="text-xl font-bold text-white truncate">{item.slug}</h2>
      </Link>
      {tag && (
        <p className="text-emerald-400 text-sm font-medium mb-0.5">{tag}</p>
      )}
      {growth > 0 && (
        <p className="text-sm text-zinc-400 mb-1">
          +{growth}% crescimento
        </p>
      )}
      <p className="text-amber-400 font-bold text-lg mt-2">
        {formatPrice(item.price_cents)}
      </p>

      {isOwner ? (
        <p className="text-zinc-500 text-sm mt-2">Seu anúncio</p>
      ) : item.type === 'fixed' ? (
        <Button
          className="w-full rounded-xl py-2 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white border-0"
          onClick={(e) => {
            e.preventDefault();
            onBuy(item.id);
          }}
          disabled={!!buying}
        >
          {buying ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Comprar'}
        </Button>
      ) : (
        <div className="mt-2 space-y-2">
          {onBid && onBidAmountChange && (
            <>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Lance (ex: 150)"
                value={bidAmount}
                onChange={(e) => onBidAmountChange(item.id, e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
              />
              <Button
                className="w-full rounded-xl py-2 bg-amber-600 hover:bg-amber-500 text-white border-0 gap-1"
                onClick={(e) => {
                  e.preventDefault();
                  onBid(item.id, bidAmount);
                }}
                disabled={!!bidding}
              >
                {bidding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gavel className="h-4 w-4" />}
                Dar lance
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
