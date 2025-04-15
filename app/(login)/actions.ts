/**
 * @description
 * This file contains server actions related to user authentication and account management
 * for the Palavra Viva application. It includes actions for signing in, signing up,
 * signing out, updating passwords, updating account information, and managing team members
 * (though team features are minimized for Palavra Viva's individual user focus).
 *
 * Key Actions:
 * - `signIn`: Handles user login, verifies credentials, sets session, logs activity.
 * - `signUp`: Handles user registration. Creates user, associated team (for subscription),
 *   team member link, sets trial period, logs activity, sets session. Handles invitations.
 * - `signOut`: Logs user out, clears session cookie, logs activity.
 * - `updatePassword`: Allows authenticated users to change their password.
 * - `deleteAccount`: Allows authenticated users to soft-delete their account.
 * - `updateAccount`: Allows authenticated users to update their name and email.
 * - `removeTeamMember`: (Less relevant for Palavra Viva) Removes a member from a team.
 * - `inviteTeamMember`: (Less relevant for Palavra Viva) Invites a user to a team.
 * - `updateUserSettings`: Allows authenticated users to update app-specific settings (theme, notifications).
 * - `savePushSubscription`: Saves a user's web push subscription object.
 *
 * @dependencies
 * - zod: For schema validation.
 * - drizzle-orm: For database interactions.
 * - @/lib/db/drizzle (db): Drizzle database instance.
 * - @/lib/db/schema: Database table definitions, types, and the ActivityType enum.
 * - @/lib/auth/session: Password hashing.
 * - @/lib/auth/jwt: JWT session management (setSession, getSession).
 * - @/lib/payments/stripe: Stripe integration functions (createCheckoutSession).
 * - @/lib/db/queries: Database query functions (getUser, getUserWithTeam, getTeamIdForUser).
 * - @/lib/auth/middleware: Wrappers for validated server actions.
 * - next/navigation (redirect): For redirecting users.
 * - next/headers (cookies): For managing session cookies.
 *
 * @notes
 * - The `teams` table is used here to represent an individual user's account and subscription details.
 * - The `signUp` action now sets a `trial_end_date` for new users without invitations.
 * - Uses Drizzle transactions in `signUp` for atomicity.
 */
'use server';

import { z } from 'zod';
import { and, eq, sql, isNull } from 'drizzle-orm'; // Import isNull
import { db } from '@/lib/db/drizzle';
// Separate value imports (tables)
import {
  users,
  teams,
  teamMembers,
  activityLogs,
  invitations,
} from '@/lib/db/schema';
// Type imports
import type {
  User,
  NewUser,
  NewTeam,
  NewTeamMember,
  NewActivityLog,
  Team,
  ActivityType,
} from '@/lib/db/schema'; // Removed unused activityTypeEnum import
import { comparePasswords, hashPassword } from '@/lib/auth/session';
import { setSession, getSession } from '@/lib/auth/jwt'; // Use getSession here
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers'; // Import cookies
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser, getUserWithTeam, getTeamIdForUser } from '@/lib/db/queries'; // Added getTeamIdForUser
import {
  validatedAction,
  validatedActionWithUser,
  type ActionState, // Import ActionState type
} from '@/lib/auth/middleware';

/**
 * @description Logs an activity for a given user and team.
 * @param teamId - The ID of the team (user's account record) associated with the activity. Can be null/undefined if no team context.
 * @param userId - The ID of the user performing the action.
 * @param type - The type of activity being logged (using the ActivityType enum values).
 * @param ipAddress - Optional IP address of the user.
 */
