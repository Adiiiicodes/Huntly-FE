// Updated Next.js API route handler (api/ranker/route.ts)
import { NextRequest, NextResponse } from 'next/server';

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

// POST method only
export async function POST(request: NextRequest) {
  try {
    // Get the backend API URL from environment variable
    const apiUrl = process.env.API_BASE_URL || 'https://a3ae-2405-201-4a-70a0-f578-6ab7-3051-2e18.ngrok-free.app';
    
    // Get request body
    const body = await request.json();
    const { query, initialResponse } = body;
    
    if (!query || !initialResponse) {
      return NextResponse.json(
        { error: 'Missing required parameters: query and initialResponse in request body' },
        { status: 400 }
      );
    }
    
    console.log('=== RANKER API DEBUG INFO ===');
    console.log('Query:', query);
    console.log('Initial response length:', initialResponse.length);
    
    // Display a preview of the content
    console.log('Response Preview (first 200 chars):', initialResponse.substring(0, 200));
    console.log('Response Preview (last 200 chars):', initialResponse.substring(initialResponse.length - 200));
    
    // Forward the request to the actual backend
    console.log('Forwarding request to backend:', `${apiUrl}/api/ranker`);
    const response = await fetch(`${apiUrl}/api/ranker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        initialResponse
      })
    });
    
    // Handle backend errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }
    
    // Get response as text first to inspect
    const responseText = await response.text();
    console.log('Raw backend response length:', responseText.length);
    console.log('Raw backend response preview:', responseText.substring(0, 200));
    
    // Parse the response
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed response successfully');
    } catch (parseError) {
      console.error('Failed to parse backend response as JSON:', parseError);
      throw new Error('Invalid JSON response from backend');
    }
    
    // Analyze the response data
    console.log('Response success flag:', data.success);
    console.log('Response data array length:', data.data?.length || 0);
    
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((candidate, index) => {
        console.log(`Candidate ${index + 1}:`, candidate.id, candidate.name);
        console.log(`Candidate ${index + 1} properties:`, Object.keys(candidate).join(', '));
      });
      
      // Ensure we have at least two candidates
      if (data.data.length === 1) {
        console.log('Only one candidate found, adding a second candidate for testing');
        const firstCandidate = data.data[0];
        data.data.push({
          id: 'cand_002',
          rank: '2',
          name: 'Additional Candidate',
          location: 'Not specified',
          skills: ['Skill 1', 'Skill 2', 'Skill 3'],
          experience_years: 3
        });
      }
    }
    
    console.log('=== END RANKER API DEBUG INFO ===');
    
    // Return the enhanced response
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Ranker API error:', error);
    
    // Return a friendly error message
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process ranking request',
        details: error.message,
        data: []
      },
      { status: 500 }
    );
  }
}