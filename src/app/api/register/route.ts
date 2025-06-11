import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body
    const data = await request.json();

    // Validate the required fields
    if (!data.name || !data.email || !data.phone || !data.resume_text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log the registration data (for debugging, remove in production)
    console.log('Registration request:', data);

    // Here you would typically forward this to your actual backend API
    const apiUrl = process.env.API_BASE_URL || 'https://f5e8-2405-201-4a-70a0-f578-6ab7-3051-2e18.ngrok-free.app';
    const response = await fetch(`${apiUrl}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to process registration request' },
      { status: 500 }
    );
  }
}