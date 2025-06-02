// src/app/dashboard/DashboardContent.tsx
import { fetchCandidates } from '@/lib/api';
import { TalentPoolStats } from './analytics';

export default async function DashboardContent({ query }: { query: string }) {
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