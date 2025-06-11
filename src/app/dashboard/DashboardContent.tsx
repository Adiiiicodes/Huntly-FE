'use client';

// src/app/dashboard/DashboardContent.tsx
import { useEffect, useState } from 'react';
import { fetchCandidates } from '@/lib/api';
import { TalentPoolStats } from './analytics';
import { Candidate } from '@/lib/types';

export default function DashboardContent({ query }: { query: string }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const searchQuery = query || 'engineers';
        const data = await fetchCandidates(searchQuery);
        setCandidates(data);
      } catch (err) {
        console.error('Error loading candidates:', err);
        setError('Failed to load candidate data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [query]);
  
  if (loading) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Loading candidate data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="rounded-lg border border-dashed border-red-300 p-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

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