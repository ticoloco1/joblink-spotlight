import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'JobinLink — Sua identidade profissional, um link',
  description: 'Crie seu mini-site com CV, portfólio e links. Seja encontrado por empresas.',
  openGraph: {
    title: 'JobinLink — Sua identidade profissional, um link',
    description: 'Crie seu mini-site com CV, portfólio e links.',
    url: 'https://jobinlink.com',
    siteName: 'JobinLink',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
