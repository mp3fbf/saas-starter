/**
 * @description
 * Placeholder page component for displaying the details of a specific reading plan.
 * This uses a dynamic route segment `[planId]`.
 * For the initial setup (Step 4.5), it only renders a title indicating the plan ID.
 *
 * @dependencies
 * - React: Core React library.
 *
 * @params
 * - params: Object containing route parameters. `params.planId` holds the ID from the URL.
 *
 * @notes
 * - Marked as a Server Component (`"use server";`).
 * - Actual data fetching based on `planId` and rendering of the plan details
 *   will be implemented in later steps.
 */
import React from 'react';

// Define props interface
interface PlanoDetailPageProps {
  params: { planId: string };
}

// Indicate that this is a Server Component.
// It will become an async function later to fetch plan details based on planId.
export default function PlanoDetailPage({ params }: PlanoDetailPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">
        Detalhe do Plano: {params.planId}
      </h1>
      <p className="text-muted-foreground">
        (O conteúdo diário para o plano {params.planId} será exibido aqui.)
      </p>
      {/* The <ReadingPlanViewer /> client component will be rendered here later */}
    </div>
  );
}