/**
 * @description
 * This module handles interactions with the Stripe API for payment processing
 * within the Palavra Viva application. It includes functions for creating
 * Stripe checkout sessions, managing customer portal sessions, and handling
 * subscription changes via webhooks.
 *
 * Key Functions:
 * - `stripe`: Initialized Stripe client instance.
 * - `createCheckoutSession`: Creates a Stripe Checkout session for starting a new subscription,
 *   including the 7-day free trial. Redirects the user to Stripe.
 * - `createCustomerPortalSession`: Creates a Stripe Billing Portal session for users
 *   to manage their existing subscriptions. Redirects the user to the portal.
 * - `handleSubscriptionChange`: Updates the application's database (`teams` table)
 *   based on subscription status changes received from Stripe webhooks.
 * - `getStripePrices`: Fetches active, recurring prices from Stripe.
 * - `getStripeProducts`: Fetches active products from Stripe.
 *
 * @dependencies
 * - stripe: Official Stripe Node.js library.
 * - next/navigation (redirect): For redirecting users to Stripe or app pages.
 * - @/lib/db/schema (Team): Type definition for the team/account record.
 * - @/lib/db/queries: Database query functions (getTeamByStripeCustomerId, getUser, updateTeamSubscription).
 *
 * @notes
 * - Requires `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_APP_URL`
 *   environment variables to be set.
 * - The `createCheckoutSession` function now specifically sets a 7-day trial period
 *   as required by Palavra Viva.
 * - Error handling redirects users to appropriate pages (`/pricing`, `/error`).
 */
import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { Team } from '@/lib/db/schema';
import {
  getTeamByStripeCustomerId,
  getUser,
  updateTeamSubscription,
} from '@/lib/db/queries';

// Initialize Stripe client with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', // Use a specific API version
});

/**
 * @description Creates a Stripe Checkout Session for initiating a subscription.
 * Includes logic to handle existing customers vs. new checkouts and sets a 7-day trial.
 * @param {object} params - Parameters for session creation.
 * @param {Team | null} params.team - The team/account record associated with the user.
 * @param {string} params.priceId - The Stripe Price ID the user is subscribing to.
 * @returns {Promise<void>} Redirects the user to the Stripe Checkout page.
 */
export async function createCheckoutSession({
  team,
  priceId,
}: {
  team: Team | null;
  priceId: string;
}) {
  const user = await getUser();

  // If no user or team is found (should ideally be handled by `withTeam`),
  // redirect to sign-up, passing checkout details.
  if (!team || !user) {
    console.log('Redirecting to sign-up for checkout');
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  // Base URL for redirects
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Create the Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'], // Accept card payments
    line_items: [
      {
        price: priceId, // The selected price ID
        quantity: 1,
      },
    ],
    mode: 'subscription', // Set mode to subscription
    success_url: `${baseUrl}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`, // Redirect URL on success
    cancel_url: `${baseUrl}/pricing`, // Redirect URL on cancellation
    customer: team.stripeCustomerId || undefined, // Use existing customer ID if available
    client_reference_id: user.id.toString(), // Pass internal user ID for linking
    allow_promotion_codes: true, // Allow discount codes
    // Configure subscription data, including the 7-day trial
    subscription_data: {
      trial_period_days: 7, // **Set trial period to 7 days for Palavra Viva**
      // Optionally add metadata:
      // metadata: {
      //   appUserId: user.id.toString(),
      //   appTeamId: team.id.toString(),
      // }
    },
  });

  // Redirect the user to the Stripe Checkout page URL
  if (session.url) {
    redirect(session.url);
  } else {
    console.error('Stripe session URL is null.');
    redirect('/error?message=stripe_session_failed'); // Redirect to an error page
  }
}

/**
 * @description Creates a Stripe Customer Portal session for managing subscriptions.
 * @param {Team} team - The team/account record containing Stripe customer/product IDs.
 * @returns {Promise<Stripe.BillingPortal.Session>} The Stripe Billing Portal session object.
 * @throws {Error} If necessary Stripe IDs are missing or configuration fails.
 */
export async function createCustomerPortalSession(team: Team) {
  // Ensure the team has a Stripe Customer ID to create the portal session
  if (!team.stripeCustomerId) {
    console.error('Attempted to create customer portal for team without Stripe Customer ID:', team.id);
    // Redirect to pricing or show an error, as portal requires a customer
    redirect('/pricing?error=no_subscription');
  }

  // Base URL for return redirect
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Create the Customer Portal session
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: team.stripeCustomerId,
    return_url: `${baseUrl}/dashboard`, // Redirect back to the user's dashboard/settings
    // Optionally, configure allowed actions in the portal via configurations:
    // configuration: 'bpc_xxxxxxxxxxxx', // If you have a pre-defined configuration ID
  });

  // Return the session object, which includes the URL for redirection
  return portalSession;
}

