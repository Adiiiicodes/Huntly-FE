import { TalentPoolStats } from './analytics';
import { fetchCandidates } from '@/lib/api';
import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/Skeletons';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  const query = searchParams.query;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Talent Pool Dashboard</h1>
      <Suspense fallback={<DashboardSkeleton />}>
        {/* Pass the query directly - no need to access searchParams.query here */}
        <DashboardContent query={query} />
      </Suspense>
    </div>
  );
}

async function DashboardContent({ query }: { query?: string }) {
  const searchQuery = query || 'engineers';
  const candidates = await fetchCandidates(searchQuery);
  
  if (candidates.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No candidate data found. Try a different search query.
        </p>
      </div>
    );
  }

  return <TalentPoolStats candidates={candidates} />;
}