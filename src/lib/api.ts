import { ApiResponse, Candidate } from './types';

export async function fetchCandidates(query: string): Promise<Candidate[]> {
  try {
    const response = await fetch(
      `http://localhost:6969/api/candidates/search?response=/api/chat&query=${encodeURIComponent(query)}`,
      {
        next: { revalidate: 3600 } // Revalidate data every hour
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    
    if (!data.success) {
      throw new Error('API response was not successful');
    }

    return data.data || [];
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }
}