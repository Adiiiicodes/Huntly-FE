import { NextRequest, NextResponse } from 'next/server';

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET() {
  try {
    const apiUrl = process.env.API_BASE_URL || 'http://168.231.122.158';

    console.log('Proxying GET to:', `${apiUrl}/api/candidates/all`);

    const response = await fetch(`${apiUrl}/api/candidates/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);

      if (!response.ok) {
        console.error(`Backend error (${response.status}):`, data);
        throw new Error(`Backend responded with status: ${response.status}`);
      }

      return NextResponse.json(data);
    } catch (jsonError) {
      console.error('Invalid JSON from backend:', text);
      return NextResponse.json(
        {
          error: 'Invalid JSON from backend',
          message: 'Received unexpected response from backend.',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('All API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch all candidates',
        message: 'An error occurred while retrieving candidates. Please try again later.',
      },
      { status: 500 }
    );
  }
}