export async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType, // Use the exported type alias
  ipAddress?: string,
) {
  // Only log if a teamId is provided
  if (teamId === null || teamId === undefined) {
    console.warn(`Activity logging skipped: No teamId provided for userId ${userId}, type ${type}`);
    return;
  }
  const newLog: NewActivityLog = {
    teamId,
    userId,
    action: type, // Use the ActivityType value directly
    ipAddress: ipAddress || '',
  };
  try {
    await db.insert(activityLogs).values(newLog);
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

// Schema for sign-in validation
const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

/**
 * @description Server action for user sign-in.
 * Validates input, checks credentials, sets the session, logs activity, and redirects.
 */
export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const userWithTeam = await db
    .select({
      user: users,
      team: teams,
    })
    .from(users)
    .leftJoin(teams, eq(users.id, teams.userId))
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);

  if (userWithTeam.length === 0) {
    return {
      error: 'Email ou senha inválidos. Tente novamente.',
      email,
      password: '',
    };
  }

  const { user: foundUser, team: foundTeam } = userWithTeam[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash,
  );

  if (!isPasswordValid) {
    return {
      error: 'Email ou senha inválidos. Tente novamente.',
      email,
      password: '',
    };
  }

  try {
    await Promise.all([
      setSession(foundUser),
      logActivity(foundTeam?.id, foundUser.id, 'SIGN_IN'),
    ]);
  } catch (error) {
    console.error("Failed to set session or log activity during sign in:", error);
    return { error: 'Ocorreu um erro ao fazer login. Tente novamente mais tarde.' };
  }

  const redirectTo = formData.get('redirect') as string | null;
  const priceId = formData.get('priceId') as string | null;

  if (redirectTo === 'checkout' && priceId) {
     try {
        // Pass the team object which now represents the user's account record
        // createCheckoutSession will redirect to Stripe
        await createCheckoutSession({ team: foundTeam, priceId });
        // Since redirect happens in createCheckoutSession, we might not reach here,
        // but return empty state to satisfy types if needed.
        return {};
    } catch (error) {
        console.error("Failed to create checkout session during sign in redirect:", error);
        // If checkout fails, redirect to pricing with an error message
        redirect(`/pricing?error=${encodeURIComponent('checkout_failed')}`);
        // return { error: 'Não foi possível iniciar o checkout. Tente novamente.' };
    }
  }

  // If user was redirected here with a specific path, go there
  if (redirectTo && redirectTo !== '/sign-in' && redirectTo !== '/sign-up') {
    redirect(redirectTo);
  }

  // Default redirect after successful sign-in
  redirect('/');
});

