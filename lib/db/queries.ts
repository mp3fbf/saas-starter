/**
 * @description
 * This file contains database query functions for fetching user, team, and activity log data
 * for the Palavra Viva application. It utilizes Drizzle ORM for database interactions.
 * Also includes queries specific to Palavra Viva features like prayer pairing status.
 *
 * Key Functions:
 * - `getUser`: Retrieves the currently authenticated user based on the session cookie.
 * - `getUserWithSubscription`: Retrieves the authenticated user along with their associated team/subscription details.
 * - `getTeamByStripeCustomerId`: Fetches a team record based on a Stripe customer ID.
 * - `updateTeamSubscription`: Updates subscription details in the `teams` table.
 * - `getUserWithTeam`: (Less relevant for Palavra Viva) Fetches user and their associated team ID.
 * - `getActivityLogs`: Fetches recent activity logs for the authenticated user.
 * - `getTeamForUser`: (Less relevant for Palavra Viva) Fetches the full team data structure for a user.
 * - `getTeamIdForUser`: Helper to get the team ID for a given user ID.
 * - `getPrayerPairStatus`: Fetches the current prayer pairing status for a user.
 *
 * @dependencies
 * - drizzle-orm: For query building (eq, and, desc, isNull, or).
 * - @/lib/db/drizzle (db, Transaction): Drizzle database instance and transaction type.
 * - @/lib/db/schema: Database table schemas and types.
 * - next/headers (cookies): For accessing session cookies.
 * - @/lib/auth/jwt (verifyToken, getSession): For verifying the JWT session token and getting session data.
 *
 * @notes
 * - `getUserWithSubscription` is the primary function for fetching user context including subscription status.
 * - The `teams` table is used to store individual user account/subscription data.
 */
import type { NodePgTransaction } from 'drizzle-orm/node-postgres'; // Import the correct transaction type
import { desc, and, eq, isNull, count, or } from 'drizzle-orm';
import { db } from './drizzle'; // Remove Transaction type import
import {
  activityLogs,
  teamMembers,
  teams,
  users,
  prayer_pairs, // Import prayer_pairs schema
  type User,
  type Team,
  type TeamDataWithMembers,
  type UserWithSubscription,
  type PrayerPair, // Import PrayerPair type
  type PrayerPairStatus, // Import PrayerPairStatus type
} from './schema';
import { cookies } from 'next/headers';
import { verifyToken, getSession } from '@/lib/auth/jwt'; // Updated import

/**
 * @description Retrieves the currently authenticated user based on the session cookie.
 * Uses the `verifyToken` function (now from jwt.ts) to validate the session.
 * Returns the user data if authenticated, otherwise null.
 */
export async function getUser(): Promise<User | null> {
  // Use getSession from jwt.ts directly
  const session = await getSession();
  if (!session?.user?.id) {
    return null;
  }
  // Use Drizzle's relational query feature for potentially better performance
  const user = await db.query.users.findFirst({
    where: and(eq(users.id, session.user.id), isNull(users.deletedAt)), // Ensure user is not deleted
  });
  return user || null;
}

/**
 * @description Retrieves the authenticated user along with their associated team/subscription details.
 * It first gets the user using `getUser`, then fetches the corresponding record from the `teams` table.
 * @returns {Promise<UserWithSubscription | null>} An object containing user and team data, or null if not authenticated or no team record found.
 */
export async function getUserWithSubscription(): Promise<UserWithSubscription | null> {
  const user = await getUser(); // Get the authenticated user first
  if (!user) {
    return null; // Not authenticated
  }

  // Fetch the associated team record using Drizzle's relational query
  // Ensure the relation is defined in schema.ts (users -> account: one(teams))
  const userWithAccount = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      with: {
          account: true, // Assuming 'account' is the relation name defined in usersRelations
      },
  });

  if (!userWithAccount || !userWithAccount.account) {
    // This might happen if the team record wasn't created correctly during signup
    console.warn(`No account (team) record found for user ID: ${user.id}`);
    // Return user data without account if acceptable, otherwise null
    // return { ...user, account: null }; // If partial data is OK
    return null; // Return null if account is essential for this context
  }

  // The result structure should already match UserWithSubscription if relations are correct
  return userWithAccount as UserWithSubscription;
}

/**
 * @description Fetches a team record based on a Stripe customer ID.
 * @param customerId - The Stripe customer ID.
 * @returns {Promise<Team | null>} The team object or null if not found.
 */
export async function getTeamByStripeCustomerId(
  customerId: string,
): Promise<Team | null> {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * @description Updates subscription-related details in the `teams` table for a given team ID.
 * @param teamId - The ID of the team record to update.
 * @param subscriptionData - An object containing the subscription fields to update.
 * @returns {Promise<void>}
 */
export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  },
): Promise<void> {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date(), // Ensure updatedAt timestamp is updated
    })
    .where(eq(teams.id, teamId));
}

/**
 * @description Fetches a user along with the ID of the team they belong to.
 * Less relevant for Palavra Viva's 1-user-1-team model but kept from template.
 * @param userId - The ID of the user.
 * @returns {Promise<{ user: User; teamId: number | null } | undefined>} User and team ID or undefined if not found.
 */
export async function getUserWithTeam(
  userId: number,
): Promise<{ user: User; teamId: number | null } | undefined> {
   // Use relational query for potentially better performance
   const result = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      teamMembers: { // Assuming 'teamMembers' is the relation name
        limit: 1, // We only need one team association
        columns: {
          teamId: true, // Select only the teamId
        },
      },
    },
  });

  // Ensure the result structure aligns with the expected return type
  if (result) {
    // Need to access the user data directly from result, and teamId from the relation
    const userData = { ...result, teamMembers: undefined }; // Extract user part
    const teamId = result.teamMembers[0]?.teamId ?? null;
    return { user: userData as User, teamId };
  }
  return undefined;
}

