/**
 * @description
 * Client component to display a summary card for a single Bible reading plan.
 * Shows the plan's title, duration, theme, and optionally its progress status.
 *
 * @dependencies
 * - react: Core React library.
 * - @/lib/db/schema (ReadingPlan): Type definition for reading plan data.
 * - @/components/ui/card: Shadcn Card components for layout and styling.
 * - @/components/ui/badge (optional): Could be used for theme/status display.
 * - lucide-react: For icons (e.g., CalendarDays, Tag, CheckCircle, PlayCircle).
 *
 * @props
 * - plan: The `ReadingPlan` object containing the plan details.
 * - status?: Optional string indicating the user's progress ('Iniciado' or 'Concluído').
 *
 * @notes
 * - Uses `"use client";`.
 * - The card is intended to be wrapped by a Link in the parent component (`ReadingPlanList`)
 *   to navigate to the plan's detail page.
 */
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ReadingPlan } from '@/lib/db/schema';
import { CalendarDays, Tag, CheckCircle, PlayCircle } from 'lucide-react'; // Import icons

interface ReadingPlanCardProps {
  plan: ReadingPlan;
  status?: 'Iniciado' | 'Concluído'; // Optional progress status
}

export function ReadingPlanCard({ plan, status }: ReadingPlanCardProps) {
  return (
    <Card className="h-full flex flex-col transition-shadow hover:shadow-md overflow-hidden border border-border rounded-lg bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-primary line-clamp-2">
          {plan.title}
        </CardTitle>
        {plan.description && (
          <CardDescription className="text-sm text-muted-foreground pt-1 line-clamp-3">
            {plan.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow pt-2 pb-3 text-sm text-muted-foreground space-y-1.5">
        <div className="flex items-center">
          <CalendarDays className="mr-2 h-4 w-4 flex-shrink-0" />
          <span>{plan.duration_days} dias</span>
        </div>
        {plan.theme && (
          <div className="flex items-center">
            <Tag className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>Tema: {plan.theme}</span>
          </div>
        )}
      </CardContent>
      {/* Optionally display progress status in the footer */}
      {status && (
        <CardFooter className="pt-2 pb-3 text-xs font-medium flex items-center">
          {status === 'Concluído' ? (
            <CheckCircle className="mr-1.5 h-4 w-4 text-green-500" />
          ) : (
            <PlayCircle className="mr-1.5 h-4 w-4 text-blue-500" />
          )}
          <span className={status === 'Concluído' ? 'text-green-600' : 'text-blue-600'}>
             {status}
          </span>
        </CardFooter>
      )}
    </Card>
  );
}