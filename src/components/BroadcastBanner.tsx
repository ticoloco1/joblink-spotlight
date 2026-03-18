import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { X, Megaphone } from 'lucide-react';

interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

const BroadcastBanner = () => {
  const { user } = useAuth();
  const [broadcast, setBroadcast] = useState<BroadcastMessage | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadLatestBroadcast();
  }, []);

  const loadLatestBroadcast = async () => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    if (data && data.length > 0) {
      const b = data[0] as BroadcastMessage;
      if (typeof window === 'undefined') return;
      const dismissedIds = JSON.parse(
        window.localStorage.getItem('dismissed_broadcasts') || '[]'
      );
      if (!dismissedIds.includes(b.id)) {
        setBroadcast(b);
      }
    }
  };

  const dismiss = () => {
    if (!broadcast) return;
    if (typeof window === 'undefined') return;
    const dismissedIds = JSON.parse(
      window.localStorage.getItem('dismissed_broadcasts') || '[]'
    );
    dismissedIds.push(broadcast.id);
    window.localStorage.setItem(
      'dismissed_broadcasts',
      JSON.stringify(dismissedIds.slice(-20))
    );
    setBroadcast(null);
  };

  if (!broadcast) return null;

  return (
    <div className="bg-primary text-primary-foreground px-4 py-2.5 relative">
      <div className="container mx-auto flex items-center gap-3 pr-8">
        <Megaphone className="h-4 w-4 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm">{broadcast.title}</span>
          <span className="text-sm ml-2 opacity-90">{broadcast.message}</span>
        </div>
        <button onClick={dismiss} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default BroadcastBanner;
