import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // TODO: Validate session token and get user data from your database
    // This is a placeholder - replace with your actual user data fetching logic
    const user = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'recruiter',
      companyName: 'Example Corp',
    };

    return NextResponse.json(user);
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 