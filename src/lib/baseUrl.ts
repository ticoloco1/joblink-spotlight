/**
 * URL base do site atual — no jobinlink.com ou em domínios extras (trustbank.xyz, mybik.com, etc.).
 * O slug do usuário é exibido com o domínio que ele está usando.
 */

export function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  const nextUrl = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_CENTER_URL;
  const viteUrl = typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APP_CENTER_URL;
  return (nextUrl || viteUrl || 'https://jobinlink.com') as string;
}

export function getProfilePath(slug: string, isCompany: boolean): string {
  const prefix = isCompany ? 'c' : 'u';
  return `/${prefix}/${slug}`;
}

/** URL completa do perfil (ex: https://trustbank.xyz/u/ary ou https://jobinlink.com/u/ary) */
export function getProfileUrl(slug: string, isCompany: boolean): string {
  return `${getBaseUrl()}${getProfilePath(slug, isCompany)}`;
}
