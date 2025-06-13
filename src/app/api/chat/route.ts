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
    const apiUrl = process.env.API_BASE_URL || 'https://2625-2405-201-4a-70a0-8c11-cd71-fd69-d07.ngrok-free.app';
    
    // Get the question from the request body
=======
    const apiUrl =
      process.env.API_BASE_URL ||
      'https://2625-2405-201-4a-70a0-8c11-cd71-fd69-d07.ngrok-free.app';
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
<<<<<<< Updated upstream
    
    // If the backend returns an error, log details and throw
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error (${response.status}):`, errorText);
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    
    // Parse and return the backend response
    const data = await response.json();
=======

    const contentType = response.headers.get('content-type');
    const rawText = await response.text();

    let data;
    if (contentType?.includes('application/json')) {
      data = JSON.parse(rawText);
    } else {
      console.error('Expected JSON but got:', rawText);
      return NextResponse.json(
        {
          error: 'Backend did not return JSON',
          answer: '<p>The backend service returned unexpected data.</p>',
          raw: rawText,
          cached: false,
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error(`Backend error (${response.status}):`, data);
      return NextResponse.json(
        {
          error: 'Backend returned an error response',
          data,
        },
        { status: response.status }
      );
    }

    console.log('Backend response data:', data);
>>>>>>> Stashed changes
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Return a friendly error message
    return NextResponse.json(
      { 
        error: 'Failed to process your search request',
<<<<<<< Updated upstream
        answer: '<p>Sorry, there was an error processing your search request. Please try again later.</p>',
        cached: false
=======
        answer:
          '<p>Sorry, there was an error processing your search request. Please try again later.</p>',
        cached: false,
>>>>>>> Stashed changes
      },
      { status: 500 }
    );
  }
}