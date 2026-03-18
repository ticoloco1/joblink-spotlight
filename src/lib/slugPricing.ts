/**
 * Preços de slugs por tamanho (nomes fortes) + taxa anual.
 * Admin pode alterar em platform_settings; aqui são os defaults.
 */

export const SLUG_PRICE_BY_LENGTH_CENTS: Record<number, number> = {
  1: 100000,   // $1000
  2: 200000,   // $2000
  3: 150000,   // $1500
  4: 130000,   // $1300
  5: 100000,   // $1000
  6: 60000,    // $600
  7: 40000,    // $400
};

/** 8+ letras = $5.99 */
export const SLUG_PRICE_8_PLUS_CENTS = 599;

/** Taxa anual por slug (evitar bagunça) = $7 */
export const SLUG_RENEWAL_ANNUAL_CENTS = 700;

/** Extra por slug adicional ou mini-site extra = $5.99 */
export const SLUG_EXTRA_MONTHLY_CENTS = 599;

/** Preço em centavos por tamanho do slug (1–7 letras ou 8+). overrides vem do admin (platform_settings). */
export function getSlugPriceCentsByLength(length: number, overrides?: Partial<Record<number, number>> & { eightPlus?: number }): number {
  if (length >= 8) return overrides?.eightPlus ?? SLUG_PRICE_8_PLUS_CENTS;
  const table = { ...SLUG_PRICE_BY_LENGTH_CENTS, ...overrides } as Record<number, number>;
  return table[length] ?? SLUG_PRICE_8_PLUS_CENTS;
}
