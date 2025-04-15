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
  const user = await getUser(); // Use standard getUser
  if (user) {
    // Fetch teamId separately for logging
    const teamId = await getTeamIdForUser(user.id);
    await logActivity(teamId, user.id, 'SIGN_OUT');
  }
  
  // Clear the session cookie - await cookies()
  const cookieStore = await cookies();
  cookieStore.delete('session');
  
  // Redirect to sign-in page after sign-out
  redirect('/sign-in');
} 