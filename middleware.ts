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
import { jwtVerify } from 'jose';
import { verifyToken, signToken } from '@/lib/auth/jwt';

const key = new TextEncoder().encode(process.env.AUTH_SECRET);
const PUBLIC_PATHS = ['/sign-in', '/sign-up'];

// Define the path prefix for routes that require authentication.
const protectedRoutes = '/app'; // Changed from '/dashboard'

/**
 * @description Middleware function executed for matching requests.
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} The response object, potentially modified with redirects or updated cookies.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');

  // Check if the requested route is protected
  const isProtectedRoute = pathname.startsWith(protectedRoutes);

  // 1. Route Protection: Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !sessionCookie) {
    // User is trying to access a protected route without a session cookie.
    // Redirect them to the sign-in page.
    const signInUrl = new URL('/sign-in', request.url);
    // Optional: Add a redirect query parameter if needed for post-login redirection
    // signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Initialize the response to continue the request chain by default
  let res = NextResponse.next();

  // 2. Session Refresh: Update the session cookie expiry for authenticated users
  if (sessionCookie) {
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

      // Refresh the session cookie if it's valid
      const refreshedToken = await signToken(session);
      res.cookies.set('session', refreshedToken, {
        expires: new Date(session.expires),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    } catch (error) {
      // Handle cases where the token is invalid or expired
      console.error('Middleware: Error verifying or refreshing session:', error);
      // Delete the invalid session cookie from the outgoing response
      res.cookies.delete('session');
      // If the user was trying to access a protected route with an invalid cookie, redirect them
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  // Return the response (either the default NextResponse.next() or one with modifications)
  return res;
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