/**
 * @description Helper function to get the team ID associated with a user ID.
 * Can optionally accept a transaction object for use within transactions.
 * @param userId - The ID of the user.
 * @param tx - Optional Drizzle transaction object.
 * @returns {Promise<number | null>} The team ID or null if not found.
 */
export async function getTeamIdForUser(userId: number, tx?: NodePgTransaction<any, any>): Promise<number | null> {
  const executor = tx || db; // Use transaction or default db client
  const teamResult = await executor
    .select({ teamId: teams.id })
    .from(teams)
    .where(eq(teams.userId, userId))
    .limit(1);

  return teamResult.length > 0 ? teamResult[0].teamId : null;
}

// Define the missing constant (adjust value as needed)
const PAIRING_REQUEST_TIMEOUT_HOURS = 24; // Example: 24 hours

/**
 * @description Fetches the 10 most recent activity logs for the authenticated user's associated team/account.
 * @returns {Promise<Array<{ id: number; action: string; timestamp: Date; ipAddress: string | null; userName: string | null }>>} An array of activity log objects.
 * @throws {Error} If the user is not authenticated.
 */
export async function getActivityLogs(): Promise<
  Array<{
    id: number;
    action: string; // Changed from ActivityType to string for broader compatibility if needed
    timestamp: Date;
    ipAddress: string | null;
    userName: string | null;
  }>
> {
  const user = await getUser();
  if (!user) {
    // It's often better to return an empty array or handle auth upstream
    // Throwing here might be too aggressive depending on usage context.
    // Returning empty array for consistency with other error cases.
    console.warn("getActivityLogs called without authenticated user.");
    return [];
    // throw new Error('User not authenticated');
  }

  // Find the user's team ID first
  const teamId = await getTeamIdForUser(user.id);

  if (!teamId) {
    // If user has no team, they likely have no logs associated via teamId
    console.warn(`No team found for user ${user.id} when fetching activity logs.`);
    return [];
  }

  // Select logs from the database
  const logs = await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action, // Action is now of type ActivityType enum
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      // Do NOT include userName here directly
    })
    .from(activityLogs)
    // Filter logs by the user's associated team ID
    .where(eq(activityLogs.teamId, teamId))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);

  // Map the results to add the userName
  return logs.map((log) => ({
    ...log,
    userName: user.name, // Add userName from the fetched user object
  }));
}

/**
 * @description Fetches the full team data structure, including members, for a given user ID.
 * Less relevant for Palavra Viva's 1-user-1-team model but kept from template.
 * @param userId - The ID of the user.
 * @returns {Promise<TeamDataWithMembers | null>} The team data with members or null if not found.
 */
export async function getTeamForUser(
  userId: number,
): Promise<TeamDataWithMembers | null> {
  // Fetch the user with their team memberships using Drizzle relations
  const result = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      // Fetch the teamMemberships associated with this user
      teamMembers: {
        with: {
          // For each membership, fetch the associated team
          team: {
            with: {
              // For that team, fetch all its members again (to get full team context)
              teamMembers: {
                with: {
                  // For each member of the team, fetch their user details
                  user: {
                    columns: {
                      // Select only necessary user fields for members list
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // The user might belong to multiple teams (via teamMembers), but in Palavra Viva's case,
  // we expect only one. We return the first one found.
  return result?.teamMembers[0]?.team || null;
}


/**
 * @description Fetches the prayer pairing status for a given user.
 * Checks if the user is waiting, paired, or needs to be notified.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<PrayerPairStatus>} A promise resolving to the user's prayer pair status object.
 */
export async function getPrayerPairStatus(userId: number): Promise<PrayerPairStatus> {
    if (isNaN(userId) || userId <= 0) {
      console.error('Invalid userId provided to getPrayerPairStatus:', userId);
      return { status: 'not_started', notified: false };
    }

    try {
      // Fetch user's requesting status and active pair concurrently
      const [userRequest, activePair] = await Promise.all([
        db.query.users.findFirst({
          where: eq(users.id, userId),
          columns: { requested_pairing_at: true },
        }),
        db.query.prayer_pairs.findFirst({
          where: and(
            or(eq(prayer_pairs.user1_id, userId), eq(prayer_pairs.user2_id, userId)),
            eq(prayer_pairs.is_active, true)
          ),
        }),
      ]);

      // Determine Status
      if (activePair) {
        const isUser1 = activePair.user1_id === userId;
        const userNotifiedAt = isUser1 ? activePair.user1_notified_at : activePair.user2_notified_at;
        return { status: 'paired', notified: !!userNotifiedAt }; // If paired, return paired status and notification status
      }

      if (userRequest?.requested_pairing_at) {
        const requestTime = new Date(userRequest.requested_pairing_at);
        const cutoffTime = new Date(Date.now() - PAIRING_REQUEST_TIMEOUT_HOURS * 60 * 60 * 1000);
        if (requestTime > cutoffTime) {
          return { status: 'waiting', notified: false }; // Active request, waiting
        }
      }

      // No active pair, no recent request
      return { status: 'not_started', notified: false };

    } catch (error) {
      console.error(`Error fetching prayer pair status for user ${userId}:`, error);
      return { status: 'not_started', notified: false }; // Default to not started on error
    }
  }