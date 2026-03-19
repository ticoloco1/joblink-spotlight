/**
 * Vitrines de venda de slugs — mesmo layout, domínios diferentes.
 * jobinlink.com = centro (mini-sites, dashboard, auth).
 * Demais domínios = landing de busca + CTAs que levam ao jobinlink.com
 */

export const CENTER_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_CENTER_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APP_CENTER_URL) ||
  'https://jobinlink.com';

export type SlugPrefix = 's' | 'handle';

export interface StorefrontConfig {
  domain: string;
  name: string;
  slugPrefix: SlugPrefix; // 's' = /s Página, 'handle' = /@ Handle
}

export const STOREFRONT_DOMAINS: StorefrontConfig[] = [
  // Por enquanto, estamos focando apenas no hub `jobinlink.com`.
];

export function getStorefront(hostname: string): StorefrontConfig | null {
  const normalized = hostname.replace(/^www\./, '').toLowerCase();
  return STOREFRONT_DOMAINS.find((s) => s.domain === normalized) ?? null;
}

export function isStorefront(hostname: string): boolean {
  return getStorefront(hostname) != null;
}
