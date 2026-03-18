import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import BroadcastBanner from '@/components/BroadcastBanner';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { AuthProvider } from '@/hooks/useAuth';
import { MemoryRouter } from 'react-router-dom';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BroadcastBanner />
              <MemoryRouter>
                <Component {...pageProps} />
              </MemoryRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </AuthProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

