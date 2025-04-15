'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUser, getTeamIdForUser } from '@/lib/db/queries';
import { logActivity } from '@/app/(login)/actions';

/**
 * @description Server action for user sign-out.
 * Clears the session cookie and logs the activity.
 */
export async function signOut() {
  console.log("Sign out action called");
  const user = await getUser(); // Use standard getUser
  if (user) {
    console.log(`Sign out: Logging activity for user ${user.id}`);
    // Fetch teamId separately for logging
    const teamId = await getTeamIdForUser(user.id);
    await logActivity(teamId, user.id, 'SIGN_OUT');
  }
  
  // Clear the session cookie - await cookies()
  console.log("Sign out: Clearing session cookie");
  const cookieStore = await cookies();
  
  // Set an expired cookie to ensure it's cleared in all environments
  cookieStore.set({
    name: 'session',
    value: '',
    expires: new Date(0),
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
  });
  
  console.log("Sign out: Redirecting to sign-in page");
  // Redirect to sign-in page after sign-out
  redirect('/sign-in');
} 