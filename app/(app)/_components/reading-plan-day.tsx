/**
 * @description
 * Client component to display the details for a single day within a reading plan.
 * Shows the day number, verse reference, and verse text. Visually indicates
 * if the day is completed or the current day to be read.
 *
 * @dependencies
 * - react: Core React library.
 * - @/lib/db/schema (ReadingPlanDay): Type definition for daily plan data.
 * - lucide-react (Check, CircleDot): Icons for status indication.
 * - @/lib/utils (cn): Utility function for conditional class names.
 *
 * @props
 * - day: The `ReadingPlanDay` object containing the day's details.
 * - isCompleted: Boolean indicating if this day has been marked as completed by the user.
 * - isCurrent: Boolean indicating if this is the next day the user should read.
 *
 * @notes
 * - Uses `"use client";`.
 * - Applies different background/border styles and icons based on `isCompleted` and `isCurrent`.
 */
'use client';

import React from 'react';
import type { ReadingPlanDay } from '@/lib/db/schema';
import { Check, CircleDot } from 'lucide-react'; // Import icons
import { cn } from '@/lib/utils';

interface ReadingPlanDayProps {
  day: ReadingPlanDay;
  isCompleted: boolean;
  isCurrent: boolean;
}

export function ReadingPlanDay({
  day,
  isCompleted,
  isCurrent,
}: ReadingPlanDayProps) {
  return (
    <div
      className={cn(
        'p-4 border rounded-lg transition-colors',
        isCompleted
          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700/30 opacity-75'
          : isCurrent
            ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-600/50 shadow-sm'
            : 'bg-card border-border', // Default style for future days
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-base text-foreground">
          Dia {day.dayNumber}
        </h4>
        {/* Status Indicator */}
        {isCompleted ? (
          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
        ) : isCurrent ? (
          <CircleDot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        ) : null}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-primary">{day.verseRef}</p>
        <p className="text-sm text-foreground leading-relaxed">
          {day.verseText}
        </p>
        {day.content && ( // Display optional content if available
            <p className="text-xs text-muted-foreground italic pt-1">{day.content}</p>
        )}
      </div>
    </div>
  );
}