// Schema for sign-up validation
const signUpSchema = z.object({
  email: z.string().email("Formato de email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  inviteId: z.string().optional(), // Optional invite ID
});

/**
 * @description Server action for user sign-up.
 * Validates input, checks for existing users, creates user, team (account), team member,
 * sets trial period (if applicable), handles invitations, sets session, logs activity, and redirects.
 */
export const signUp = validatedAction(signUpSchema, async (data, formData) => {
    const { email, password, inviteId } = data;

    try {
        // Use a transaction to ensure all related records are created or none are
        const result = await db.transaction(async (tx) => {
            // 1. Check if user already exists (and is not soft-deleted)
            const existingUser = await tx
                .select({ id: users.id })
                .from(users)
                .where(and(eq(users.email, email), isNull(users.deletedAt)))
                .limit(1);

            if (existingUser.length > 0) {
                return { error: 'Este email já está em uso. Tente fazer login.', email };
            }

            // 2. Hash the password
            const passwordHash = await hashPassword(password);

            // 3. Prepare new user data (excluding fields with defaults or set later)
            const newUserFields: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt' | 'trial_end_date'> = {
                email,
                passwordHash,
                role: 'member', // Default role
                // Other Palavra Viva specific fields have defaults in schema
                deletedAt: null,
                name: null, // Name can be set later
                notification_time: '07:00:00',
                notification_tz: 'America/Sao_Paulo',
                theme: 'light',
                push_subscription: null,
                requested_pairing_at: null,
            };

            // 4. Insert the new user
            const [createdUser] = await tx.insert(users).values(newUserFields).returning();
            if (!createdUser) {
                throw new Error('Falha ao criar usuário.');
            }

            let teamId: number;
            let userRole = 'owner'; // Default role in their own 'team'
            let createdTeam: Team | null = null;

            // 5. Handle invitation or create new team/account record
            if (inviteId) {
                // --- Invitation Flow ---
                const [invitation] = await tx
                    .select()
                    .from(invitations)
                    .where(
                        and(
                            eq(invitations.id, parseInt(inviteId)),
                            eq(invitations.email, email),
                            eq(invitations.status, 'pending'), // Only accept pending invitations
                        ),
                    )
                    .limit(1);

                if (invitation) {
                    teamId = invitation.teamId;
                    userRole = invitation.role; // Assign role from invitation

                    // Mark invitation as accepted
                    await tx
                        .update(invitations)
                        .set({ status: 'accepted' })
                        .where(eq(invitations.id, invitation.id));

                    // Log invitation acceptance
                    await logActivity(teamId, createdUser.id, 'ACCEPT_INVITATION');

                    // Fetch the team the user is joining
                    [createdTeam] = await tx
                        .select()
                        .from(teams)
                        .where(eq(teams.id, teamId))
                        .limit(1);
                    if (!createdTeam) {
                        // This indicates a data inconsistency
                        throw new Error("Equipe associada ao convite não encontrada.");
                    }
                    console.log(`User ${email} accepted invite to join team ${teamId}`);
                    // Trial does not apply when joining via invite

                } else {
                    // Invalid or expired invitation
                    return { error: 'Convite inválido ou expirado.', email };
                }
            } else {
                // --- New User Flow (No Invitation) ---
                // Create the associated team record (represents user's account)
                const newTeam: NewTeam = {
                    name: `${createdUser.email}'s Account`, // Team name (can be updated later)
                    userId: createdUser.id, // Link to the user
                    // Set initial subscription status for trial
                    planName: 'free', // Technically starts free, access controlled by trial
                    subscriptionStatus: 'trialing', // Set status to trialing
                    // Stripe IDs will be set after checkout
                    stripeCustomerId: null,
                    stripeSubscriptionId: null,
                    stripeProductId: null,
                };

                [createdTeam] = await tx.insert(teams).values(newTeam).returning();
                if (!createdTeam) {
                    throw new Error('Falha ao criar registro da conta (team).');
                }
                teamId = createdTeam.id;
                console.log(`Created new team/account record ${teamId} for user ${createdUser.id}`);

                // Set the trial end date (7 days from now) on the user record
                const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                await tx
                    .update(users)
                    .set({ trial_end_date: trialEndDate })
                    .where(eq(users.id, createdUser.id));
                console.log(`Set trial end date for user ${createdUser.id}: ${trialEndDate.toISOString()}`);

                // Log team/account creation
                await logActivity(teamId, createdUser.id, 'CREATE_TEAM');
            }

            // 6. Link user to the team (their own account team or the invited team)
            const newTeamMember: NewTeamMember = {
                userId: createdUser.id,
                teamId: teamId,
                role: userRole, // 'owner' for their own team, or role from invite
            };
            await tx.insert(teamMembers).values(newTeamMember);

            // 7. Log the main sign-up event
            await logActivity(teamId, createdUser.id, 'SIGN_UP');

            // 8. Set the user session
            await setSession(createdUser);

            // 9. Handle redirection (Checkout or App)
            const redirectTo = formData.get('redirect') as string | null;
            const priceId = formData.get('priceId') as string | null;

            if (redirectTo === 'checkout' && priceId && createdTeam) {
                // If signing up as part of checkout, redirect to Stripe
                console.log(`Redirecting user ${createdUser.id} to checkout for price ${priceId}`);
                // createCheckoutSession handles the redirect
                await createCheckoutSession({ team: createdTeam, priceId });
                // Return success even though redirect happens inside createCheckoutSession
                return { success: true, redirecting: true };
            }

            // Default redirect after signup (if not going to checkout)
             console.log(`Redirecting user ${createdUser.id} to /app after signup`);
             redirect('/app');
             // return { success: true }; // Technically unreachable after redirect

        }); // End transaction

        // After transaction: Check for specific error returns from the transaction
        if (result && result.error) {
            return { error: result.error, email: result.email, password: '' };
        }

        // If transaction completed but didn't result in a redirect (e.g., checkout error)
        if (result && !result.redirecting) {
             console.warn('Signup transaction completed but did not redirect as expected.');
             // Redirect to app as a fallback if no specific error occurred
             redirect('/app');
        }

        // Fallback if something unexpected happened (should ideally not be reached)
        return { error: 'Ocorreu um erro inesperado durante o cadastro.' };

    } catch (error) {
        console.error('Sign up failed:', error);
        return { error: 'Falha ao criar conta. Tente novamente mais tarde.', email, password: '' };
    }
});


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
  // Clear the session cookie
  const cookieStore = await cookies(); // Await is needed for cookies()
  cookieStore.delete('session');
  // Redirect to sign-in page after sign-out
  redirect('/sign-in');
}


