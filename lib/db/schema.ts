/**
 * @description
 * Defines the database schema for the Palavra Viva application using Drizzle ORM.
 * Includes tables for users, teams (repurposed for subscriptions), team members,
 * activity logs, invitations, daily content, reading plans, plan days, user progress,
 * and prayer pairs.
 * Also defines relationships between tables and exports inferred TypeScript types.
 *
 * @notes
 * - The `teams` table is repurposed to hold individual user subscription and account details (1 team per user for Palavra Viva).
 * - `team_members` is kept for template compatibility but primarily links a user to their own account record.
 * - Enum `ActivityType` includes actions specific to Palavra Viva.
 * - The `prayer_pairs` table includes a CHECK constraint (`user1_id < user2_id`) to ensure uniqueness and order.
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
  pgEnum, // Import pgEnum
  index, // Import index for non-unique indexes
  unique, // Import unique for multi-column constraints
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm'; // Import sql from 'drizzle-orm'

// --- Enums ---

// Enum for different types of activities logged
// Updated in Step 2.4
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
  'ADD_PRAYER', // Action for local storage, maybe not logged here? Or log intent?
  'DELETE_PRAYER', // Action for local storage, maybe not logged here?
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
// Updated in Step 2.1
export const users = pgTable('users', {
  // Core user fields (from template)
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'), // Kept for potential admin roles
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()), // Auto-update timestamp
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
// Updated in Step 2.2
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
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()), // Auto-update timestamp
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
// Updated in Step 2.4
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
// Updated in Step 2.3 (cascading deletes)
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
// Stores the automatically generated daily devotional content. (Added in Step 2.5)
export const daily_content = pgTable(
  'daily_content',
  {
    id: serial('id').primaryKey(),
    contentDate: date('content_date').notNull().unique(), // The specific date this content is for
    verseRef: varchar('verse_ref', { length: 100 }).notNull(), // Bible verse reference (e.g., "João 3:16")
    verseText: text('verse_text').notNull(), // Full text of the Bible verse
    reflectionText: text('reflection_text').notNull(), // AI-generated reflection text
    audioUrlFree: text('audio_url_free'), // URL to the standard quality audio file (nullable if generation fails)
    audioUrlPremium: text('audio_url_premium'), // URL to the premium quality audio file (nullable if generation fails)
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()), // Auto-update timestamp
  },
  (table) => {
    return {
      // Index on contentDate for efficient querying by date
      contentDateIdx: uniqueIndex('daily_content_date_idx').on(table.contentDate),
    };
  },
);

// --- Reading Plans Table ---
// Stores information about available Bible reading plans.
// Added in Step 2.6
export const reading_plans = pgTable(
  'reading_plans',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(), // Title of the reading plan
    description: text('description'), // Optional description of the plan
    duration_days: integer('duration_days').notNull(), // Number of days the plan lasts (e.g., 7, 30)
    theme: varchar('theme', { length: 100 }), // Optional theme category (e.g., 'Fé', 'Perdão')
    is_premium: boolean('is_premium').notNull().default(false), // Flag for premium-only plans (future feature)
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()), // Auto-update timestamp
  },
  (table) => {
    return {
      // Add non-unique indexes for potential filtering
      themeIdx: index('reading_plans_theme_idx').on(table.theme),
      isPremiumIdx: index('reading_plans_is_premium_idx').on(table.is_premium),
    };
  },
);

// --- Reading Plan Days Table ---
// Stores the specific content (verses) for each day of a reading plan.
// Added in Step 2.7
export const reading_plan_days = pgTable('reading_plan_days', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id') // Foreign key referencing the reading plan
    .notNull()
    .references(() => reading_plans.id, { onDelete: 'cascade' }), // Cascade delete if the plan is removed
  dayNumber: integer('day_number').notNull(), // 1-based index for the day within the plan
  verseRef: varchar('verse_ref', { length: 100 }).notNull(), // Bible reference(s) for the day
  verseText: text('verse_text').notNull(), // The actual text of the verse(s) for the day
  content: text('content'), // Optional additional content/thought for the day (nullable)
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()), // Auto-update timestamp
}, (table) => {
  return {
    // Ensure each day number is unique within a given plan
    planDayUnique: unique('reading_plan_days_plan_id_day_number_unique').on(table.planId, table.dayNumber),
    // Index on planId for faster lookup of a plan's days
    planIdIdx: index('reading_plan_days_plan_id_idx').on(table.planId),
  };
});


// --- User Reading Progress Table ---
// Tracks the progress of users through specific reading plans.
// Added in Step 2.8
export const user_reading_progress = pgTable('user_reading_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id') // Foreign key referencing the user
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // Cascade delete if the user is removed
  planId: integer('plan_id') // Foreign key referencing the reading plan
    .notNull()
    .references(() => reading_plans.id, { onDelete: 'cascade' }), // Cascade delete if the plan is removed
  currentDay: integer('current_day').notNull().default(1), // The next day the user needs to read (1-based index)
  completedAt: timestamp('completed_at'), // Timestamp when the user finished the entire plan (nullable)
  startedAt: timestamp('started_at').notNull().defaultNow(), // Timestamp when the user started the plan
  lastUpdated: timestamp('last_updated') // Timestamp when the progress was last updated
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => {
  return {
    // Ensure a user has only one progress record per plan
    userPlanUnique: unique('user_reading_progress_user_id_plan_id_unique').on(table.userId, table.planId),
    // Indexes for efficient lookup by user or plan
    userIdIdx: index('user_reading_progress_user_id_idx').on(table.userId),
    planIdIdx: index('user_reading_progress_plan_id_idx').on(table.planId),
  };
});


// --- Prayer Pairs Table ---
// Stores information about anonymous prayer pairings between users.
// Added in Step 2.9
export const prayer_pairs = pgTable('prayer_pairs', {
  id: serial('id').primaryKey(),
  // References to the two users in the pair. Cascade delete if a user is deleted.
  user1_id: integer('user1_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  user2_id: integer('user2_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(), // When the pair was formed
  // Timestamps to track when each user indicated they prayed for the other
  user1_last_prayed_at: timestamp('user1_last_prayed_at'),
  user2_last_prayed_at: timestamp('user2_last_prayed_at'),
  // Timestamps to track when each user was notified that their partner prayed (for "Someone prayed for you" message)
  user1_notified_at: timestamp('user1_notified_at'),
  user2_notified_at: timestamp('user2_notified_at'),
  // Flag indicating if the pair is currently considered active (e.g., for pairing logic)
  is_active: boolean('is_active').notNull().default(true),
}, (table) => {
  return {
    // Indexes for efficient lookup by user or active status
    user1Idx: index('prayer_pairs_user1_id_idx').on(table.user1_id),
    user2Idx: index('prayer_pairs_user2_id_idx').on(table.user2_id),
    isActiveIdx: index('prayer_pairs_is_active_idx').on(table.is_active),
    // CHECK constraint to ensure user1_id is always less than user2_id
    // This guarantees uniqueness (user1, user2) vs (user2, user1) and simplifies queries
    // Moved here and referencing columns via the `table` object.
    check_user_order: check('user_id_order', sql`${table.user1_id} < ${table.user2_id}`),
  };
});

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
    relationName: 'userAccount', // Specify a name for clarity
  }),
}));

// Users relations (Updated in Step 2.2, 2.8, 2.9, and corrected relation definition)
export const usersRelations = relations(users, ({ many, one }) => ({
  teamMembers: many(teamMembers), // User can be part of multiple teams (though 1:1 for Palavra Viva)
  invitationsSent: many(invitations, { relationName: 'invitedBy' }), // Invitations sent by this user
  activityLogs: many(activityLogs), // Activity logs associated with this user
  // Corrected: Specify fields and references for the one-to-one relation
  account: one(teams, { // Changed name from 'account' to avoid conflict with 'team' below if needed
      fields: [users.id],         // Field from the 'users' table
      references: [teams.userId], // Corresponding foreign key field in the 'teams' table
      relationName: 'userAccount' // Keep relationName consistent
  }),
  readingProgress: many(user_reading_progress), // User's progress in various reading plans
  prayerPairsAsUser1: many(prayer_pairs, { relationName: 'user1' }), // Pairs where this user is user1
  prayerPairsAsUser2: many(prayer_pairs, { relationName: 'user2' }), // Pairs where this user is user2
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

// DailyContent relations (No specific relations defined for now)
// export const dailyContentRelations = relations(daily_content, ({}) => ({}));

// ReadingPlans relations (Updated in Step 2.7 and 2.8)
export const readingPlansRelations = relations(reading_plans, ({ many }) => ({
  days: many(reading_plan_days), // A plan has many days
  progress: many(user_reading_progress), // User progress records associated with this plan
}));

// ReadingPlanDays relations (Added in Step 2.7)
export const readingPlanDaysRelations = relations(reading_plan_days, ({ one }) => ({
  plan: one(reading_plans, { // A day belongs to one plan
    fields: [reading_plan_days.planId],
    references: [reading_plans.id],
  }),
}));

// UserReadingProgress relations (Added in Step 2.8)
export const userReadingProgressRelations = relations(user_reading_progress, ({ one }) => ({
  user: one(users, { // Progress belongs to one user
    fields: [user_reading_progress.userId],
    references: [users.id],
  }),
  plan: one(reading_plans, { // Progress relates to one plan
    fields: [user_reading_progress.planId],
    references: [reading_plans.id],
  }),
}));


// PrayerPairs relations (Added in Step 2.9)
export const prayerPairsRelations = relations(prayer_pairs, ({ one }) => ({
  user1: one(users, {
    fields: [prayer_pairs.user1_id],
    references: [users.id],
    relationName: 'user1', // Relation name for clarity
  }),
  user2: one(users, {
    fields: [prayer_pairs.user2_id],
    references: [users.id],
    relationName: 'user2', // Relation name for clarity
  }),
}));

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
export type ActivityType = (typeof activityTypeEnum.enumValues)[number];

// Palavra Viva Specific Types (Added/Uncommented as tables are defined)
export type DailyContent = typeof daily_content.$inferSelect; // Added in Step 2.5
export type NewDailyContent = typeof daily_content.$inferInsert; // Added in Step 2.5
export type ReadingPlan = typeof reading_plans.$inferSelect; // Added in Step 2.6
export type NewReadingPlan = typeof reading_plans.$inferInsert; // Added in Step 2.6
export type ReadingPlanDay = typeof reading_plan_days.$inferSelect; // Added in Step 2.7
export type NewReadingPlanDay = typeof reading_plan_days.$inferInsert; // Added in Step 2.7
export type UserReadingProgress = typeof user_reading_progress.$inferSelect; // Added in Step 2.8
export type NewUserReadingProgress = typeof user_reading_progress.$inferInsert; // Added in Step 2.8
export type PrayerPair = typeof prayer_pairs.$inferSelect; // Added in Step 2.9
export type NewPrayerPair = typeof prayer_pairs.$inferInsert; // Added in Step 2.9

// Type for ReadingPlan with its days included
export type ReadingPlanWithDays = ReadingPlan & { days: ReadingPlanDay[] };

// Type for User with their account/subscription details included (Added in Step 3.2)
// Uses the relation name defined in usersRelations
export type UserWithSubscription = User & { account: Team | null };