// hooks/useCandidates.ts
import { useState, useEffect } from 'react';
import { candidateService } from '@/services/candidateService'; 
import { Candidate } from '@/types/candidate';

export const useCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await candidateService.getAllCandidates();
      setCandidates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch candidates');
    } finally {
      setIsLoading(false);
    }
  };

  const searchCandidates = async (query: string): Promise<Candidate[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await candidateService.searchCandidates(query);
      setCandidates(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search candidates');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  return {
    candidates,
    isLoading,
    error,
    refetch: fetchCandidates,
    searchCandidates,
  };
};