// Schema for password update validation
const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Senha atual é obrigatória (mínimo 8 caracteres)").max(100),
    newPassword: z.string().min(8, "Nova senha deve ter pelo menos 8 caracteres").max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As novas senhas não coincidem",
    path: ['confirmPassword'], // Apply error to confirmPassword field
  });

/**
 * @description Server action for updating the authenticated user's password.
 */
export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => { // User object is passed by the wrapper
    const { currentPassword, newPassword } = data;

    // Verify current password
    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return { error: 'Senha atual incorreta.' };
    }

    // Ensure new password is different
    if (currentPassword === newPassword) {
      return {
        error: 'Nova senha deve ser diferente da senha atual.',
      };
    }

    // Hash the new password
    const newPasswordHash = await hashPassword(newPassword);

    // Fetch teamId for logging
    const teamId = await getTeamIdForUser(user.id);

    try {
      // Update user record and log activity concurrently
      await Promise.all([
        db
          .update(users)
          .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
          .where(eq(users.id, user.id)),
        logActivity(teamId, user.id, 'UPDATE_PASSWORD'),
      ]);
      return { success: 'Senha atualizada com sucesso.' };
    } catch (error) {
        console.error("Failed to update password:", error);
        return { error: 'Ocorreu um erro ao atualizar a senha.' };
    }
  },
);

// Schema for account deletion validation
const deleteAccountSchema = z.object({
  password: z.string().min(8, "Confirmação de senha é obrigatória").max(100),
});

/**
 * @description Server action for soft-deleting the authenticated user's account.
 */
export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => { // User object is passed by the wrapper
    const { password } = data;

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return { error: 'Senha incorreta. Exclusão da conta falhou.' };
    }

    // Fetch teamId for logging
    const teamId = await getTeamIdForUser(user.id);

    try {
        // Use transaction for atomicity
        await db.transaction(async (tx) => {
            // 1. Log the deletion activity
            await logActivity(
                teamId,
                user.id,
                'DELETE_ACCOUNT',
            );

            // 2. Soft-delete the user: Set deletedAt, anonymize email, clear sensitive info
            await tx
                .update(users)
                .set({
                    deletedAt: new Date(),
                    // Append '-deleted' and ID to email to maintain uniqueness constraint
                    email: sql`concat(${users.email}, '-', ${users.id}, '-deleted')`,
                    name: 'Usuário Excluído', // Anonymize name
                    passwordHash: '', // Clear password hash
                    push_subscription: null, // Clear push subscription
                    // Keep other fields like theme/notification settings if desired for analytics?
                })
                .where(eq(users.id, user.id));

            // 3. Associated team and teamMember records should be deleted via CASCADE constraints defined in schema.ts
            // If CASCADE is not set, explicit deletion would be needed here:
            // if (teamId) {
            //     await tx.delete(teamMembers).where(eq(teamMembers.teamId, teamId));
            //     await tx.delete(teams).where(eq(teams.id, teamId));
            // }
             console.log(`Soft-deleted user ${user.id} and associated team/members via cascade.`);
        });

        // 4. Clear the session cookie
        const cookieStore = await cookies(); // Await is needed for cookies()
        cookieStore.delete('session');
        // 5. Redirect to sign-in page with a confirmation message
        redirect('/sign-in?message=account-deleted');

    } catch (error) {
        console.error("Failed to delete account:", error);
        return { error: 'Ocorreu um erro ao excluir a conta. Tente novamente.' };
    }
  },
);

// Schema for updating account information (name, email)
const updateAccountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100).trim(),
  email: z.string().email('Email inválido').max(255),
});

/**
 * @description Server action for updating the authenticated user's name and email.
 */
export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => { // User object is passed by the wrapper
    const { name, email } = data;

    // Fetch teamId for logging
    const teamId = await getTeamIdForUser(user.id);

    // Check if email is being changed and if the new email already exists
    if (email !== user.email) {
        const existingUser = await db.select({ id: users.id }).from(users)
            .where(and(eq(users.email, email), isNull(users.deletedAt))) // Check non-deleted users
            .limit(1);
        // Ensure the found user is not the current user themselves
        if (existingUser.length > 0 && existingUser[0].id !== user.id) {
            return { error: 'Este email já está em uso por outra conta.' };
        }
    }

    try {
      // Update user and log activity concurrently
      await Promise.all([
        db.update(users).set({ name, email, updatedAt: new Date() }).where(eq(users.id, user.id)),
        logActivity(teamId, user.id, 'UPDATE_ACCOUNT'),
      ]);
      return { success: 'Conta atualizada com sucesso.' };
    } catch (error) {
        console.error("Failed to update account:", error);
        // Handle potential unique constraint violation error if email check somehow failed
        if (error instanceof Error && (error.message.includes('unique constraint') || error.message.includes('duplicate key value violates unique constraint'))) {
             return { error: 'Este email já está em uso por outra conta.' };
        }
        return { error: 'Ocorreu um erro ao atualizar a conta.' };
    }
  },
);


