/**
 * @description
 * Next.js Middleware for the Palavra Viva application.
 * This middleware handles two primary responsibilities:
 * 1.  **Protecting Routes:** It checks if a user is trying to access routes
 *     under the `/app` path. If the user is not authenticated (determined by
 *     the presence and validity of the 'session' cookie), they are redirected
 *     to the `/sign-in` page.
 * 2.  **Session Refresh:** For authenticated users, it refreshes the expiration
 *     time of their 'session' cookie upon activity, effectively keeping them
 *     logged in as long as they are active. It verifies the existing token
 *     and issues a new one with an extended expiry.
 *
 * @dependencies
 * - next/server (NextResponse, NextRequest): For handling requests and responses in middleware.
 * - @/lib/auth/jwt (verifyToken, signToken): Functions for JWT signing and verification.
 *
 * @notes
 * - The `protectedRoutes` constant defines the path prefix requiring authentication.
 * - The `config.matcher` ensures this middleware runs for all routes except specific static assets and API routes.
 * - Error handling is included for session verification failures, clearing the invalid cookie and redirecting if necessary.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signToken } from '@/lib/auth/jwt';

// Define paths that don't require authentication
const PUBLIC_PATHS = [
  '/sign-in', 
  '/sign-up', 
  '/reset-password',
  '/test', // Allow access to our test route
  '/_next',
  '/favicon.ico',
  '/api/webhook', // Allow webhook endpoints
];

// Define the path prefix for routes that require authentication.
const AUTH_PREFIX = ['/dashboard', '/account', '/app'];

/**
 * @description Middleware function executed for matching requests.
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} The response object, potentially modified with redirects or updated cookies.
 */
export async function middleware(request: NextRequest) {
  // Default to allowing the request (pass-through)
  let res = NextResponse.next();
  
  // Check if the route requires authentication
  const requiresAuth = AUTH_PREFIX.some(prefix => 
    request.nextUrl.pathname.startsWith(prefix)
  );
  
  // Public paths are always allowed
  const isPublicPath = PUBLIC_PATHS.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (!requiresAuth || isPublicPath) {
    return res; // Allow access without authentication
  }
  
  // Check for the session cookie
  const sessionCookie = request.cookies.get('session');
  
  if (!sessionCookie || !sessionCookie.value) {
    // No session cookie found - redirect to sign-in
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  
  try {
    // Verify the session token using the function from jwt.ts
    const session = await verifyToken(sessionCookie.value);
    
    if (!session || !session.expires || new Date(session.expires) < new Date()) {
      // Invalid or expired session, redirect to sign-in
      request.cookies.delete('session');
      res = NextResponse.redirect(new URL('/sign-in', request.url));
      res.cookies.delete('session');
      return res;
    }
    
    // Session is valid, refresh token
    const refreshedToken = await signToken(session);
    res.cookies.set('session', refreshedToken, {
      expires: new Date(session.expires),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    return res;
  } catch (error) {
    // Error verifying session - clear cookie and redirect
    console.error('Session verification failed:', error);
    res = NextResponse.redirect(new URL('/sign-in', request.url));
    res.cookies.delete('session');
    return res;
  }
}

// Configure the middleware matcher
export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};