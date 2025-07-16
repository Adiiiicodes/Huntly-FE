import { NextRequest, NextResponse } from 'next/server';

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
    const apiUrl = process.env.API_BASE_URL || 'https://huntly-be-880043945889.asia-south1.run.app';

    console.log('Proxying GET to:', `${apiUrl}/api/candidates/all`);

    const response = await fetch(`${apiUrl}/api/candidates/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    console.log('Raw backend response (first 500 chars):', text.substring(0, 500));

    try {
      const data = JSON.parse(text);

      if (!response.ok) {
        console.error(`Backend error (${response.status}):`, data);
        throw new Error(`Backend responded with status: ${response.status}`);
      }
      
      // Log the structure of the data
      console.log('Response data type:', typeof data);
      console.log('Is array?', Array.isArray(data));
      console.log('Has data property?', !!data.data);
      console.log('Has candidates property?', !!data.candidates);
      
      // If data is an array, check first item
      if (Array.isArray(data) && data.length > 0) {
        console.log('First candidate from backend:', data[0]);
        console.log('First candidate about field:', data[0].about);
        console.log('First candidate summary field:', data[0].summary);
      }
      
      // If data is wrapped in an object
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        console.log('First candidate from backend (data.data):', data.data[0]);
        console.log('First candidate about field:', data.data[0].about);
        console.log('First candidate summary field:', data.data[0].summary);
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