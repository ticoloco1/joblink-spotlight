import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type SettingsMap = Record<string, string>;

export function usePlatformSettings(category?: string) {
  const { data: raw, isLoading } = useQuery({
    queryKey: ['platform_settings', category ?? 'all'],
    queryFn: async () => {
      let q = supabase.from('platform_settings').select('key, value');
      if (category) q = q.eq('category', category);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as { key: string; value: string }[];
    },
  });

  const settings: SettingsMap = {};
  if (raw) raw.forEach(({ key, value }) => { settings[key] = value; });

  const get = (key: string): string => settings[key] ?? '';
  const getNumber = (key: string): number => {
    const v = settings[key];
    if (v === undefined || v === '') return 0;
    const n = parseFloat(v);
    return Number.isNaN(n) ? 0 : n;
  };
  const getCents = (key: string): number => getNumber(key);

  return { settings, get, getNumber, getCents, isLoading };
}
