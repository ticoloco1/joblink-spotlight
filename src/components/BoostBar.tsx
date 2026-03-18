import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Rocket, Loader2, TrendingUp, Home } from 'lucide-react';
import { toast } from 'sonner';

interface BoostBarProps {
  profileId: string;
  profileName: string;
  boostScore: number;
  homepageUntil?: string | null;
  onBoosted?: (newScore: number) => void;
}

const HOMEPAGE_THRESHOLD = 1000;
const BOOST_PRICE = 1.50;

const BoostBar = ({ profileId, profileName, boostScore, homepageUntil, onBoosted }: BoostBarProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const progress = Math.min((boostScore / HOMEPAGE_THRESHOLD) * 100, 100);
  const isOnHomepage = homepageUntil && new Date(homepageUntil) > new Date();
  const remaining = HOMEPAGE_THRESHOLD - boostScore;

  const handleBoost = async () => {
    if (!user) {
      toast.error('Faça login para dar boost');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-boost-checkout', {
        body: { profileId, quantity },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) window.open(data.url, '_blank');
      if (data?.newScore && onBoosted) onBoosted(data.newScore);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar boost');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-3 mt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Rocket className="h-4 w-4 text-primary" />
          <span>Boost</span>
          {isOnHomepage && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-semibold">
              <Home className="h-3 w-3" /> Na Home!
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {boostScore}/{HOMEPAGE_THRESHOLD}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {!isOnHomepage && (
        <p className="text-xs text-muted-foreground mb-2">
          <TrendingUp className="inline h-3 w-3 mr-1" />
          Faltam {remaining > 0 ? remaining : 0} boosts para a Home (7 dias)
        </p>
      )}

      <div className="flex items-center gap-2">
        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="rounded-md border border-border bg-background px-2 py-1 text-xs"
        >
          <option value={1}>1x ($1.50)</option>
          <option value={5}>5x ($7.50)</option>
          <option value={10}>10x ($15.00)</option>
          <option value={50}>50x ($75.00)</option>
          <option value={100}>100x ($150.00)</option>
        </select>
        <Button onClick={handleBoost} size="sm" disabled={loading} className="flex-1 text-xs">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Rocket className="h-3 w-3 mr-1" />}
          Boost — ${(quantity * BOOST_PRICE).toFixed(2)}
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground mt-1.5">
        60% vai para o profissional · 40% plataforma
      </p>
    </div>
  );
};

export default BoostBar;
