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
 * - @/lib/db/schema (UserWithSubscription): Type definition for user with account/subscription details.
 *
 * @notes
 * - This file can be expanded with other auth-related utility functions as needed.
 */
// 'use server'; // Remove this - it's a synchronous helper

import type { UserWithSubscription } from '@/lib/db/schema';

/**
 * @description Determines if a user has premium access.
 * Premium access is granted if the user has an 'active' subscription
 * OR if their subscription status is 'trialing' and their trial period
 * (`trial_end_date`) has not yet expired.
 *
 * @param {UserWithSubscription | null} userWithSubscription - The user object containing nested account/subscription details.
 * @returns {boolean} True if the user has premium access, false otherwise.
 */
export function isUserPremium(
  userWithSubscription: UserWithSubscription | null,
): boolean {
  // If no user data is provided, they are not premium.
  if (!userWithSubscription) {
    return false;
  }

  // Extract account and trial end date for clarity.
  const account = userWithSubscription.account;
  const trialEndDate = userWithSubscription.trial_end_date;

  // Check for active subscription status.
  const hasActiveSubscription = account?.subscriptionStatus === 'active';

  // Check for active trial period.
  const isTrialing = account?.subscriptionStatus === 'trialing';
  const isTrialDateValid = trialEndDate ? new Date(trialEndDate) > new Date() : false;
  const hasActiveTrial = isTrialing && isTrialDateValid;

  // User is premium if they have an active subscription OR an active trial.
  return hasActiveSubscription || hasActiveTrial;
}