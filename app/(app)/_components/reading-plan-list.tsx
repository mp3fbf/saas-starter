/**
 * @description
 * Client component that displays a list of available reading plans.
 * It receives an array of plans and the user's progress data, then renders
 * a `ReadingPlanCard` for each plan, indicating the user's status (Not Started,
 * Iniciado, Concluído).
 *
 * @dependencies
 * - react: Core React library.
 * - next/link: For client-side navigation to plan detail pages.
 * - @/lib/db/schema (ReadingPlan, UserReadingProgress): Type definitions.
 * - ./reading-plan-card (ReadingPlanCard): Component to display individual plan summaries.
 *
 * @props
 * - plans: An array of `ReadingPlan` objects representing all available plans.
 * - userProgress: An array of `UserReadingProgress` objects for the current user.
 *
 * @notes
 * - Uses `"use client";`.
 * - Determines the status for each plan based on the `userProgress` data.
 * - Renders plans in a responsive grid layout.
 */
'use client';

import React from 'react';
import Link from 'next/link';
import type { ReadingPlan, UserReadingProgress } from '@/lib/db/schema';
import { ReadingPlanCard } from './reading-plan-card'; // Import the card component

interface ReadingPlanListProps {
  plans: ReadingPlan[];
  userProgress: UserReadingProgress[];
}

export function ReadingPlanList({ plans, userProgress }: ReadingPlanListProps) {
  // Helper function to get the status of a plan for the current user
  const getPlanStatus = (
    planId: number,
  ): 'Iniciado' | 'Concluído' | undefined => {
    const progress = userProgress.find((p) => p.planId === planId);
    if (!progress) {
      return undefined; // Not started
    }
    if (progress.completedAt) {
      return 'Concluído'; // Completed
    }
    return 'Iniciado'; // Started but not completed
  };

  if (!plans || plans.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Nenhum plano de leitura disponível no momento.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {plans.map((plan) => {
        const status = getPlanStatus(plan.id);
        return (
          <Link
            key={plan.id}
            href={`/app/planos/${plan.id}`}
            className="block hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg" // Added focus styles
            aria-label={`Ver plano: ${plan.title}`}
          >
            <ReadingPlanCard plan={plan} status={status} />
          </Link>
        );
      })}
    </div>
  );
}