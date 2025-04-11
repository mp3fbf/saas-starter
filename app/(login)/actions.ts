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
 *
 * @dependencies
 * - zod: For schema validation.
 * - drizzle-orm: For database interactions.
 * - @/lib/db/drizzle (db): Drizzle database instance.
 * - @/lib/db/schema: Database table definitions, types, and the ActivityType enum.
 * - @/lib/auth/session: Password hashing, JWT session management.
 * - @/lib/payments/stripe: Stripe integration functions (checkout).
 * - @/lib/db/queries: Database query functions (getUser, getUserWithTeam).
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
  activityTypeEnum,
} from '@/lib/db/schema';
import { comparePasswords, hashPassword } from '@/lib/auth/session';
import { setSession } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers'; // Import cookies
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser,
} from '@/lib/auth/middleware';

/**
 * @description Logs an activity for a given user and team.
 * @param teamId - The ID of the team (user's account record) associated with the activity. Can be null/undefined if no team context.
 * @param userId - The ID of the user performing the action.
 * @param type - The type of activity being logged (using the ActivityType enum).
 * @param ipAddress - Optional IP address of the user.
 */
async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType,
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
    action: type,
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
      // Use string literal for activity type
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
        await createCheckoutSession({ team: foundTeam, priceId });
        // createCheckoutSession handles the redirect to Stripe
        // Since redirect happens in createCheckoutSession, we might not reach here,
        // but return empty state to satisfy types if needed.
        return {};
    } catch (error) {
        console.error("Failed to create checkout session during sign in redirect:", error);
        return { error: 'Não foi possível iniciar o checkout. Tente novamente.' };
    }
  }

  redirect('/app'); // Redirect to core app page
});

