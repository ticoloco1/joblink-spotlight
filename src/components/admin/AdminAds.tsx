import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';

interface AdRecord {
  id: string;
  title: string;
  placement: string;
  format?: string;
  banner_url: string | null;
  target_url: string | null;
  status: string;
  impressions: number;
  clicks: number;
  created_at: string;
}

const AdminAds = () => {
  const [ads, setAds] = useState<AdRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    setLoading(true);
    const { data } = await supabase.from('ads').select('*').order('created_at', { ascending: false });
    if (data) setAds(data as AdRecord[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('ads').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Anúncio ${status}`);
      setAds((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    }
  };

  const deleteAd = async (id: string) => {
    const { error } = await supabase.from('ads').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Anúncio excluído');
      setAds((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600',
    approved: 'bg-accent/10 text-accent',
    rejected: 'bg-destructive/10 text-destructive',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const pending = ads.filter((a) => a.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Gerenciar Anúncios</h2>
          <p className="text-sm text-muted-foreground">{ads.length} anúncios • {pending.length} pendentes</p>
        </div>
      </div>

      {ads.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">Nenhum anúncio ainda</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ads.map((ad) => (
            <div key={ad.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              {ad.banner_url && (
                <img src={ad.banner_url} alt={ad.title} className="w-full h-28 object-cover rounded-lg mb-3 bg-muted" />
              )}
              <h3 className="font-medium">{ad.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{ad.placement}</span>
                <span>•</span>
                <span>{ad.format === 'square' ? 'quadrado' : 'banner'}</span>
                <span>•</span>
                <span>{ad.impressions} impr.</span>
                <span>•</span>
                <span>{ad.clicks} cliques</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[ad.status] || ''}`}>
                  {ad.status}
                </span>
                <div className="flex gap-1">
                  {ad.status !== 'approved' && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateStatus(ad.id, 'approved')}>
                      <CheckCircle className="h-4 w-4 text-accent" />
                    </Button>
                  )}
                  {ad.status !== 'rejected' && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateStatus(ad.id, 'rejected')}>
                      <XCircle className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteAd(ad.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAds;
