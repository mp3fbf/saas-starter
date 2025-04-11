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
import type { Metadata } from 'next';

type PlanIdParams = {
  planId: string;
};

export async function generateMetadata({ 
  params 
}: { 
  params: PlanIdParams 
}): Promise<Metadata> {
  return {
    title: `Plano de Leitura: ${params.planId}`,
  };
}

// Using the exact pattern from Next.js App Router docs for dynamic route segments
// https://nextjs.org/docs/app/api-reference/file-conventions/page
export default function Page({ params }: { params: { planId: string } }) {
  return <div>Plan ID: {params.planId}</div>;
}