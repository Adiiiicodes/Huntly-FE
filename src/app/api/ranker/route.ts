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

export async function GET(request: NextRequest) {
  try {
    // Get the backend API URL from environment variable
    const apiUrl = process.env.API_BASE_URL || 'https://e9b6-182-48-219-59.ngrok-free.app';
    
    // Get query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const initialResponse = searchParams.get('initialResponse');
    
    if (!query || !initialResponse) {
      return NextResponse.json(
        { error: 'Missing required parameters: query and initialResponse' },
        { status: 400 }
      );
    }
    
    // Construct the URL with query parameters
    const params = new URLSearchParams({
      query: query,
      initialResponse: initialResponse
    });
    
    // Forward the request to the actual backend
    const backendUrl = `${apiUrl}/api/ranker?${params}`;
    console.log('Forwarding request to:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Handle backend errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }
    
    // Return the backend response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Ranker API error:', error);
    
    // Return a friendly error message
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process ranking request',
        data: []
      },
      { status: 500 }
    );
  }
}