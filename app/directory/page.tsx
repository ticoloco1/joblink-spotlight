import Directory from '@/views/Directory';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Professional Directory | JobinLink',
  description:
    'Discover talented professionals from around the world. Browse CVs, portfolios, and connect with top talent on JobinLink.',
  alternates: {
    canonical: 'https://jobinlink.com/directory',
  },
  openGraph: {
    title: 'Professional Directory | JobinLink',
    description:
      'Discover talented professionals from around the world. Browse CVs, portfolios, and connect with top talent on JobinLink.',
    url: 'https://jobinlink.com/directory',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function DirectoryPage() {
  return <Directory />;
}
