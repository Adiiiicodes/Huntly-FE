import { Candidate } from '@/types/candidate';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://f1ad-2405-201-4a-70a0-f578-6ab7-3051-2e18.ngrok-free.app';

async function fetchInitialResponse(query: string): Promise<string> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: query }),
    });

    const data = await res.json();

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
      const initialResponse = await fetchInitialResponse(query);

      const res = await fetch(`${API_BASE_URL}/api/candidates/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, initialResponse }),
      });

      if (!res.ok) {
        console.error('HTTP error!', res.status);
        return [];
      }

      const responseData = await res.json();
      console.log('Response from /api/candidates/search:', responseData);

      const candidatesArray = Array.isArray(responseData)
        ? responseData
        : responseData.data;

      if (!Array.isArray(candidatesArray)) {
        console.error('Expected an array in response, got:', candidatesArray);
        return [];
      }

      return candidatesArray.map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        title: candidate.title || 'N/A',
        location: candidate.location,
        experience: `${Math.round(candidate.experience_years || 0)} years`,
        skills: candidate.skills || [],
        availability: 'available',
        matchScore: 0,
        summary: '',
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${candidate.name}`,
        salary: 'N/A',
        education: 'Bachelor\'s degree',
      }));
    } catch (error) {
      console.error('Error during candidate search:', error);
      return [];
    }
  }
};