/**
 * @description Handles subscription change events from Stripe webhooks.
 * Updates the team/account record in the database based on the new subscription status.
 * @param {Stripe.Subscription} subscription - The Stripe subscription object from the webhook event.
 * @returns {Promise<void>}
 */
export async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId = subscription.customer as string; // Customer ID is always a string here
  const subscriptionId = subscription.id;
  const status = subscription.status; // e.g., 'active', 'trialing', 'canceled', 'incomplete', 'past_due'

  console.log(`Webhook: Handling subscription change for customer ${customerId}, status: ${status}`);

  // Find the corresponding team/account record in the database
  const team = await getTeamByStripeCustomerId(customerId);

  if (!team) {
    console.error(`Webhook Error: Team not found for Stripe customer ID: ${customerId}`);
    return; // Exit if no matching team found
  }

  let updateData: Partial<Team> = {
      stripeSubscriptionId: subscriptionId, // Always update the subscription ID
      subscriptionStatus: status, // Update the status
      stripeProductId: null, // Default to null, update if active/trialing
      planName: null, // Default to null
  };

  // If the subscription is active or trialing, extract product/plan details
  if (status === 'active' || status === 'trialing') {
      // Ensure items exist and have price/product data
      if (subscription.items?.data?.length > 0 && subscription.items.data[0].price) {
          const price = subscription.items.data[0].price;
          // Product can be string ID or expanded object
          const product = price.product;
          if (typeof product === 'string') {
              updateData.stripeProductId = product;
              // Optionally fetch product details if name is needed and not expanded
              // const stripeProduct = await stripe.products.retrieve(product);
              // updateData.planName = stripeProduct.name;
          } else if (product && 'id' in product && !product.deleted) { // Check if it's an expanded AND non-deleted Product object
              updateData.stripeProductId = product.id;
              updateData.planName = product.name; // Use name from expanded product
          } else {
               console.warn(`Webhook: Could not determine product details for subscription ${subscriptionId}`);
          }
      } else {
           console.warn(`Webhook: Subscription ${subscriptionId} has no items or price data.`);
      }
  }
  // For canceled, unpaid, incomplete, etc., stripeProductId and planName remain null (or are reset)

  // Perform the database update
  try {
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: updateData.stripeSubscriptionId ?? null, // Use null if undefined
      stripeProductId: updateData.stripeProductId ?? null,       // Use null if undefined
      planName: updateData.planName ?? null,                   // Use null if undefined
      subscriptionStatus: updateData.subscriptionStatus!, // Status is always present
    });
    console.log(`Webhook: Successfully updated team ${team.id} subscription status to ${status}`);
  } catch (dbError) {
     console.error(`Webhook DB Error: Failed to update team ${team.id} subscription status:`, dbError);
  }
}

/**
 * @description Fetches active, recurring prices from Stripe, expanding product data.
 * @returns {Promise<Array<object>>} A promise resolving to an array of price objects with product details.
 */
export async function getStripePrices() {
  try {
    const prices = await stripe.prices.list({
      expand: ['data.product'], // Expand product data for each price
      active: true, // Only fetch active prices
      type: 'recurring', // Only fetch subscription prices
    });

    // Map to a simpler format if needed, ensuring product is handled correctly
    return prices.data.map((price) => ({
      id: price.id,
      productId: typeof price.product === 'string' ? price.product : price.product.id,
      productName: typeof price.product === 'string' ? 'Unknown' : (price.product as Stripe.Product).name, // Safely access name
      unitAmount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval,
      trialPeriodDays: price.recurring?.trial_period_days,
    }));
  } catch (error) {
    console.error("Error fetching Stripe prices:", error);
    return []; // Return empty array on error
  }
}

/**
 * @description Fetches active products from Stripe, expanding the default price.
 * @returns {Promise<Array<object>>} A promise resolving to an array of product objects.
 */
export async function getStripeProducts() {
  try {
    const products = await stripe.products.list({
      active: true, // Only fetch active products
      expand: ['data.default_price'], // Expand default price for each product
    });

    // Map to a simpler format
    return products.data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      defaultPriceId:
        typeof product.default_price === 'string'
          ? product.default_price
          : product.default_price?.id, // Safely access ID if expanded
    }));
  } catch (error) {
     console.error("Error fetching Stripe products:", error);
    return []; // Return empty array on error
  }
}