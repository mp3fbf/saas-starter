/**
 * @description
 * Defines the database schema for the Palavra Viva application using Drizzle ORM.
 * Includes tables for users, teams (repurposed for subscriptions), team members,
 * activity logs, invitations, daily content, reading plans, plan days, user progress,
 * and prayer pairs.
 * Also defines relationships between tables and exports inferred TypeScript types.
 *
 * @notes
 * - The `teams` table is repurposed to hold individual user subscription data (1 team per user).
 * - `team_members` is kept for template compatibility but primarily links a user to their own account record.
 * - Enum `ActivityType` includes actions specific to Palavra Viva.
 */
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  time,
  date,
  boolean,
  uniqueIndex,
  check,
  sql,
  pgEnum, // Import pgEnum
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Enums ---

// Enum for different types of activities logged
export const activityTypeEnum = pgEnum('activity_type', [
  // Auth & Account
  'SIGN_UP',
  'SIGN_IN',
  'SIGN_OUT',
  'UPDATE_PASSWORD',
  'DELETE_ACCOUNT',
  'UPDATE_ACCOUNT', // General settings update
  // Team (Kept from template, less relevant for Palavra Viva)
  'CREATE_TEAM', // Represents account/subscription record creation in Palavra Viva
  'REMOVE_TEAM_MEMBER', // Less relevant
  'INVITE_TEAM_MEMBER', // Less relevant
  'ACCEPT_INVITATION', // Less relevant
  // Palavra Viva Specific Actions (Added in Step 2.4)
  'VIEW_DAILY_CONTENT',
  'PLAY_AUDIO',
  'SHARE_CONTENT',
  'ADD_PRAYER',
  'DELETE_PRAYER',
  'START_READING_PLAN',
  'COMPLETE_READING_DAY',
  'COMPLETE_READING_PLAN',
  'REQUEST_PRAYER_PAIR',
  'MARK_PRAYER_DONE',
  'ENABLE_NOTIFICATIONS',
  'CHANGE_THEME',
]);

// --- Users Table ---
// Stores user account information, authentication details, and Palavra Viva specific preferences.
export const users = pgTable('users', {
  // Core user fields (from template)
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'), // Kept for potential admin roles
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),

  // Palavra Viva specific fields (Added in Step 2.1)
  notification_time: time('notification_time').default('07:00:00'), // User preferred notification time (HH:MM:SS)
  notification_tz: varchar('notification_tz', { length: 50 }) // User IANA timezone string
    .notNull()
    .default('America/Sao_Paulo'),
  push_subscription: jsonb('push_subscription'), // Stores Web Push API PushSubscription object
  theme: varchar('theme', { length: 50 }).notNull().default('light'), // User preferred theme ('light', 'dark', 'gold')
  trial_end_date: timestamp('trial_end_date'), // Tracks when the free premium trial ends
  requested_pairing_at: timestamp('requested_pairing_at'), // Tracks when user requested prayer pairing
});

// --- Teams Table ---
// Repurposed to store individual user subscription and account details (1 team per user for Palavra Viva).
export const teams = pgTable(
  'teams',
  {
    id: serial('id').primaryKey(),
    // Link to the user this account/subscription belongs to (Added in Step 2.2)
    userId: integer('user_id')
      .notNull()
      .unique() // Ensure one team record per user
      .references(() => users.id, { onDelete: 'cascade' }), // If user is deleted, delete their account record
    name: varchar('name', { length: 100 }).notNull(), // e.g., "{User Email}'s Account"
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    // Stripe related fields (from template - used for subscription management)
    stripeCustomerId: text('stripe_customer_id').unique(),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    stripeProductId: text('stripe_product_id'),
    planName: varchar('plan_name', { length: 50 }), // e.g., 'free', 'premium'
    subscriptionStatus: varchar('subscription_status', { length: 20 }), // e.g., 'trialing', 'active', 'canceled'
  },
  (table) => {
    // Indexes for frequently queried fields
    return {
      userIdx: uniqueIndex('teams_user_id_idx').on(table.userId),
      stripeCustomerIdIdx: uniqueIndex('teams_stripe_customer_id_idx').on(
        table.stripeCustomerId,
      ),
      stripeSubscriptionIdIdx: uniqueIndex(
        'teams_stripe_subscription_id_idx',
      ).on(table.stripeSubscriptionId),
    };
  },
);

