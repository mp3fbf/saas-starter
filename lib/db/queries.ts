/**
 * @description
 * This file contains database query functions for fetching user, team, and activity log data
 * for the Palavra Viva application. It utilizes Drizzle ORM for database interactions.
 *
 * Key Functions:
 * - `getUser`: Retrieves the currently authenticated user based on the session cookie.
 * - `getUserWithSubscription`: Retrieves the authenticated user along with their associated team/subscription details.
 * - `getTeamByStripeCustomerId`: Fetches a team record based on a Stripe customer ID.
 * - `updateTeamSubscription`: Updates subscription details in the `teams` table.
 * - `getUserWithTeam`: (Less relevant for Palavra Viva) Fetches user and their associated team ID.
 * - `getActivityLogs`: Fetches recent activity logs for the authenticated user.
 * - `getTeamForUser`: (Less relevant for Palavra Viva) Fetches the full team data structure for a user.
 *
 * @dependencies
 * - drizzle-orm: For query building (eq, and, desc, isNull).
 * - @/lib/db/drizzle (db): Drizzle database instance.
 * - @/lib/db/schema: Database table definitions and types.
 * - next/headers (cookies): For accessing session cookies.
 * - @/lib/auth/session (verifyToken): For verifying the JWT session token.
 *
 * @notes
 * - `getUserWithSubscription` is the primary function for fetching user context including subscription status.
 * - The `teams` table is used to store individual user account/subscription data.
 */
import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams, users, User, Team, TeamDataWithMembers } from './schema'; // Import User, Team, and TeamDataWithMembers types
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';
import { UserWithSubscription } from './schema'; // Import the new type

/**
 * @description Retrieves the currently authenticated user based on the session cookie.
 * Verifies the session token and fetches the user data if valid and not deleted.
 * @returns {Promise<User | null>} The authenticated user object or null if not authenticated.
 */
export async function getUser(): Promise<User | null> {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  try {
    const sessionData = await verifyToken(sessionCookie.value);
    if (
      !sessionData ||
      !sessionData.user ||
      typeof sessionData.user.id !== 'number'
    ) {
      return null;
    }

    // Check session expiry (although middleware also handles this)
    if (new Date(sessionData.expires) < new Date()) {
      return null;
    }

    const userResult = await db
      .select()
      .from(users)
      // Ensure user ID matches and the user is not soft-deleted
      .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
      .limit(1);

    if (userResult.length === 0) {
      return null; // User not found or deleted
    }

    return userResult[0];
  } catch (error) {
    // Handle token verification errors (e.g., invalid signature, expired)
    console.error('Session verification failed:', error);
    return null;
  }
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

  // Fetch the associated team record using the user ID
  const teamResult = await db
    .select()
    .from(teams)
    .where(eq(teams.userId, user.id)) // Find team associated with this user
    .limit(1);

  if (teamResult.length === 0) {
    // This might happen if the team record wasn't created correctly during signup
    console.warn(`No team record found for user ID: ${user.id}`);
    // Decide whether to return just the user or null. Returning null aligns with needing subscription context.
    return null;
    // Alternatively, could return { user, team: null } if partial data is acceptable.
  }

  const team = teamResult[0];

  // Return the combined user and team data
  // Ensure the returned object matches the UserWithSubscription type structure
  return {
    ...user, // Spread user properties
    // Nest the team object as expected by UserWithSubscription type
    account: team,
  };
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
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  // Ensure the result structure aligns with the expected return type
  if (result.length > 0) {
    return { user: result[0].user, teamId: result[0].teamId ?? null };
  }
  return undefined;
}

/**
 * @description Fetches the 10 most recent activity logs for the authenticated user.
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
    // Consider returning [] instead. For now, keep original behavior:
    throw new Error('User not authenticated');
  }

  // Find the user's team ID first
  const teamResult = await db
    .select({ teamId: teams.id })
    .from(teams)
    .where(eq(teams.userId, user.id))
    .limit(1);

  if (teamResult.length === 0) {
    // If user has no team, they likely have no logs associated via teamId
    return [];
  }
  const teamId = teamResult[0].teamId;

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