// Schema for sign-up validation
const signUpSchema = z.object({
  email: z.string().email("Formato de email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  inviteId: z.string().optional(),
});

/**
 * @description Server action for user sign-up.
 * Validates input, checks for existing users, creates user, team (account), team member,
 * sets trial period (if applicable), handles invitations, sets session, logs activity, and redirects.
 */
export const signUp = validatedAction(signUpSchema, async (data, formData) => {
    const { email, password, inviteId } = data;

    try {
        const result = await db.transaction(async (tx) => {
            const existingUser = await tx
                .select({ id: users.id })
                .from(users)
                .where(and(eq(users.email, email), isNull(users.deletedAt)))
                .limit(1);

            if (existingUser.length > 0) {
                return { error: 'Este email já está em uso. Tente fazer login.', email };
            }

            const passwordHash = await hashPassword(password);

            const newUser: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt' | 'trial_end_date'> = {
                email,
                passwordHash,
                role: 'member',
                deletedAt: null,
                notification_time: '07:00:00',
                notification_tz: 'America/Sao_Paulo',
                theme: 'light',
                push_subscription: null,
                requested_pairing_at: null,
            };

            const [createdUser] = await tx.insert(users).values(newUser).returning();
            if (!createdUser) {
                throw new Error('Falha ao criar usuário.');
            }

            let teamId: number;
            let userRole = 'owner';
            let createdTeam: Team | null = null;
            let isInviteSignup = false;

            if (inviteId) {
                isInviteSignup = true;
                const [invitation] = await tx
                    .select()
                    .from(invitations)
                    .where(
                        and(
                            eq(invitations.id, parseInt(inviteId)),
                            eq(invitations.email, email),
                            eq(invitations.status, 'pending'),
                        ),
                    )
                    .limit(1);

                if (invitation) {
                    teamId = invitation.teamId;
                    userRole = invitation.role;

                    await tx
                        .update(invitations)
                        .set({ status: 'accepted' })
                        .where(eq(invitations.id, invitation.id));

                    // Use string literal for activity type
                    await logActivity(teamId, createdUser.id, 'ACCEPT_INVITATION');

                    [createdTeam] = await tx
                        .select()
                        .from(teams)
                        .where(eq(teams.id, teamId))
                        .limit(1);
                    if (!createdTeam) {
                        throw new Error("Equipe da qual o convite pertence não foi encontrada.");
                    }

                } else {
                    return { error: 'Convite inválido ou expirado.', email };
                }
            } else {
                const newTeam: NewTeam = {
                    name: `${createdUser.email}'s Account`,
                    userId: createdUser.id,
                    stripeCustomerId: null,
                    stripeSubscriptionId: null,
                    stripeProductId: null,
                    planName: 'free',
                    subscriptionStatus: 'trialing',
                };

                [createdTeam] = await tx.insert(teams).values(newTeam).returning();
                if (!createdTeam) {
                    throw new Error('Falha ao criar registro da conta.');
                }
                teamId = createdTeam.id;

                const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                await tx
                    .update(users)
                    .set({ trial_end_date: trialEndDate })
                    .where(eq(users.id, createdUser.id));

                // Use string literal for activity type
                await logActivity(teamId, createdUser.id, 'CREATE_TEAM');
            }

            const newTeamMember: NewTeamMember = {
                userId: createdUser.id,
                teamId: teamId,
                role: userRole,
            };
            await tx.insert(teamMembers).values(newTeamMember);

            // Use string literal for activity type
            await logActivity(teamId, createdUser.id, 'SIGN_UP');

            await setSession(createdUser);

            const redirectTo = formData.get('redirect') as string | null;
            const priceId = formData.get('priceId') as string | null;

            if (redirectTo === 'checkout' && priceId && createdTeam) {
                 // This might redirect, so code below might not run
                await createCheckoutSession({ team: createdTeam, priceId });
                // Explicitly return success even if redirect happens within createCheckoutSession
                return { success: true };
            }

             // If not redirecting to checkout, redirect to app
             // Use return redirect('/app') pattern for Server Actions if possible,
             // otherwise, just call redirect.
             redirect('/app');
             // return { success: true }; // Technically unreachable after redirect

        }); // End transaction

        // Check if the transaction returned an error object
        if (result && result.error) {
            return { error: result.error, email: result.email, password: '' };
        }

        // If the transaction completed but didn't redirect (e.g., Stripe error), handle it.
        // This assumes `createCheckoutSession` might throw or not redirect properly on failure.
        if (result && !result.success) { // Check if success wasn't explicitly returned
             return { error: 'Ocorreu um erro durante o processo de checkout.', email, password: '' };
        }

        // Fallback error if something unexpected happened
        // (e.g., transaction succeeded but didn't return error/success and didn't redirect)
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
  const user = await getUser();
  if (user) {
    const teamResult = await db.select({ teamId: teams.id }).from(teams).where(eq(teams.userId, user.id)).limit(1);
    const teamId = teamResult.length > 0 ? teamResult[0].teamId : null;
    // Use string literal for activity type
    await logActivity(teamId, user.id, 'SIGN_OUT');
  }
  // Try awaiting cookies() to satisfy type checker
  const cookieStore = await cookies();
  cookieStore.delete('session');
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
    path: ['confirmPassword'],
  });

/**
 * @description Server action for updating the authenticated user's password.
 */
export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return { error: 'Senha atual incorreta.' };
    }

    if (currentPassword === newPassword) {
      return {
        error: 'Nova senha deve ser diferente da senha atual.',
      };
    }

    const newPasswordHash = await hashPassword(newPassword);

    const teamResult = await db.select({ teamId: teams.id }).from(teams).where(eq(teams.userId, user.id)).limit(1);
    const teamId = teamResult.length > 0 ? teamResult[0].teamId : null;

    try {
      await Promise.all([
        db
          .update(users)
          .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
          .where(eq(users.id, user.id)),
        // Use string literal for activity type
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
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return { error: 'Senha incorreta. Exclusão da conta falhou.' };
    }

    const teamResult = await db.select({ teamId: teams.id }).from(teams).where(eq(teams.userId, user.id)).limit(1);
    const teamId = teamResult.length > 0 ? teamResult[0].teamId : null;

    try {
        await db.transaction(async (tx) => {
            // Use string literal for activity type
            await logActivity(
                teamId,
                user.id,
                'DELETE_ACCOUNT',
            );

            await tx
                .update(users)
                .set({
                    deletedAt: new Date(),
                    email: sql`concat(${users.email}, '-', ${users.id}, '-deleted')`,
                    name: 'Usuário Excluído',
                    passwordHash: '',
                    push_subscription: null,
                })
                .where(eq(users.id, user.id));

            // Associated team/teamMember records are deleted via CASCADE constraint
        });

        // Try awaiting cookies() to satisfy type checker
        const cookieStore = await cookies();
        cookieStore.delete('session');
        redirect('/sign-in?message=account-deleted');

    } catch (error) {
        console.error("Failed to delete account:", error);
        return { error: 'Ocorreu um erro ao excluir a conta. Tente novamente.' };
    }
  },
);

// Schema for updating account information (name, email)
const updateAccountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  email: z.string().email('Email inválido'),
});

/**
 * @description Server action for updating the authenticated user's name and email.
 */
export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;

    const teamResult = await db.select({ teamId: teams.id }).from(teams).where(eq(teams.userId, user.id)).limit(1);
    const teamId = teamResult.length > 0 ? teamResult[0].teamId : null;

    if (email !== user.email) {
        const existingUser = await db.select({ id: users.id }).from(users)
            .where(and(eq(users.email, email), isNull(users.deletedAt)))
            .limit(1);
        if (existingUser.length > 0) {
            return { error: 'Este email já está em uso por outra conta.' };
        }
    }

    try {
      await Promise.all([
        db.update(users).set({ name, email, updatedAt: new Date() }).where(eq(users.id, user.id)),
        // Use string literal for activity type
        logActivity(teamId, user.id, 'UPDATE_ACCOUNT'),
      ]);
      return { success: 'Conta atualizada com sucesso.' };
    } catch (error) {
        console.error("Failed to update account:", error);
        if (error instanceof Error && error.message.includes('unique constraint')) {
             return { error: 'Este email já está em uso por outra conta.' };
        }
        return { error: 'Ocorreu um erro ao atualizar a conta.' };
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
 */
export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
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

        // Use string literal for activity type
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
  },
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['member', 'owner'], { errorMap: () => ({ message: 'Função inválida selecionada.'})}),
});

/**
 * @description Server action to invite a user to a team via email.
 * Requires owner privileges. Less relevant for Palavra Viva's single-user model.
 */
export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
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

        // Use string literal for activity type
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
  },
);