// --- Team Members Table ---
// Links users to teams. In Palavra Viva's case (1 team per user), primarily links a user to their own account record.
// Kept for compatibility with the original template's structure. Role is typically 'owner'.
// Updated in Step 2.3 to ensure cascading deletes.
export const teamMembers = pgTable(
  'team_members',
  {
    id: serial('id').primaryKey(),
    // Reference to the user. If the user is deleted, this membership record is also deleted.
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Reference to the team (user's account record). If the team record is deleted, this membership is also deleted.
    teamId: integer('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 50 }).notNull(), // Usually 'owner' for Palavra Viva
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
  },
  (table) => {
    // Ensure a user can only be on a specific team once
    return {
      userTeamUnique: uniqueIndex('user_team_unique_idx').on(
        table.userId,
        table.teamId,
      ),
    };
  },
);

// --- Activity Logs Table ---
// Records significant user actions within the application.
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }), // Link to the user's account record
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }), // Keep log even if user is deleted (optional, depends on policy)
  // Use the pgEnum for the action type
  action: activityTypeEnum('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }), // Store requesting IP address
});

// --- Invitations Table ---
// Handles invitations for users to join teams (likely unused in Palavra Viva MVP).
// Kept for template compatibility.
export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'accepted', 'declined'
});

// --- Daily Content Table ---
// Stores the automatically generated daily devotional content.
// export const daily_content = pgTable('daily_content', { // Will be created in Step 2.5
//   // ... columns ...
// });

// --- Reading Plans Table ---
// Stores information about available Bible reading plans.
// export const reading_plans = pgTable('reading_plans', { // Will be created in Step 2.6
//   // ... columns ...
// });

// --- Reading Plan Days Table ---
// Stores the specific content (verses) for each day of a reading plan.
// export const reading_plan_days = pgTable('reading_plan_days', { // Will be created in Step 2.7
//   // ... columns ...
// });

// --- User Reading Progress Table ---
// Tracks the progress of users through specific reading plans.
// export const user_reading_progress = pgTable('user_reading_progress', { // Will be created in Step 2.8
//   // ... columns ...
// });

// --- Prayer Pairs Table ---
// Stores information about anonymous prayer pairings between users.
// export const prayer_pairs = pgTable('prayer_pairs', { // Will be created in Step 2.9
//   // ... columns ...
// });

// --- Relationships ---

// Teams relations (Updated in Step 2.2)
export const teamsRelations = relations(teams, ({ many, one }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  // Added one-to-one relation back to the user owning this account/subscription record
  user: one(users, {
    fields: [teams.userId],
    references: [users.id],
  }),
}));

// Users relations (Updated in Step 2.2)
export const usersRelations = relations(users, ({ many, one }) => ({
  teamMembers: many(teamMembers), // User can be part of multiple teams (though 1:1 for Palavra Viva)
  invitationsSent: many(invitations, { relationName: 'invitedBy' }), // Invitations sent by this user
  activityLogs: many(activityLogs), // Activity logs associated with this user
  // Added one-to-one relation to the team record storing this user's account/subscription info
  account: one(teams, {
    fields: [users.id], // User's primary key
    references: [teams.userId], // Foreign key in the teams table
    relationName: 'userAccount', // Optional: Custom name for clarity
  }),
  // readingProgress: many(user_reading_progress), // Will define later
  // prayerPairs1: many(prayer_pairs, { relationName: 'user1' }), // Will define later
  // prayerPairs2: many(prayer_pairs, { relationName: 'user2' }), // Will define later
}));

// Invitations relations
export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedByUser: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
    relationName: 'invitedBy', // Matches relationName in usersRelations
  }),
}));

// TeamMembers relations (Verified in Step 2.3)
export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

// ActivityLogs relations
export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// DailyContent relations (Will define later)
// ReadingPlans relations (Will define later)
// ReadingPlanDays relations (Will define later)
// UserReadingProgress relations (Will define later)
// PrayerPairs relations (Will define later)

// --- Exported Types ---

// Base Types (from template, adapted)
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect; // Represents User Account/Subscription
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;

// Composite type used in queries (from template, now represents user account + single member)
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>; // Select only needed user fields
  })[];
};

// Type alias for ActivityType enum values (derived from pgEnum)
export type ActivityType = typeof activityTypeEnum.enumValues[number];

// Palavra Viva Specific Types (Will uncomment/add as tables are defined)
// ... types for daily_content, reading_plans, etc. ...