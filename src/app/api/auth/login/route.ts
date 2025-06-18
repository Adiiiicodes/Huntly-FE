import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // TODO: Validate credentials against your database
    // This is a placeholder - replace with your actual authentication logic
    if (email === 'john@example.com' && password === 'password') {
      const user = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'recruiter',
        companyName: 'Example Corp',
      };

      // Set session cookie
      cookies().set('session_token', 'dummy-session-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return NextResponse.json(user);
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 