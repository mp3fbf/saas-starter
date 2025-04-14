/**
 * @description
 * Client component that displays the detailed view of a specific reading plan.
 * It shows the plan's title, description, lists all the days with their content,
 * indicates the user's progress (completed/current day), and provides a button
 * to mark the current day as complete.
 *
 * @dependencies
 * - react (useActionState, startTransition): Core React hooks for state and transitions.
 * - @/lib/db/schema (ReadingPlanWithDays, UserReadingProgress): Type definitions.
 * - @/lib/reading-plans/actions (updateReadingProgress): Server action to update progress.
 * - ./reading-plan-day (ReadingPlanDay): Component to display individual day content.
 * - @/components/ui/button (Button): Shadcn button component.
 * - @/components/ui/card (Card, CardHeader, etc.): For layout.
 * - lucide-react (Loader2): For loading spinner icon.
 * - @/lib/auth/middleware (ActionState): Type for server action state.
 *
 * @props
 * - plan: The `ReadingPlanWithDays` object containing plan details and all its days.
 * - progress: The `UserReadingProgress` object for the current user and this specific plan, or null if not started.
 *
 * @notes
 * - Uses `"use client";`.
 * - Leverages `useActionState` to handle the form submission for updating progress.
 * - Calculates the current day to be completed based on the user's progress record.
 * - Conditionally renders the "Mark as Complete" button only for the appropriate day and if the plan isn't finished.
 */
'use client';

import React, { useActionState, startTransition, useMemo } from 'react';
import type {
  ReadingPlanWithDays,
  UserReadingProgress,
} from '@/lib/db/schema';
import type { ActionState } from '@/lib/auth/middleware'; // Import ActionState type
import { updateReadingProgress } from '@/lib/reading-plans/actions';
import { ReadingPlanDay } from './reading-plan-day';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ReadingPlanViewerProps {
  plan: ReadingPlanWithDays;
  progress: UserReadingProgress | null;
}

export function ReadingPlanViewer({ plan, progress }: ReadingPlanViewerProps) {
  // useActionState hook to manage the server action call
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateReadingProgress, // The server action to call
    { error: '', success: '' }, // Initial state
  );

  // Determine the next day the user needs to complete
  // progress.currentDay stores the *next* day to be read (1-based)
  const currentDayToComplete = useMemo(() => {
      return progress?.currentDay ?? 1; // Default to day 1 if no progress
  }, [progress]);


  // Check if the entire plan is completed
  const isPlanCompleted = useMemo(() => {
      return !!progress?.completedAt;
  }, [progress]);


  // Handle the form submission to mark a day complete
  const handleMarkDayComplete = (dayNumber: number) => {
    // Use FormData to pass data to the server action
    const formData = new FormData();
    formData.append('planId', String(plan.id));
    formData.append('dayNumber', String(dayNumber));

    // Wrap the action call in startTransition to avoid blocking UI
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto my-4 shadow-lg border border-border rounded-xl overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary">
          {plan.title}
        </CardTitle>
        {plan.description && (
          <CardDescription className="text-muted-foreground pt-1">
            {plan.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Display server action feedback */}
        {state?.error && (
          <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
            Erro: {state.error}
          </p>
        )}
        {state?.success && (
          <p className="text-sm text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-2 rounded-md">
            {state.success}
          </p>
        )}

        {/* List of days */}
        {plan.days.map((day) => {
          // Determine status for each day component
          const isCompleted = (progress?.currentDay ?? 1) > day.dayNumber;
          const isCurrent = day.dayNumber === currentDayToComplete && !isPlanCompleted;

          return (
            <ReadingPlanDay
              key={day.id}
              day={day}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
            />
          );
        })}
      </CardContent>
      <CardFooter className="pt-4">
        {/* Show completion message or the "Mark as Complete" button */}
        {isPlanCompleted ? (
          <p className="text-center text-green-600 dark:text-green-400 font-medium w-full">
            Parabéns! Plano concluído! 🎉
          </p>
        ) : (
           // Only show button if the day exists in the plan
          currentDayToComplete <= plan.duration_days && (
            <Button
                onClick={() => handleMarkDayComplete(currentDayToComplete)}
                disabled={isPending}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
            >
                {isPending ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Marcando...
                    </>
                ) : (
                    `Marcar Dia ${currentDayToComplete} como Concluído`
                )}
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
}