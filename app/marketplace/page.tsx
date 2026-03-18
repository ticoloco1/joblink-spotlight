import Marketplace from '@/pages/Marketplace';
import { Suspense } from 'react';

export default function Page() {
  // `Marketplace` usa `useSearchParams`, que precisa de Suspense boundary.
  return (
    <Suspense fallback={null}>
      <Marketplace />
    </Suspense>
  );
}
