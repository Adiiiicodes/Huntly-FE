'''import { NextResponse } from 'next/server';

// Utility to handle backend API requests
export async function handleApiRequest(path: string, options: RequestInit) {
  try {
    const apiUrl = process.env.API_BASE_URL || 'http://168.231.122.158';
    const response = await fetch(`${apiUrl}${path}`, options);

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (jsonError) {
      console.error(`Invalid JSON from backend at ${path}:`, text);
      return NextResponse.json(
        {
          error: 'Invalid JSON from backend',
          message: 'Received unexpected response from backend.',
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error(`Backend error at ${path} (${response.status}):`, data);
      return NextResponse.json(
        {
          error: `Backend responded with status: ${response.status}`,
          data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`API request failed at ${path}:`, error);
    return NextResponse.json(
      {
        error: `Failed to fetch from ${path}`,
        message: 'An error occurred while communicating with the backend.',
      },
      { status: 500 }
    );
  }
}''