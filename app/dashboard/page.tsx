import Dashboard from '@/views/Dashboard';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard | JobinLink',
  robots: 'noindex, nofollow',
};

export default function DashboardPage() {
  // `Dashboard` usa `useSearchParams`, que precisa de Suspense boundary.
  return (
    <Suspense fallback={null}>
      <Dashboard />
    </Suspense>
  );
}
