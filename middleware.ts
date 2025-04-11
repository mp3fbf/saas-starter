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
 * - @/lib/auth/session (signToken, verifyToken): Functions for JWT signing and verification.
 *
 * @notes
 * - The `protectedRoutes` constant defines the path prefix requiring authentication.
 * - The `config.matcher` ensures this middleware runs for all routes except specific static assets and API routes.
 * - Error handling is included for session verification failures, clearing the invalid cookie and redirecting if necessary.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';

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
      // Verify the existing session token
      const parsed = await verifyToken(sessionCookie.value);

      // If verification is successful, issue a new token with refreshed expiry
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Set the new session cookie in the response
      res.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsed, // Keep existing payload data
          expires: expiresInOneDay.toISOString(), // Update expiry
        }),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'lax',
        expires: expiresInOneDay,
        path: '/', // Ensure cookie applies to all paths
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