import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // You can access the request body here, for example:
     const data = await request.json();
     console.log('Received chat request data:', data);

    // Add your chat logic here, or forward the request to your Render API

    // For now, return a simple success response
    return NextResponse.json({ message: 'Chat request received successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error handling chat request:', error);
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
} 