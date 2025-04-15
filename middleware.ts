/**
 * @description
 * Next.js Middleware for the Palavra Viva application.
 * This middleware handles several responsibilities:
 * 1.  **Protecting Routes:** It checks if a user is trying to access routes
 *     under the `/app` path. If the user is not authenticated (no valid session),
 *     they are redirected to the `/sign-in` page.
 * 2.  **Redirecting Authenticated Users:** If an already authenticated user tries
 *     to access public-only pages like `/sign-in` or `/sign-up`, or the root `/`,
 *     they are redirected to the main application page (`/app`).
 * 3.  **Session Refresh:** For authenticated users accessing protected routes, it refreshes
 *     the expiration time of their 'session' cookie upon activity, effectively keeping
 *     them logged in.
 *
 * @dependencies
 * - next/server (NextResponse, NextRequest): For handling requests and responses in middleware.
 * - @/lib/auth/jwt (verifyToken, signToken, SessionData): Functions and types for JWT handling.
 *
 * @notes
 * - The `AUTH_ROUTES` array defines paths requiring authentication.
 * - The `PUBLIC_ONLY_ROUTES` array defines paths only accessible when logged out.
 * - The `config.matcher` ensures this middleware runs for most routes, excluding static assets, etc.
 * - Error handling clears invalid session cookies.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signToken, type SessionData } from '@/lib/auth/jwt'; // Import SessionData type

// Define paths that require authentication
const AUTH_ROUTES = ['/', '/dashboard']; // Root and dashboard require auth

// Define paths that should only be accessible when logged OUT
const PUBLIC_ONLY_ROUTES = ['/sign-in', '/sign-up'];

/**
 * @description Middleware function executed for matching requests.
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} The response object, potentially modified with redirects or updated cookies.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');

  // Skip middleware for public static files
  if (pathname.match(/\.(css|js|png|jpg|jpeg|svg|ico)$/)) {
    return NextResponse.next();
  }

  console.log(`Middleware: Processing request for ${pathname}`);
  if (sessionCookie) {
    console.log(`Middleware: Session cookie exists: ${sessionCookie.value.substring(0, 10)}...`);
  } else {
    console.log(`Middleware: No session cookie found`);
  }

  let session: SessionData | null = null;
  let response = NextResponse.next(); // Default: allow request

  // 1. Try to verify the session if a cookie exists
  if (sessionCookie?.value) {
    try {
      session = await verifyToken(sessionCookie.value);
      
      if (!session) {
        console.log(`Middleware: Token verification returned null session`);
      } else if (!session.expires) {
        console.log(`Middleware: Session missing expires field`);
        session = null;
      } else if (new Date(session.expires) < new Date()) {
        console.log(`Middleware: Session expired at ${session.expires}`);
        session = null;
      } else {
        console.log(`Middleware: Valid session for user ID ${session.user.id}`);
      }
      
      if (!session) {
        // Invalid or expired session
        console.log(`Middleware: Clearing invalid session cookie`);
        response = NextResponse.next(); // Prepare a clean response first
        response.cookies.delete('session');
        // Don't redirect yet, let auth checks below handle it
      }
    } catch (error) {
      console.error('Middleware: Session verification error:', error);
      session = null;
      // Clear the invalid cookie
      response = NextResponse.next();
      response.cookies.delete('session');
      // Don't redirect yet
    }
  }

  const isAuthenticated = !!session;
  console.log(`Middleware: isAuthenticated = ${isAuthenticated}`);

  // 2. Handle redirects for authenticated users
  if (isAuthenticated) {
    // Redirect away from public-only routes
    if (PUBLIC_ONLY_ROUTES.some(route => pathname.startsWith(route))) {
      console.log(`Middleware: Authenticated user accessing public-only route ${pathname}. Redirecting to /`);
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Refresh session cookie for authenticated users on relevant routes
    if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
      try {
        if (!session) {
          console.error("Middleware Error: Session is null despite isAuthenticated being true.");
          return response;
        }
        
        console.log(`Middleware: Refreshing session for user ${session.user.id}`);
        const refreshedToken = await signToken(session);
        
        // Create a new response to ensure we have a clean cookies object
        response = NextResponse.next();
        
        // Set the refreshed session cookie with explicit parameters
        response.cookies.set({
          name: 'session',
          value: refreshedToken,
          expires: new Date(session.expires),
          httpOnly: true,
          secure: true, // Always use secure cookies in production
          sameSite: 'lax',
          path: '/',
        });
        
        console.log(`Middleware: Session refreshed successfully for ${pathname}`);
      } catch (refreshError) {
        console.error("Middleware: Error refreshing session token:", refreshError);
      }
    }
  }

  // 3. Handle route protection for unauthenticated users
  if (!isAuthenticated && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    console.log(`Middleware: Unauthenticated user accessing protected route ${pathname}. Redirecting to /sign-in.`);
    
    // Special handling to avoid redirect loops
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    
    // For other protected routes, preserve the original destination path
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // 4. Allow the request if none of the above conditions triggered a redirect
  // Return the response (which might have an updated cookie)
  console.log(`Middleware: Allowing request to proceed to ${pathname}`);
  return response;
}

// Configure the middleware matcher
export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes - except specific ones if needed)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - public assets (e.g., /icons/*, /sw.js, /manifest.json)
   */
   matcher: [
    '/((?!api/stripe/webhook|_next/static|_next/image|favicon.ico|icons/.*|sw.js|manifest.json|.*\\.(?:png|jpg|jpeg|gif|webp|svg)$).*)',
  ],
};