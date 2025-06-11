// src/services/rankService.tsx
import { Candidate } from '@/types/candidate';

export const rankService = {
  rankCandidates: async (query: string, initialResponse: string): Promise<Candidate[]> => {
    try {
      // Set API base URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://e721-182-48-220-108.ngrok-free.app';

      const res = await fetch(`${apiUrl}/api/ranker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, initialResponse })
      });

      if (!res.ok) {
        console.error('HTTP error during ranking!', res.status);
        return [];
      }

      const responseData = await res.json();
      console.log('Response from /api/ranker:', responseData);

      // If the backend didn't return a success flag, treat as failure
      if (!responseData.success || !Array.isArray(responseData.data)) {
        console.warn('Ranker response invalid:', responseData);
        return [];
      }

      // Transform the ranked candidates into expected format
      return responseData.data.map((candidate: any) => ({
        id: candidate.id,
        name: candidate.name,
        title: candidate.title || 'N/A',
        location: candidate.location || 'N/A',
        experience: `${candidate.experience_years || 0} years`,
        skills: candidate.skills || [],
        availability: candidate.availability || 'available',
        matchScore: candidate.rank || 0,
        summary: candidate.summary || '',
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${candidate.name}`,
        salary: candidate.salary || 'N/A',
        education: candidate.education || 'N/A',
      }));
    } catch (error) {
      console.error('Error during candidate ranking:', error);
      return [];
    }
  }
};