// Schema for updating user settings (theme, notification time/tz)
const updateUserSettingsSchema = z.object({
    theme: z.enum(['light', 'dark', 'gold']).optional(),
    notification_time: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)").optional(),
    notification_tz: z.string().optional(), // Add validation if specific timezones are required
  });

/**
 * @description Server action for updating Palavra Viva specific user settings.
 */
export const updateUserSettings = validatedActionWithUser(
  updateUserSettingsSchema,
  async (data, _, user) => {
    const { theme, notification_time, notification_tz } = data;
    const userId = user.id;
    const updatePayload: Partial<User> = {};
    let activityType: ActivityType | null = null;

    if (theme !== undefined) {
      updatePayload.theme = theme;
      activityType = 'CHANGE_THEME'; // Prioritize theme change log if multiple settings change
    }
    if (notification_time !== undefined) {
      // Drizzle expects time string in 'HH:MM:SS' format, add seconds if needed
      updatePayload.notification_time = notification_time.includes(':') ? `${notification_time}:00` : null;
      if (!activityType) activityType = 'ENABLE_NOTIFICATIONS'; // Use notification log if theme didn't change
    }
     if (notification_tz !== undefined) {
       // TODO: Validate timezone string if necessary (e.g., against Intl.supportedValuesOf('timeZone'))
       updatePayload.notification_tz = notification_tz;
       if (!activityType) activityType = 'ENABLE_NOTIFICATIONS';
     }


    if (Object.keys(updatePayload).length === 0) {
      return { success: 'Nenhuma configuração para atualizar.' };
    }

    updatePayload.updatedAt = new Date(); // Ensure updatedAt is set

    try {
      await db.update(users).set(updatePayload).where(eq(users.id, userId));

      // Log the activity (if any setting changed)
      if (activityType) {
        const teamId = await getTeamIdForUser(userId);
        await logActivity(teamId, userId, activityType);
      }

      return { success: 'Configurações atualizadas com sucesso.' };
    } catch (error) {
      console.error(`Error updating settings for user ${userId}:`, error);
      return { error: 'Ocorreu um erro ao salvar as configurações.' };
    }
  },
);

// Schema for saving push subscription
// The PushSubscription JSON object structure can be complex, using z.any() for simplicity,
// but ideally, define a more specific Zod schema matching the PushSubscription interface.
const savePushSubscriptionSchema = z.object({
    subscription: z.string(), // Expecting a JSON stringified PushSubscription object
  });

/**
 * @description Server action to save a user's web push subscription object.
 */
export const savePushSubscription = validatedActionWithUser(
  savePushSubscriptionSchema,
  async (data, _, user) => {
    const { subscription: subscriptionJson } = data;
    const userId = user.id;
    let subscriptionObject: any; // Define type more strictly if possible

    // --- Step 1: Try parsing the JSON ---  
    try {
      subscriptionObject = JSON.parse(subscriptionJson);
      // Basic validation (check for endpoint)
      if (!subscriptionObject || typeof subscriptionObject.endpoint !== 'string') {
        console.warn(`Invalid push subscription object received for user ${userId}`);
        return { error: 'Objeto de inscrição push inválido.' };
      }
    } catch (parseError) {
       console.error(`Error parsing push subscription JSON for user ${userId}:`, parseError);
       return { error: 'Formato de inscrição push inválido.' };
    }

    // --- Step 2: If parsing succeeded, try saving to DB --- 
    try {
      await db
        .update(users)
        .set({ push_subscription: subscriptionObject, updatedAt: new Date() })
        .where(eq(users.id, userId));

       // Log activity? Optional, maybe part of general notification settings update
       const teamId = await getTeamIdForUser(userId);
       // Consider making logging optional or handle its errors separately if critical
       await logActivity(teamId, userId, 'ENABLE_NOTIFICATIONS'); // Or a new specific type?

      return { success: 'Inscrição para notificações salva.' };
    } catch (dbError) {
      console.error(`Error saving push subscription for user ${userId}:`, dbError);
      return { error: 'Ocorreu um erro ao salvar a inscrição para notificações.' };
    }
  },
);


