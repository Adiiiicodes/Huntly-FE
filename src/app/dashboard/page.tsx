// src/app/dashboard/page.tsx
import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/Skeletons';
import DashboardContent from './DashboardContent';

// Next.js will handle the page props typing automatically - don't define custom interfaces
export default function DashboardPage({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  // Extract the query parameter safely
  const query = typeof searchParams.query === 'string' ? searchParams.query : '';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Talent Pool Dashboard</h1>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent query={query} />
      </Suspense>
    </div>
  );
}