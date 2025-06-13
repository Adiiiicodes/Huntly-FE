import { Suspense } from 'react';
import CompareClient from './CompareClient'; // ✅ regular import
import { Skeleton } from '@/components/ui/skeleton';

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <Skeleton className="h-[50px] w-64 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[300px] w-full rounded-md" />
            ))}
          </div>
        </div>
      }
    >
      <CompareClient />
    </Suspense>
  );
}
