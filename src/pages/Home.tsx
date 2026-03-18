'use client';
import { getStorefront } from '@/config/storefronts';
import Index from './Index';
import StorefrontLanding from './StorefrontLanding';

/**
 * Rota "/": no jobinlink.com mostra a home do JobinLink;
 * em trustbank.xyz, caixa.xyz, etc. mostra a mesma landing de vitrine (busca + 3 colunas).
 */
export default function Home() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const storefront = getStorefront(hostname);

  if (storefront) {
    return <StorefrontLanding storefront={storefront} hostname={hostname} />;
  }

  return <Index />;
}