// --- Team Management Actions (Less relevant for Palavra Viva MVP) ---

const removeTeamMemberSchema = z.object({
  memberId: z.coerce.number(),
});

/**
 * @description Server action to remove a team member.
 * Requires owner privileges. Less relevant for Palavra Viva's single-user model.
 * Kept for template compatibility, but likely unused.
 */
export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
     console.warn("removeTeamMember action called - likely unused in Palavra Viva context.");
     return { error: "Operação não suportada." }; // Disable for Palavra Viva
    // ... (original template logic commented out) ...
    /*
    const { memberId } = data;
    const teamMembership = await db.query.teamMembers.findFirst({
        where: and(eq(teamMembers.userId, user.id)),
        with: { team: true }
    });

    if (!teamMembership || !teamMembership.teamId) {
      return { error: 'Usuário não pertence a uma equipe.' };
    }

    if (teamMembership.role !== 'owner') {
        return { error: 'Apenas proprietários podem remover membros.' };
    }

    try {
        const result = await db
        .delete(teamMembers)
        .where(
            and(
            eq(teamMembers.id, memberId),
            eq(teamMembers.teamId, teamMembership.teamId),
            ),
        ).returning();

        if (result.length === 0) {
            return { error: 'Membro não encontrado ou não pertence a esta equipe.' };
        }

        await logActivity(
            teamMembership.teamId,
            user.id,
            'REMOVE_TEAM_MEMBER',
        );

        return { success: 'Membro da equipe removido com sucesso.' };

    } catch (error) {
        console.error("Failed to remove team member:", error);
        return { error: 'Ocorreu um erro ao remover o membro.' };
    }
    */
  },
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['member', 'owner'], { errorMap: () => ({ message: 'Função inválida selecionada.'})}),
});

/**
 * @description Server action to invite a user to a team via email.
 * Requires owner privileges. Less relevant for Palavra Viva's single-user model.
 * Kept for template compatibility, but likely unused.
 */
export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
     console.warn("inviteTeamMember action called - likely unused in Palavra Viva context.");
     return { error: "Operação não suportada." }; // Disable for Palavra Viva
    // ... (original template logic commented out) ...
    /*
    const { email, role } = data;

    const teamMembership = await db.query.teamMembers.findFirst({
        where: and(eq(teamMembers.userId, user.id)),
        with: { team: true }
    });

    if (!teamMembership || !teamMembership.teamId) {
      return { error: 'Usuário não pertence a uma equipe.' };
    }

     if (teamMembership.role !== 'owner') {
        return { error: 'Apenas proprietários podem convidar membros.' };
    }

    const existingMember = await db
      .select({ id: users.id })
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(
        and(
          eq(users.email, email),
          eq(teamMembers.teamId, teamMembership.teamId),
          isNull(users.deletedAt)
        ),
      )
      .limit(1);

    if (existingMember.length > 0) {
      return { error: 'Usuário já é membro desta equipe.' };
    }

    const existingInvitation = await db
      .select({ id: invitations.id })
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.teamId, teamMembership.teamId),
          eq(invitations.status, 'pending'),
        ),
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return { error: 'Um convite já foi enviado para este email.' };
    }

    try {
        const [newInvite] = await db.insert(invitations).values({
            teamId: teamMembership.teamId,
            email,
            role,
            invitedBy: user.id,
            status: 'pending',
        }).returning();

        await logActivity(
            teamMembership.teamId,
            user.id,
            'INVITE_TEAM_MEMBER',
        );

        console.log(`TODO: Send invitation email to ${email} for team ${teamMembership.team.name} with inviteId ${newInvite.id}`);

        return { success: 'Convite enviado com sucesso.' };

    } catch (error) {
        console.error("Failed to create invitation:", error);
        return { error: 'Ocorreu um erro ao enviar o convite.' };
    }
    */
  },
);