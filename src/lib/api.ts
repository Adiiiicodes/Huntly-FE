'use client';

import { ApiResponse, Candidate } from '@/lib/types';

// First, fetch the initial response from the chat API
async function fetchInitialResponse(query: string): Promise<string> {
  try {
    // Use absolute URL to avoid path resolution issues
    const chatResponse = await fetch(`/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question: query })
    });

    if (!chatResponse.ok) {
      throw new Error(`Chat API error! status: ${chatResponse.status}`);
    }

    const data = await chatResponse.json();
    return data.answer || '';
  } catch (error) {
    console.error('Error fetching initial response:', error);
    throw error;
  }
}

// Then use that response to fetch candidates
export async function fetchCandidates(query: string): Promise<Candidate[]> {
  try {
    // First get the initial response from the chat API
    const initialResponse = await fetchInitialResponse(query);
    
    // Then use it to fetch candidates using POST
    // Make sure to use the full URL for external API calls
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://a3ae-2405-201-4a-70a0-f578-6ab7-3051-2e18.ngrok-free.app';
    const response = await fetch(
      `${apiBaseUrl}/api/candidates/search`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query,
          initialResponse: initialResponse
        })
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