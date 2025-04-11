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
import { Metadata } from 'next';

type Props = {
  params: { planId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Plano de Leitura: ${params.planId}`,
  };
}

export default async function PlanoDetailPage({ params }: Props) {
  // Using async function to comply with server component expectations
  return <div>Plan ID: {params.planId}</div>;
}