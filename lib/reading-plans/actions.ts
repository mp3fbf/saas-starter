/**
 * @description
 * This file contains server-side logic (queries and actions) for managing
 * Bible reading plans and user progress within the Palavra Viva application.
 *
 * Key Functions/Actions:
 * - `getAllReadingPlans`: Fetches a list of all available reading plans.
 * - `getReadingPlanDetails`: Fetches detailed information for a specific plan, including its daily readings.
 * - `getUserProgress`: Fetches the progress records for a specific user across all plans.
 * - `updateReadingProgress`: A server action allowing authenticated users to mark a day
 *   of a reading plan as complete, updating their progress in the database.
 *
 * @dependencies
 * - drizzle-orm: For database query building (eq, and).
 * - zod: For input validation in server actions.
 * - @/lib/db/drizzle (db): Drizzle database instance.
 * - @/lib/db/schema: Database table schemas and types (reading_plans, reading_plan_days, etc.).
 * - @/lib/auth/middleware: Server action wrappers (validatedActionWithUser).
 * - @/lib/db/queries: For fetching user/team related data (e.g., for logging).
 * - @/app/(login)/actions (logActivity): Function for logging user activity. *Self-correction: Imported logActivity*
 *
 * @notes
 * - Assumes reading plan data has been seeded into the database.
 * - `updateReadingProgress` handles both starting a plan (first update) and marking subsequent days.
 * - Uses transactions for atomic updates in `updateReadingProgress`.
 * - Includes activity logging for starting plans, completing days, and finishing plans.
 */
'use server';

import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import {
  reading_plans,
  reading_plan_days,
  user_reading_progress,
  teams, // Import teams schema for fetching teamId
  type ReadingPlan,
  type ReadingPlanWithDays,
  type UserReadingProgress,
  type NewUserReadingProgress,
  type User, // Import User type
  type Team, // Import Team type
} from '@/lib/db/schema';
import { validatedActionWithUser, type ActionState } from '@/lib/auth/middleware';
import { logActivity } from '@/app/(login)/actions'; // Import logActivity

// --- Query Functions ---

/**
 * @description Fetches all available reading plans from the database.
 * @returns {Promise<ReadingPlan[]>} A promise resolving to an array of reading plans.
 */
export async function getAllReadingPlans(): Promise<ReadingPlan[]> {
  try {
    const plans = await db.select().from(reading_plans).orderBy(reading_plans.id);
    return plans;
  } catch (error) {
    console.error('Error fetching all reading plans:', error);
    return []; // Return empty array on error
  }
}

/**
 * @description Fetches the details of a specific reading plan, including its daily readings.
 * @param {number} planId - The ID of the reading plan to fetch.
 * @returns {Promise<ReadingPlanWithDays | null>} A promise resolving to the plan details with days, or null if not found.
 */
export async function getReadingPlanDetails(
  planId: number,
): Promise<ReadingPlanWithDays | null> {
  if (isNaN(planId) || planId <= 0) {
    console.error('Invalid planId provided to getReadingPlanDetails:', planId);
    return null;
  }
  try {
    // Use Drizzle's relational query feature
    const plan = await db.query.reading_plans.findFirst({
      where: eq(reading_plans.id, planId),
      with: {
        days: {
          orderBy: (days, { asc }) => [asc(days.dayNumber)], // Order days by dayNumber
        }, // Include related days
      },
    });

    if (!plan) {
      console.log(`Reading plan with ID ${planId} not found.`);
      return null;
    }
    // Ensure the result matches the expected type structure implicitly
    return plan as ReadingPlanWithDays;
  } catch (error) {
    console.error(`Error fetching details for reading plan ${planId}:`, error);
    return null; // Return null on error
  }
}

/**
 * @description Fetches all reading progress records for a specific user.
 * @param {number} userId - The ID of the user whose progress to fetch.
 * @returns {Promise<UserReadingProgress[]>} A promise resolving to an array of user progress records.
 */
export async function getUserProgress(
  userId: number,
): Promise<UserReadingProgress[]> {
  if (isNaN(userId) || userId <= 0) {
    console.error('Invalid userId provided to getUserProgress:', userId);
    return [];
  }
  try {
    const progress = await db
      .select()
      .from(user_reading_progress)
      .where(eq(user_reading_progress.userId, userId));
    return progress;
  } catch (error) {
    console.error(`Error fetching reading progress for user ${userId}:`, error);
    return []; // Return empty array on error
  }
}

// --- Server Action ---

