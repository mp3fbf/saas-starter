/**
 * @description
 * This is the main homepage for the authenticated Palavra Viva application (`/app`).
 * It serves as the entry point for users after logging in, displaying the
 * daily devotional content.
 *
 * Key features:
 * - Fetches the current user's subscription status server-side.
 * - Fetches the daily devotional content (verse, reflection, audio URLs) for the current date.
 * - Uses React Suspense to handle loading states while fetching data.
 * - Renders the `DailyContentViewer` component to display the content.
 * - Handles cases where content might not be available for the day.
 *
 * @dependencies
 * - react (Suspense): For handling asynchronous data loading states.
 * - @/lib/db/queries (getUserWithSubscription): Function to fetch user and subscription data.
 * - @/lib/content/actions (getDailyContent): Function to fetch daily content data.
 * - @/lib/auth/helpers (isUserPremium): Helper to determine premium status.
 * - ./_components/daily-content-viewer (DailyContentViewer): Client component to display content.
 * - @/components/ui/loading-spinner (LoadingSpinner): Component shown during data fetching.
 * - @/lib/db/schema (DailyContent): Type definition for daily content.
 *
 * @notes
 * - This page is a Server Component (`async function Page`).
 * - The `DailyContentLoader` async component pattern is used within Suspense
 *   to resolve the data promise and handle potential errors gracefully.
 * - Uses `new Date()` to fetch content for the current day.
 */
import React, { Suspense } from 'react';
import { getUserWithSubscription } from '@/lib/db/queries'; // Function to get user and subscription
import { getDailyContent } from '@/lib/content/actions'; // Function to get daily content
import { isUserPremium } from '@/lib/auth/helpers'; // Helper to check premium status
import DailyContentViewer from './_components/daily-content-viewer'; // Client component for display
import LoadingSpinner from '@/components/ui/loading-spinner'; // Loading indicator
import { DailyContent } from '@/lib/db/schema'; // Type for daily content

/**
 * @description
 * An asynchronous helper component designed to be used within a <Suspense> boundary.
 * It awaits the `contentPromise` and renders the `DailyContentViewer` with the resolved
 * content and premium status, or an error message if content is unavailable.
 *
 * @param {object} props - Component props.
 * @param {Promise<DailyContent | null>} props.contentPromise - Promise resolving to the daily content.
 * @param {boolean} props.isPremium - User's premium status.
 * @returns {JSX.Element} Either the DailyContentViewer or an error message.
 */
async function DailyContentLoader({
  contentPromise,
  isPremium,
}: {
  contentPromise: Promise<DailyContent | null>;
  isPremium: boolean;
}) {
  // Await the promise to get the content data
  const content = await contentPromise;

  // Check if content was successfully fetched
  if (!content) {
    // Render a user-friendly message if no content is available
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>Conteúdo de hoje ainda não disponível.</p>
        <p>Por favor, tente novamente mais tarde.</p>
      </div>
    );
  }

  // Render the viewer component with the fetched content and premium status
  return <DailyContentViewer content={content} isPremium={isPremium} />;
}

/**
 * @description
 * The main server component for the application's homepage (`/app`).
 * Fetches necessary data and orchestrates the rendering of the daily content.
 */
export default async function HomePage() {
  // Fetch the authenticated user along with their subscription details
  const userWithSub = await getUserWithSubscription();
  // Determine if the user is premium based on their subscription/trial status
  const premiumStatus = isUserPremium(userWithSub);

  // Get the current date to fetch today's content
  const today = new Date();
  // Initiate the fetch for today's daily content. This returns a promise.
  const dailyContentPromise = getDailyContent(today);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Title for the page */}
      {/* <h1 className="text-3xl font-bold text-center mb-6 text-primary">
        Devocional Diário
      </h1> */}

      {/* Suspense boundary wraps the data-dependent component */}
      {/* It shows the LoadingSpinner while the contentPromise is pending */}
      <Suspense fallback={<LoadingSpinner className="mt-10" size="h-10 w-10" />}>
        {/* The DailyContentLoader component handles awaiting the promise and rendering */}
        <DailyContentLoader
          contentPromise={dailyContentPromise}
          isPremium={premiumStatus}
        />
      </Suspense>
    </div>
  );
}