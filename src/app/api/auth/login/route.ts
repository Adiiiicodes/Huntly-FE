import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (( !username) || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Accept login with either email or username
    const validUser = (
      (username === 'john') && password === 'password'
    );

    if (validUser) {
      const user = {
        id: '1',
        name: 'John Doe',
        username: 'john',
        role: 'recruiter',
        companyName: 'Example Corp',
      };

      // Set session cookie
      (await cookies()).set('session_token', 'dummy-session-token', {
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