/**
 * @description
 * API Route handler for incoming Stripe Webhooks.
 * This endpoint listens for events sent by Stripe, verifies their authenticity,
 * and processes relevant events, particularly subscription changes.
 *
 * Endpoint: `/api/stripe/webhook`
 * Method: POST
 *
 * Security:
 * - Verifies the incoming request signature using the `STRIPE_WEBHOOK_SECRET`
 *   environment variable to ensure the request originates from Stripe.
 *
 * Functionality:
 * - Parses the raw request body payload.
 * - Constructs the Stripe event object using the payload, signature, and secret.
 * - Handles specific event types (`customer.subscription.updated`, `customer.subscription.deleted`)
 *   by calling the `handleSubscriptionChange` function.
 * - Logs unhandled event types.
 * - Returns appropriate HTTP status codes (200 for success, 400 for signature errors).
 *
 * @dependencies
 * - stripe: Official Stripe Node.js library.
 * - next/server (NextRequest, NextResponse): For handling API requests and responses.
 * - @/lib/payments/stripe (handleSubscriptionChange, stripe): Stripe client and handler function.
 *
 * @notes
 * - The `STRIPE_WEBHOOK_SECRET` environment variable MUST be set correctly in production
 *   and match the secret provided by Stripe when creating the webhook endpoint.
 * - Ensure this endpoint URL is configured correctly in your Stripe dashboard settings.
 */
import Stripe from 'stripe';
import { handleSubscriptionChange, stripe } from '@/lib/payments/stripe'; // Import handler and stripe client
import { NextRequest, NextResponse } from 'next/server';

// Retrieve the webhook secret from environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Ensure the webhook secret is set
if (!webhookSecret) {
    console.error("FATAL ERROR: STRIPE_WEBHOOK_SECRET environment variable is not set.");
    // Optionally throw an error during build/startup in development
    // throw new Error("Missing STRIPE_WEBHOOK_SECRET");
}

export async function POST(request: NextRequest) {
    // Ensure the secret is available at runtime
    if (!webhookSecret) {
        return NextResponse.json({ error: 'Server configuration error: Webhook secret not set.' }, { status: 500 });
    }

    const payload = await request.text(); // Read the raw request body
    const signature = request.headers.get('stripe-signature'); // Get the signature from the header

    // Verify the signature is present
    if (!signature) {
        console.error('Stripe Webhook Error: Missing stripe-signature header.');
        return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        // Construct the event using Stripe's library for verification
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        console.log(`Stripe Webhook: Received verified event: ${event.type} (${event.id})`);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Stripe Webhook Error: Signature verification failed - ${errorMessage}`);
        // Return a 400 Bad Request response if verification fails
        return NextResponse.json(
            { error: `Webhook signature verification failed: ${errorMessage}` },
            { status: 400 }
        );
    }

    // Handle the specific event types we care about
    try {
        switch (event.type) {
            case 'customer.subscription.created': // Handle creation if needed (e.g., initial status might be trialing)
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': // Covers cancellations
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionChange(subscription);
                break;
            // Potentially handle other events like:
            // case 'checkout.session.completed':
            //   // Already handled by the success redirect route, but could be used as fallback
            //   break;
            // case 'invoice.payment_succeeded':
            //   // Useful for confirming renewals, potentially extending access
            //   break;
            // case 'invoice.payment_failed':
            //   // Handle failed payments, potentially notify user or restrict access
            //   break;
            default:
                // Log unhandled event types for monitoring purposes
                console.log(`Stripe Webhook: Unhandled event type ${event.type}`);
        }
    } catch (handlerError) {
         console.error(`Stripe Webhook Error: Error handling event ${event.type} (${event.id}):`, handlerError);
         // Return a 500 status to indicate an internal error processing the event
         return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
    }

    // Acknowledge receipt of the event to Stripe with a 200 OK response
    return NextResponse.json({ received: true });
}