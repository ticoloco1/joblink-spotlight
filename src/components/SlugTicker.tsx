'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';

/** Ticker no cabeçalho para venda de slugs — CTA para marketplace */
export default function SlugTicker() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from('slug_marketplace' as any)
      .select('slug' as any)
      .eq('status', 'active')
      .limit(8)
      .then(({ data }) => {
        if (data?.length) {
          setSlugs((data as unknown as { slug: string }[]).map((r) => r.slug));
        }
      })
      .catch(() => {});
  }, []);

  const part = slugs.length > 0 ? `Slugs à venda: ${slugs.join(' · ')} — ` : '';
  const full = `${part}Compre e venda slugs · jobinlink.com/marketplace`;

  return (
    <div className="border-b border-border bg-muted/50 py-1.5">
      <div className="container mx-auto px-4">
        <Link
          to="/marketplace"
          className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <Tag className="h-3.5 w-3.5 shrink-0 text-primary" />
          {full}
        </Link>
      </div>
    </div>
  );
}
