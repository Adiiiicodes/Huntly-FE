import { Candidate } from '@/types/candidate';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://2625-2405-201-4a-70a0-8c11-cd71-fd69-d07.ngrok-free.app';

async function fetchInitialResponse(query: string): Promise<string> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: query }),
    });

    const data = await res.json().catch(() => {
      throw new Error('Invalid JSON in response from /api/chat');
    });

    if (!res.ok || data.error || !data.answer || data.answer.includes('error')) {
      throw new Error(data.error || 'Invalid response from chat API');
    }

    return data.answer;
  } catch (error) {
    console.error('Error fetching initial response:', error);
    throw error;
  }
}

export const candidateService = {
  searchCandidates: async (query: string): Promise<Candidate[]> => {
    try {
      if (typeof window === 'undefined') {
        console.warn('Skipping candidate search on server to avoid hydration issues');
        return [];
      }

      const initialResponse = await fetchInitialResponse(query);

      const res = await fetch(`${API_BASE_URL}/api/candidates/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, initialResponse }),
      });

      if (!res.ok) {
        console.error('HTTP error fetching candidates:', res.status);
        return [];
      }

      const responseData = await res.json().catch(() => {
        throw new Error('Invalid JSON in response from /api/candidates/search');
      });

      const candidatesArray = Array.isArray(responseData)
        ? responseData
        : responseData.data;

      if (!Array.isArray(candidatesArray)) {
        console.error('Expected an array in response, got:', candidatesArray);
        return [];
      }

     return candidatesArray.map((candidate: any) => {
  return {
    id: candidate._id || candidate.id || Math.random().toString(36).substring(2),
    fullName: candidate.fullName || 'N/A',
    jobTitle: candidate.jobTitle || 'Not Specified',
    addressWithCountry: candidate.addressWithCountry || 'Unknown',
    experienceYears: candidate.experienceYears || 0,
    skills: candidate.skills || [],
    availability: candidate.availability || 'Unknown',
    matchScore: candidate.matchScore || 0,
    summary: candidate.summary || 'No summary provided.',
    avatar: candidate.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(candidate.fullName || candidate.id)}`,
    salary: candidate.salary || 'N/A',
    education: candidate.education || 'N/A',
    linkedinUrl: candidate.linkedinUrl || 'n/a',
  };
});
    } catch (error) {
      console.error('Error during candidate search:', error);
      return [];
    }
  },
};
