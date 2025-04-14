/**
 * @description
 * Server component page for displaying the list of available Bible reading plans (`/app/planos`).
 * It fetches all plans and the current user's progress server-side and passes
 * this data to the `ReadingPlanList` client component for rendering.
 *
 * @dependencies
 * - React (Suspense): For handling loading states during data fetching.
 * - @/lib/reading-plans/actions (getAllReadingPlans, getUserProgress): Functions to fetch plan and progress data.
 * - @/lib/db/queries (getUser): Function to get the authenticated user's ID.
 * - @/app/(app)/_components/reading-plan-list (ReadingPlanList): Client component to display the list.
 * - @/components/ui/loading-spinner (LoadingSpinner): Fallback component during loading.
 * - next/navigation (redirect): To redirect if user is somehow not authenticated.
 *
 * @notes
 * - Uses `async function Page()` for server-side data fetching.
 * - Includes Suspense for a better user experience while data loads.
 * - Fetches user progress specifically for the logged-in user.
 */
import React, { Suspense } from 'react';
import { getAllReadingPlans, getUserProgress } from '@/lib/reading-plans/actions';
import { getUser } from '@/lib/db/queries'; // To get the current user ID
import { ReadingPlanList } from '@/app/(app)/_components/reading-plan-list';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { redirect } from 'next/navigation'; // Import redirect

// Indicate this is an async Server Component
export default async function PlanosPage() {
  // Fetch the current authenticated user to get their ID
  // Although middleware protects this route, fetching user confirms session again
  const user = await getUser();

  // Redirect if user is not found (should not happen due to middleware, but good practice)
  if (!user) {
    redirect('/sign-in?redirect=/app/planos');
  }

  // Fetch all reading plans and user's progress concurrently
  const plansPromise = getAllReadingPlans();
  const userProgressPromise = getUserProgress(user.id);

  // Using a helper async component within Suspense to await promises
  async function PlanListLoader() {
    const [plans, userProgress] = await Promise.all([
      plansPromise,
      userProgressPromise,
    ]);

    return <ReadingPlanList plans={plans} userProgress={userProgress} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6 text-center md:text-left">
        Planos de Leitura
      </h1>

      {/* Use Suspense to show a loading state while data is fetched */}
      <Suspense fallback={<LoadingSpinner className="mt-10" size="h-10 w-10" />}>
        <PlanListLoader />
      </Suspense>
    </div>
  );
}