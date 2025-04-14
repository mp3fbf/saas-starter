/**
 * @description
 * This file contains server actions related to the Prayer Pairing feature
 * in the Palavra Viva application. It includes actions for requesting a pair,
 * marking a prayer as done for the partner, and acknowledging a notification.
 *
 * @dependencies
 * - drizzle-orm: For database operations (eq, and, or, isNull, not, desc, sql).
 * - zod: For input validation schemas (though not used directly in this file's actions).
 * - @/lib/db/drizzle (db): Drizzle database instance.
 * - @/lib/db/schema: Database table schemas and types (users, prayer_pairs, teams).
 * - @/lib/auth/middleware: Server action wrappers (validatedActionWithUser).
 * - @/app/(login)/actions (logActivity): Function for logging user activity.
 * - @/lib/db/queries (getTeamIdForUser - new helper needed): To get team ID for logging.
 */
'use server';

import { eq, and, or, isNull, not, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, prayer_pairs, teams, type User } from '@/lib/db/schema';
import { validatedActionWithUser, type ActionState } from '@/lib/auth/middleware';
import { logActivity } from '@/app/(login)/actions';
import { getTeamIdForUser } from '@/lib/db/queries'; // Assuming this helper exists or is added
import { z } from 'zod';

const PAIRING_REQUEST_TIMEOUT_HOURS = 24; // How long a request stays valid

/**
 * @description Server action for a user to request being paired for prayer.
 * Attempts to find an existing waiting partner. If found, creates a pair.
 * If not found, marks the user as waiting.
 */
export const requestPrayerPair = validatedActionWithUser(
  z.void(), // Use z.void() for actions without specific input data
  async (_, __, user): Promise<ActionState> => {
    const userId = user.id;

    try {
      // Check if user is already in an active pair
      const existingActivePair = await db.query.prayer_pairs.findFirst({
        where: and(
          or(eq(prayer_pairs.user1_id, userId), eq(prayer_pairs.user2_id, userId)),
          eq(prayer_pairs.is_active, true),
        ),
      });

      if (existingActivePair) {
        return { error: 'Você já está em uma dupla de oração ativa.' };
      }

      // Check if user already has a recent pending request
      if (user.requested_pairing_at) {
        const requestTime = new Date(user.requested_pairing_at);
        const cutoffTime = new Date(Date.now() - PAIRING_REQUEST_TIMEOUT_HOURS * 60 * 60 * 1000);
        if (requestTime > cutoffTime) {
             return { success: 'Sua solicitação está ativa. Aguardando um par...' };
        }
        // Expired request, allow proceeding
      }


      // Find a potential partner
      const potentialPartner = await db.query.users.findFirst({
        where: and(
          not(eq(users.id, userId)), // Not the current user
          isNull(users.deletedAt), // Not deleted
          // Has requested pairing within the timeout window
          sql`${users.requested_pairing_at} IS NOT NULL AND ${users.requested_pairing_at} > NOW() - INTERVAL '${PAIRING_REQUEST_TIMEOUT_HOURS} hours'`,
          // Not currently in an active pair (subquery)
          sql`NOT EXISTS (
            SELECT 1 FROM ${prayer_pairs} pp
            WHERE (pp.user1_id = ${users.id} OR pp.user2_id = ${users.id}) AND pp.is_active = true
          )`,
        ),
        orderBy: sql`random()`, // Simple random matching
        // Could also order by requested_pairing_at asc for FIFO
      });

      if (potentialPartner) {
        // Partner found - create the pair
        console.log(`[Prayer Pair] Found partner ${potentialPartner.id} for user ${userId}`);
        // Ensure user1_id is always the smaller ID
        const user1_id = Math.min(userId, potentialPartner.id);
        const user2_id = Math.max(userId, potentialPartner.id);

        // Use transaction to ensure atomicity
        const pairResult = await db.transaction(async (tx) => {
          // 1. Create the pair record
          const [newPair] = await tx
            .insert(prayer_pairs)
            .values({
              user1_id: user1_id,
              user2_id: user2_id,
              is_active: true,
            })
            .returning();

          // 2. Clear requesting flags for both users
          await tx
            .update(users)
            .set({ requested_pairing_at: null })
            .where(or(eq(users.id, userId), eq(users.id, potentialPartner.id)));

           // 3. Log activity for both users
           const userTeamId = await getTeamIdForUser(userId, tx);
           const partnerTeamId = await getTeamIdForUser(potentialPartner.id, tx);
           if(userTeamId) await logActivity(userTeamId, userId, 'REQUEST_PRAYER_PAIR');
           if(partnerTeamId) await logActivity(partnerTeamId, potentialPartner.id, 'REQUEST_PRAYER_PAIR'); // Log for partner too

          return newPair;
        });

        if (!pairResult) {
             throw new Error('Failed to create prayer pair record.');
        }

        return { success: 'Dupla de oração formada! Ore por seu par.' };

      } else {
        // No partner found - mark user as requesting
        console.log(`[Prayer Pair] No partner found for user ${userId}, marking as requesting.`);
        await db
          .update(users)
          .set({ requested_pairing_at: new Date() })
          .where(eq(users.id, userId));

        // Log activity
        const teamId = await getTeamIdForUser(userId);
        if(teamId) await logActivity(teamId, userId, 'REQUEST_PRAYER_PAIR');

        return { success: 'Solicitação registrada. Aguardando um par...' };
      }
    } catch (error) {
      console.error('Error requesting prayer pair:', error);
      return { error: 'Ocorreu um erro ao solicitar a dupla de oração.' };
    }
  },
);

