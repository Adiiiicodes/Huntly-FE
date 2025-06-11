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
    const apiUrl = process.env.API_BASE_URL || 'https://f1ad-2405-201-4a-70a0-f578-6ab7-3051-2e18.ngrok-free.app';
    const body = await request.json();

    console.log('Proxying chat request to backend:', `${apiUrl}/api/chat`);
    console.log('Request body:', body);

    const response = await fetch(`${apiUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Backend error (${response.status}):`, data);
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    console.log('Backend response data:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process your search request',
        answer: '<p>Sorry, there was an error processing your search request. Please try again later.</p>',
        cached: false,
      },
      { status: 500 }
    );
  }
}
