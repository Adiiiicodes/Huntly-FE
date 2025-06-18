// middleware.ts (place at project root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname
  const url = request.nextUrl.clone();
  const { pathname } = url;
  
  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/forgot-password'];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // Redirect logic
  if (!token && !isPublicPath) {
    // Store the original URL to redirect back after login
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  // Allow access to public paths even when logged in
  return NextResponse.next();
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};