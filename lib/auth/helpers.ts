/**
 * @description
 * This file contains helper functions related to authentication and user status
 * for the Palavra Viva application.
 *
 * Key Functions:
 * - `isUserPremium`: Checks if a user has active premium access based on their
 *   subscription status and trial period.
 *
 * @dependencies
 * - @/lib/db/schema (User, Team, UserWithSubscription): Type definition for user with account/subscription details.
 *
 * @notes
 * - This file can be expanded with other auth-related utility functions as needed.
 */

import type { User, Team, UserWithSubscription } from '@/lib/db/schema';

/**
 * @description Determines if a user has premium access.
 * Premium access is granted if the user has an 'active' subscription
 * OR if their subscription status is 'trialing' and their trial period
 * (`trial_end_date`) has not yet expired.
 *
 * @param {UserWithSubscription | User | null} userData - The user object, potentially including nested account/subscription details (from `UserWithSubscription`) or just the core user data (`User`). If `User` is provided, it should contain `trial_end_date`. The `team` parameter must be provided separately in this case.
 * @param {Team | null} [teamData] - Optional team/account data, required if `userData` is only of type `User`.
 * @returns {boolean} True if the user has premium access, false otherwise.
 */
export function isUserPremium(
  userData: UserWithSubscription | User | null,
  teamData?: Team | null,
): boolean {
  // If no user data is provided, they are not premium.
  if (!userData) {
    return false;
  }

  // Determine the source of account and trial data
  const account = 'account' in userData ? userData.account : teamData;
  const trialEndDate = 'trial_end_date' in userData ? userData.trial_end_date : null;

  // Check for active subscription status.
  const hasActiveSubscription = account?.subscriptionStatus === 'active';

  // Check for active trial period.
  const isTrialing = account?.subscriptionStatus === 'trialing';
  // Ensure trialEndDate is a valid Date object before comparing
  const isTrialDateValid = trialEndDate ? new Date(trialEndDate) > new Date() : false;
  const hasActiveTrial = isTrialing && isTrialDateValid;

  // User is premium if they have an active subscription OR an active trial.
  return hasActiveSubscription || hasActiveTrial;
}