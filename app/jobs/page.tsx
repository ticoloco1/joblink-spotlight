import Jobs from '@/pages/Jobs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Listings — Find Your Next Opportunity | JobinLink',
  description:
    'Browse the latest job listings from top companies. Find full-time, part-time, and remote opportunities on JobinLink.',
  alternates: {
    canonical: 'https://jobinlink.com/jobs',
  },
  openGraph: {
    title: 'Job Listings | JobinLink',
    description: 'Browse the latest job listings from top companies worldwide.',
    url: 'https://jobinlink.com/jobs',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <Jobs />;
}
