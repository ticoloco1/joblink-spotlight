import type { Metadata } from 'next';
import Home from '@/pages/Home';

export const metadata: Metadata = {
  title: 'JobinLink — Your Professional Identity, One Link Away',
  description:
    'Create your professional mini-site with CV, portfolio, and links. Get discovered by top companies worldwide.',
  alternates: {
    canonical: 'https://jobinlink.com',
  },
  openGraph: {
    title: 'JobinLink — Professional Mini-Sites & CV Directory',
    description:
      'Create your professional mini-site with CV, portfolio, and links. Get discovered by top companies worldwide.',
    url: 'https://jobinlink.com',
    type: 'website',
    images: [{ url: 'https://jobinlink.com/og-image.jpg', alt: 'JobinLink' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobinLink — Your Professional Identity, One Link Away',
    description:
      'Create your professional mini-site with CV, portfolio, and links.',
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <Home />;
}