// Zod schema for validating the input to updateReadingProgress
const updateProgressSchema = z.object({
  planId: z.coerce.number().int().positive('ID do plano inválido.'), // Ensure planId is a positive integer
  dayNumber: z.coerce
    .number()
    .int()
    .positive('Número do dia inválido.'), // Ensure dayNumber is a positive integer
});

/**
 * @description Server action to update a user's reading plan progress.
 * Marks the specified `dayNumber` as complete for the given `planId`.
 * Handles starting the plan if it's the first update for that user/plan.
 * Marks the plan as completed if the last day is finished. Logs relevant activities.
 */
export const updateReadingProgress = validatedActionWithUser(
  updateProgressSchema,
  async (data, _, user): Promise<ActionState> => {
    const { planId, dayNumber } = data;
    const userId = user.id;

    try {
      // Fetch plan details first to get duration
      const plan = await db
        .select({ duration: reading_plans.duration_days })
        .from(reading_plans)
        .where(eq(reading_plans.id, planId))
        .limit(1);

      if (plan.length === 0) {
        return { error: 'Plano de leitura não encontrado.' };
      }
      const planDuration = plan[0].duration;

      // Determine if this completion finishes the plan
      const isCompletingPlan = dayNumber === planDuration;
      const nextDay = dayNumber + 1;

      // Perform the update within a transaction
      const result = await db.transaction(async (tx) => {
        // Upsert logic: Insert or Update progress
        // Drizzle's ON CONFLICT requires unique constraint + specific columns for conflict target
        const upsertResult = await tx
          .insert(user_reading_progress)
          .values({
            userId: userId,
            planId: planId,
            currentDay: nextDay, // Start tracking the next day
            completedAt: isCompletingPlan ? new Date() : null, // Set completion timestamp if last day
            startedAt: new Date(), // Set start time on initial insert
            lastUpdated: new Date(),
          })
          .onConflictDoUpdate({
            target: [
              user_reading_progress.userId,
              user_reading_progress.planId,
            ], // Unique constraint columns
            set: {
              // Only update if the day being marked is >= current day in DB
              currentDay: sql`CASE WHEN ${dayNumber} >= ${user_reading_progress.currentDay} THEN ${nextDay} ELSE ${user_reading_progress.currentDay} END`,
              completedAt: sql`CASE WHEN ${isCompletingPlan} THEN ${new Date()} ELSE ${user_reading_progress.completedAt} END`,
              lastUpdated: new Date(),
            },
            where: eq(user_reading_progress.userId, userId) // Added condition to prevent updates on other users' progress
          })
          .returning({ id: user_reading_progress.id, startedAt: user_reading_progress.startedAt, currentDayDb: user_reading_progress.currentDay }); // Return ID to check if insert or update happened

        // Determine if this was the first update (i.e., an insert happened or startedAt is very recent)
        // Checking currentDayDb might be more reliable after upsert
        const wasInsert = upsertResult.length > 0 && upsertResult[0].currentDayDb === nextDay; // Heuristic: if currentDay was successfully set to nextDay, it was likely an insert or a valid progression

        // Log Activity - Fetch teamId for the user first
        const teamResult = await tx
          .select({ teamId: teams.id })
          .from(teams)
          .where(eq(teams.userId, userId))
          .limit(1);

        const teamId = teamResult.length > 0 ? teamResult[0].teamId : null;

        if (teamId) {
          if (isCompletingPlan) {
            await logActivity(
              teamId,
              userId,
              'COMPLETE_READING_PLAN',
            );
          } else if (wasInsert && dayNumber === 1) { // Log start only on the first day completion
            await logActivity(
              teamId,
              userId,
              'START_READING_PLAN',
            );
          } else {
            await logActivity(
              teamId,
              userId,
              'COMPLETE_READING_DAY',
            );
          }
        } else {
          console.warn(`Could not find teamId for user ${userId} to log reading activity.`);
        }

        return { wasInsert, isCompletingPlan };
      });

      // Return success message
      let successMessage = `Dia ${dayNumber} marcado como concluído!`;
      if (result.isCompletingPlan) {
        successMessage = `Parabéns! Você concluiu o plano de leitura!`;
      } else if (result.wasInsert && dayNumber === 1) {
        successMessage = `Plano iniciado! Dia ${dayNumber} marcado como concluído!`;
      }

      return { success: successMessage };
    } catch (error) {
      console.error(
        `Error updating reading progress for user ${userId}, plan ${planId}, day ${dayNumber}:`,
        error,
      );
      return { error: 'Não foi possível atualizar o progresso da leitura.' };
    }
  },
);