/**
 * @description
 * API Route handler for the Stripe Checkout success URL.
 * This route is called when a user successfully completes a Stripe Checkout session.
 * It retrieves the session details, links the Stripe customer and subscription IDs
 * to the user's team/account record in the database, and sets the user's session
 * before redirecting them to the application dashboard.
 *
 * Endpoint: `/api/stripe/checkout`
 * Method: GET
 * Query Params: `session_id` (required) - The ID of the Stripe Checkout session.
 *
 * Security:
 * - Relies on the unique `session_id` provided by Stripe.
 * - Retrieves user ID from `client_reference_id` set during session creation.
 *
 * Functionality:
 * - Retrieves the Checkout Session from Stripe using the `session_id`.
 * - Extracts customer ID, subscription ID, product ID, and user ID (`client_reference_id`).
 * - Finds the corresponding user and their team/account record in the database.
 * - Updates the `teams` table with the Stripe IDs and initial subscription details.
 * - Sets the user's authentication session using `setSession`.
 * - Redirects the user to the main application page (`/app`).
 *
 * @dependencies
 * - next/server (NextRequest, NextResponse): For handling API requests and responses.
 * - stripe: Official Stripe Node.js library.
 * - drizzle-orm (eq): For database query conditions.
 * - @/lib/db/drizzle (db): Drizzle database instance.
 * - @/lib/db/schema (users, teams, teamMembers): Database table schemas.
 * - @/lib/auth/jwt (setSession): Function to set the user's session cookie.
 * - @/lib/payments/stripe (stripe): Initialized Stripe client.
 *
 * @notes
 * - The primary responsibility here is linking Stripe IDs post-checkout. Ongoing status
 *   updates (like trial ending, subscription renewing/canceling) are handled by the webhook.
 * - Includes error handling for invalid sessions, missing data, or database errors.
 */
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers } from '@/lib/db/schema'; // Import necessary schemas
import { setSession } from '@/lib/auth/jwt'; // Use setSession from jwt.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe'; // Import initialized Stripe client
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; // Get base URL

  // Redirect to pricing if session ID is missing
  if (!sessionId) {
    console.warn('Stripe checkout success: Missing session_id query parameter.');
    return NextResponse.redirect(new URL('/pricing', baseUrl));
  }

  try {
    // Retrieve the session from Stripe, expanding necessary objects
    console.log(`Stripe checkout success: Retrieving session ${sessionId}...`);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription.plan.product'], // Expand customer, subscription, plan, and product
    });
    console.log(`Stripe checkout success: Session retrieved for customer ${session.customer ? (typeof session.customer === 'string' ? session.customer : session.customer.id) : 'N/A'}`);


    // Validate essential data from the session
    if (!session.customer || typeof session.customer === 'string') {
      throw new Error('Invalid customer data received from Stripe session.');
    }
    const customerId = session.customer.id;

    const subscription = session.subscription as Stripe.Subscription | null; // Type assertion
    if (!subscription || !subscription.id) {
      throw new Error('No subscription found or subscription ID missing for this session.');
    }
    const subscriptionId = subscription.id;
    const subscriptionStatus = subscription.status; // Get status ('trialing', 'active', etc.)

    // Extract product and plan details (handle potential nulls)
    const plan = subscription.items?.data[0]?.price;
    const product = plan?.product as Stripe.Product | null; // Type assertion
    const productId = product?.id;
    const planName = product?.name;

    // Get user ID from client_reference_id
    const userIdString = session.client_reference_id;
    if (!userIdString) {
      throw new Error("Missing client_reference_id (user ID) in Stripe session.");
    }
    const userId = Number(userIdString);
    if (isNaN(userId)) {
         throw new Error("Invalid client_reference_id (user ID) format in Stripe session.");
    }

    // Find the user in the database
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      throw new Error(`User not found in database for ID: ${userId}.`);
    }
    const user = userResult[0];

    // Find the user's associated team/account record
    const teamResult = await db
      .select()
      .from(teams)
      .where(eq(teams.userId, user.id))
      .limit(1);

    if (teamResult.length === 0) {
      // This should ideally not happen if signup creates the team record
      throw new Error(`Team/Account record not found for user ID: ${user.id}.`);
    }
    const teamId = teamResult[0].id;

    // Update the team/account record with Stripe details
    console.log(`Stripe checkout success: Updating team ${teamId} for user ${userId}...`);
    await db
      .update(teams)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripeProductId: productId || null, // Store product ID if available
        planName: planName || null, // Store plan name if available
        subscriptionStatus: subscriptionStatus, // Store the current status from session
        updatedAt: new Date(),
      })
      .where(eq(teams.id, teamId));
     console.log(`Stripe checkout success: Team ${teamId} updated successfully.`);

    // Set the user's session cookie
    await setSession(user);
    console.log(`Stripe checkout success: Session set for user ${userId}. Redirecting to /app.`);

    // Redirect the user to the main application page
    return NextResponse.redirect(new URL('/app', baseUrl));

  } catch (error) {
    console.error('Error handling successful Stripe checkout:', error);
    // Redirect to a generic error page or back to pricing with an error message
    const errorMessage = error instanceof Error ? error.message : 'checkout_failed';
    return NextResponse.redirect(new URL(`/pricing?error=${encodeURIComponent(errorMessage)}`, baseUrl));
  }
}