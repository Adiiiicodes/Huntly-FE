import { NextRequest, NextResponse } from 'next/server';

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
<<<<<<< Updated upstream
    // Get the backend API URL from environment variable
    const apiUrl = process.env.API_BASE_URL || 'https://7a71-114-79-138-174.ngrok-free.app';
    
    // Get the question from the request body
=======
    // Use ranker backend API URL
    const apiUrl =
      process.env.API_BASE_URL ||
      'http://localhost:6969';

>>>>>>> Stashed changes
    const body = await request.json();
    
    console.log('Proxying chat request to backend:', `${apiUrl}/api/chat`);
    console.log('Request body:', body);
    
    // Forward the request to the actual backend
    const response = await fetch(`${apiUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    // If the backend returns an error, log details and throw
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error (${response.status}):`, errorText);
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    
    // Parse and return the backend response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Return a friendly error message
    return NextResponse.json(
      { 
        error: 'Failed to process your search request',
        answer: '<p>Sorry, there was an error processing your search request. Please try again later.</p>',
        cached: false
      },
      { status: 500 }
    );
  }
}