/**
 * @description Server action for a user to mark that they have prayed for their partner.
 * Updates the corresponding timestamp and sets the notification flag for the partner.
 */
export const markPrayerAsDone = validatedActionWithUser(
  z.void(), // Use z.void() for actions without specific input data
  async (_, __, user): Promise<ActionState> => {
    const userId = user.id;

    try {
      // Find the user's active pair
      const activePair = await db.query.prayer_pairs.findFirst({
        where: and(
          or(eq(prayer_pairs.user1_id, userId), eq(prayer_pairs.user2_id, userId)),
          eq(prayer_pairs.is_active, true),
        ),
      });

      if (!activePair) {
        return { error: 'Você não está em uma dupla de oração ativa.' };
      }

      // Determine which user the current user is and update fields accordingly
      const isUser1 = activePair.user1_id === userId;
      const partnerId = isUser1 ? activePair.user2_id : activePair.user1_id;

      const updateData = isUser1
        ? { user1_last_prayed_at: new Date(), user2_notified_at: new Date() } // User 1 prayed, notify User 2
        : { user2_last_prayed_at: new Date(), user1_notified_at: new Date() }; // User 2 prayed, notify User 1

      await db
        .update(prayer_pairs)
        .set(updateData)
        .where(eq(prayer_pairs.id, activePair.id));

      // Log activity
      const teamId = await getTeamIdForUser(userId);
      if(teamId) await logActivity(teamId, userId, 'MARK_PRAYER_DONE');

      return { success: 'Oração marcada como realizada. Seu par será notificado.' };
    } catch (error) {
      console.error('Error marking prayer as done:', error);
      return { error: 'Ocorreu um erro ao marcar a oração.' };
    }
  },
);


/**
 * @description Server action for a user to acknowledge (clear) the notification
 * that their partner prayed for them.
 */
export const acknowledgePrayerNotification = validatedActionWithUser(
    z.void(), // Use z.void() for actions without specific input data
    async (_, __, user): Promise<ActionState> => {
      const userId = user.id;

      try {
        // Find the user's active pair
        const activePair = await db.query.prayer_pairs.findFirst({
          where: and(
            or(eq(prayer_pairs.user1_id, userId), eq(prayer_pairs.user2_id, userId)),
            eq(prayer_pairs.is_active, true),
          ),
        });

        if (!activePair) {
          // No active pair, nothing to acknowledge
          return { success: 'Nenhuma notificação para confirmar.' };
        }

        // Determine which notification flag to clear
        const isUser1 = activePair.user1_id === userId;
        const updateData = isUser1
          ? { user1_notified_at: null }
          : { user2_notified_at: null };

        await db
          .update(prayer_pairs)
          .set(updateData)
          .where(eq(prayer_pairs.id, activePair.id));

        // No specific activity log needed for just acknowledging

        return { success: 'Notificação confirmada.' };
      } catch (error) {
        console.error('Error acknowledging prayer notification:', error);
        return { error: 'Ocorreu um erro ao confirmar a notificação.' };
      }
    },
  );