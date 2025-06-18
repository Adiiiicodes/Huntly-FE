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
    // Use ranker backend API URL
    const apiUrl =
      process.env.API_BASE_URL ||
      'http://168.231.122.158';

    const body = await request.json();

    console.log('Proxying chat request to backend:', `${apiUrl}/api/chat`);
    console.log('Request body:', body);

    const response = await fetch(`${apiUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

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
          cached: false
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error(`Backend error (${response.status}):`, data);
      return NextResponse.json(
        {
          error: 'Backend returned an error response',
          data
        },
        { status: response.status }
      );
    }

    console.log('Backend response data:', data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Chat API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process your search request',
        answer:
          '<p>Sorry, there was an error processing your search request. Please try again later.</p>',
        cached: false
      },
      { status: 500 }
    );
  }
}
