import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PricingConfig {
  monthly: number;
  slug: number;
  ads: number;
}

export interface FeaturesConfig {
  auction_enabled: boolean;
  ads_enabled: boolean;
}

export interface SettingsMap {
  pricing?: PricingConfig;
  features?: FeaturesConfig;
  [key: string]: unknown;
}

const DEFAULT_PRICING: PricingConfig = {
  monthly: 29.9,
  slug: 99.9,
  ads: 10,
};

const DEFAULT_FEATURES: FeaturesConfig = {
  auction_enabled: true,
  ads_enabled: true,
};

/** Busca todas as configs e devolve formato { pricing: {...}, features: {...} } — FASE 2: uso no app */
export async function fetchSettings(): Promise<SettingsMap> {
  const { data, error } = await supabase.from('settings').select('key, value');
  if (error) throw error;
  const formatted: SettingsMap = {};
  (data ?? []).forEach((item: { key: string; value: unknown }) => {
    formatted[item.key] = item.value;
  });
  return formatted;
}

/** Atualiza uma config (admin) — equivalente ao /api/settings/update */
export async function updateSetting(key: string, value: unknown): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .update({ value } as any)
    .eq('key', key);
  if (error) throw error;
}

export function useSettings() {
  const queryClient = useQueryClient();
  const { data: raw, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });

  const pricing: PricingConfig = (raw?.pricing as PricingConfig) ?? DEFAULT_PRICING;
  const features: FeaturesConfig = (raw?.features as FeaturesConfig) ?? DEFAULT_FEATURES;

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) => updateSetting(key, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const update = async (key: string, value: unknown) => {
    await updateMutation.mutateAsync({ key, value });
  };

  return {
    settings: raw ?? {},
    pricing,
    features,
    isLoading,
    update,
    isUpdating: updateMutation.isPending,
  };
}
