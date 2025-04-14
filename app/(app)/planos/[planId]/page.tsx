/**
 * @description
 * Server component page for displaying the details of a specific Bible reading plan.
 * This page uses a dynamic route segment `[planId]` to identify the plan.
 * It fetches the plan details (including all days) and the current user's progress
 * for this specific plan server-side, then passes the data to the `ReadingPlanViewer`
 * client component for rendering.
 *
 * @dependencies
 * - react (Suspense): For handling loading states during data fetching.
 * - next/navigation (notFound, redirect): For handling invalid plan IDs or unauthenticated users.
 * - @/lib/reading-plans/actions (getReadingPlanDetails, getUserProgress): Functions to fetch plan and progress data.
 * - @/lib/db/queries (getUser): Function to get the authenticated user's ID.
 * - @/app/(app)/_components/reading-plan-viewer (ReadingPlanViewer): Client component to display plan details and handle interactions.
 * - @/components/ui/loading-spinner (LoadingSpinner): Fallback component during loading.
 * - @/lib/db/schema (ReadingPlanWithDays, UserReadingProgress): Type definitions.
 *
 * @params
 * - params: Object containing route parameters. `params.planId` holds the ID from the URL.
 *
 * @notes
 * - Uses `async function Page()` for server-side data fetching.
 * - Includes Suspense boundary with `LoadingSpinner`.
 * - Validates `planId` and handles cases where the plan is not found using `notFound()`.
 * - Fetches user progress and filters it for the specific plan being viewed.
 */
import React, { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { getReadingPlanDetails, getUserProgress } from '@/lib/reading-plans/actions';
import { getUser } from '@/lib/db/queries';
import { ReadingPlanViewer } from '@/app/(app)/_components/reading-plan-viewer';
import LoadingSpinner from '@/components/ui/loading-spinner';
import type {
  ReadingPlanWithDays,
  UserReadingProgress,
} from '@/lib/db/schema';

/**
 * @description
 * An asynchronous helper component designed to be used within a <Suspense> boundary.
 * It awaits the promises for plan details and user progress, finds the relevant progress
 * for the current plan, handles the "plan not found" case, and renders the
 * `ReadingPlanViewer` with the resolved data.
 *
 * @param {object} props - Component props.
 * @param {Promise<ReadingPlanWithDays | null>} props.planPromise - Promise resolving to the plan details.
 * @param {Promise<UserReadingProgress[]>} props.userProgressPromise - Promise resolving to all user progress records.
 * @param {number} props.planId - The ID of the current plan being viewed.
 * @returns {JSX.Element} Either the ReadingPlanViewer or triggers notFound.
 */
async function PlanDetailLoader({
  planPromise,
  userProgressPromise,
  planId,
}: {
  planPromise: Promise<ReadingPlanWithDays | null>;
  userProgressPromise: Promise<UserReadingProgress[]>;
  planId: number; // Pass planId to find the specific progress
}) {
  // Await promises concurrently
  const [plan, allUserProgress] = await Promise.all([
    planPromise,
    userProgressPromise,
  ]);

  // Handle case where the plan is not found
  if (!plan) {
    console.warn(`Plan not found within PlanDetailLoader for ID: ${planId}`);
    notFound(); // Trigger the 404 page
  }

  // Find the specific progress record for this plan
  const currentPlanProgress =
    allUserProgress.find((p) => p.planId === planId) || null;

  // Render the viewer component with the fetched data
  return <ReadingPlanViewer plan={plan} progress={currentPlanProgress} />;
}

// Define the structure of the params object passed by Next.js
interface PageParams {
  planId: string;
}

/**
 * @description The main server component for the reading plan detail page.
 * Fetches necessary data and orchestrates rendering using Suspense.
 */
export default async function ReadingPlanDetailPage({
  params,
}: {
  params: PageParams;
}) {
  // Validate and parse the planId from the URL parameters
  const planId = parseInt(params.planId, 10);
  if (isNaN(planId) || planId <= 0) {
    console.warn(`Invalid planId detected in URL: ${params.planId}`);
    notFound(); // Trigger 404 for invalid IDs
  }

  // Fetch the authenticated user
  const user = await getUser();
  if (!user) {
    // Redirect to sign-in if user somehow accesses this page without being authenticated
    // Include the current path as redirect target
    redirect(`/sign-in?redirect=/app/planos/${planId}`);
  }

  // Fetch plan details and user progress concurrently
  const planPromise = getReadingPlanDetails(planId);
  const userProgressPromise = getUserProgress(user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Suspense boundary wraps the data-dependent component */}
      <Suspense fallback={<LoadingSpinner className="mt-10" size="h-10 w-10" />}>
        {/* The PlanDetailLoader handles awaiting promises and rendering */}
        <PlanDetailLoader
          planPromise={planPromise}
          userProgressPromise={userProgressPromise}
          planId={planId}
        />
      </Suspense>
    </div>
  );
}