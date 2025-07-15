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
<<<<<<< Updated upstream
    const apiUrl = process.env.API_BASE_URL || 'https://huntlybackend.onrender.com';
=======
    const apiUrl = process.env.API_BASE_URL || 'http://localhost:6969';
>>>>>>> Stashed changes
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