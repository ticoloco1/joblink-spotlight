/**
 * Valorização de slugs — "cérebro do mercado"
 * score = visitas + cliques + comprimento (curto vale mais) + palavras premium
 * price = max(10, score * 0.5)
 */

const PREMIUM_WORDS = [
  'bank', 'crypto', 'ai', 'bet', 'job', 'pro', 'hub', 'link', 'vip',
  'pay', 'money', 'cash', 'tech', 'dev', 'ceo', 'meta', 'web3', 'nft',
];

export interface SlugData {
  views: number;
  clicks: number;
  slug: string;
  sales_count?: number;
  ctr?: number;
  search_demand?: number;
}

export function calculateSlugValue(slugData: SlugData): number {
  let score = 0;
  const { views = 0, clicks = 0, slug = '' } = slugData;
  const len = slug.length;

  score += views * 0.05;
  score += clicks * 0.1;
  score += Math.max(0, 20 - len) * 5;

  const hasPremium = PREMIUM_WORDS.some((w) =>
    slug.toLowerCase().includes(w)
  );
  if (hasPremium) score += 100;

  if (slugData.ctr != null) score += slugData.ctr * 2;
  if (slugData.search_demand != null) score += slugData.search_demand * 0.5;
  if (slugData.sales_count != null) score += slugData.sales_count * 20;

  return Math.round(score * 100) / 100;
}

export function scoreToSuggestedPrice(score: number): number {
  return Math.max(10, Math.round(score * 0.5 * 100) / 100);
}

/** Tag para gatilho mental (Trending, Raro, etc.) */
export function getSlugTag(views: number, slugLength: number, score: number): string | null {
  if (views > 1000) return '🔥 Tendência';
  if (slugLength <= 4) return '💎 Raro';
  if (score > 200) return '🚀 Potencial alto';
  if (score > 100) return '🧠 Inteligente';
  if (score > 50 && score <= 100) return '💰 Subvalorizado';
  return null;
}

/** Simulação de valorização: "+X% nos últimos 30 dias" */
export function getGrowthPercent(score: number): number {
  return Math.min(999, Math.round((score / 100) * 20));
}

/** Gerador de slugs a partir de listas de palavras */
export function generateSlugCombos(
  words1: string[],
  words2: string[],
  options?: { reverse?: boolean; separator?: string }
): string[] {
  const sep = options?.separator ?? '';
  const reverse = options?.reverse ?? true;
  const set = new Set<string>();

  for (const w1 of words1) {
    for (const w2 of words2) {
      const a = `${w1}${sep}${w2}`.toLowerCase().trim();
      const b = reverse ? `${w2}${sep}${w1}`.toLowerCase().trim() : '';
      set.add(a);
      if (b) set.add(b);
    }
  }
  return Array.from(set);
}

/** Ex: 1 palavra → [bank], 2 → [bankai], 3 → [bankaihub] */
export function generateSlugChains(
  wordLists: string[][],
  maxLength: number = 3
): string[] {
  const results: string[] = [];
  const stack: string[] = [];

  function recurse(depth: number) {
    if (depth >= maxLength) return;
    const list = wordLists[depth];
    if (!list) return;
    for (const w of list) {
      stack.push(w);
      results.push(stack.join('').toLowerCase());
      recurse(depth + 1);
      stack.pop();
    }
  }
  recurse(0);
  return Array.from(new Set(results));
}
