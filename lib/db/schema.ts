/**
 * @description
 * Defines the database schema for the Palavra Viva application using Drizzle ORM.
 * Includes tables for users, teams (repurposed for subscriptions), team members,
 * activity logs, invitations, daily content, reading plans, plan days, user progress,
 * prayer pairs, and Bible content (books, chapters, verses).
 * Also defines relationships between tables and exports inferred TypeScript types.
 *
 * @notes
 * - The `teams` table is repurposed to hold individual user subscription and account details (1 team per user for Palavra Viva).
 * - `team_members` is kept for template compatibility but primarily links a user to their own account record.
 * - Enum `ActivityType` includes actions specific to Palavra Viva.
 * - The `prayer_pairs` table includes a CHECK constraint (`user1_id < user2_id`) to ensure uniqueness and order.
 * - Bible tables (`books`, `chapters`, `verses`) are included here, assuming data is populated separately (e.g., via `scripts/import-bible.ts`).
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
  pgEnum,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

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
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at'),
  notification_time: time('notification_time').default('07:00:00'),
  notification_tz: varchar('notification_tz', { length: 50 })
    .notNull()
    .default('America/Sao_Paulo'),
  push_subscription: jsonb('push_subscription'),
  theme: varchar('theme', { length: 50 }).notNull().default('light'),
  trial_end_date: timestamp('trial_end_date'),
  requested_pairing_at: timestamp('requested_pairing_at'),
});

// --- Teams Table ---
// Repurposed to store individual user subscription and account details (1 team per user for Palavra Viva).
export const teams = pgTable(
  'teams',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    stripeCustomerId: text('stripe_customer_id').unique(),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    stripeProductId: text('stripe_product_id'),
    planName: varchar('plan_name', { length: 50 }),
    subscriptionStatus: varchar('subscription_status', { length: 20 }),
  },
  (table) => {
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
export const teamMembers = pgTable(
  'team_members',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    teamId: integer('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 50 }).notNull(),
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
  },
  (table) => {
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
    .references(() => teams.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: activityTypeEnum('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

// --- Invitations Table ---
// Handles invitations for users to join teams (likely unused in Palavra Viva MVP).
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
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

// --- Daily Content Table ---
// Stores the automatically generated daily devotional content.
export const daily_content = pgTable(
  'daily_content',
  {
    id: serial('id').primaryKey(),
    contentDate: date('content_date').notNull().unique(),
    verseRef: varchar('verse_ref', { length: 100 }).notNull(),
    verseText: text('verse_text').notNull(),
    reflectionText: text('reflection_text').notNull(),
    audioUrlFree: text('audio_url_free'),
    audioUrlPremium: text('audio_url_premium'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      contentDateIdx: uniqueIndex('daily_content_date_idx').on(table.contentDate),
    };
  },
);

// --- Reading Plans Table ---
// Stores information about available Bible reading plans.
export const reading_plans = pgTable(
  'reading_plans',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    duration_days: integer('duration_days').notNull(),
    theme: varchar('theme', { length: 100 }),
    is_premium: boolean('is_premium').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      themeIdx: index('reading_plans_theme_idx').on(table.theme),
      isPremiumIdx: index('reading_plans_is_premium_idx').on(table.is_premium),
    };
  },
);

// --- Reading Plan Days Table ---
// Stores the specific content (verses) for each day of a reading plan.
export const reading_plan_days = pgTable(
  'reading_plan_days',
  {
    id: serial('id').primaryKey(),
    planId: integer('plan_id')
      .notNull()
      .references(() => reading_plans.id, { onDelete: 'cascade' }),
    dayNumber: integer('day_number').notNull(),
    verseRef: varchar('verse_ref', { length: 100 }).notNull(),
    verseText: text('verse_text').notNull(),
    content: text('content'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      planDayUnique: unique('reading_plan_days_plan_id_day_number_unique').on(
        table.planId,
        table.dayNumber,
      ),
      planIdIdx: index('reading_plan_days_plan_id_idx').on(table.planId),
    };
  },
);

// --- User Reading Progress Table ---
// Tracks the progress of users through specific reading plans.
export const user_reading_progress = pgTable(
  'user_reading_progress',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    planId: integer('plan_id')
      .notNull()
      .references(() => reading_plans.id, { onDelete: 'cascade' }),
    currentDay: integer('current_day').notNull().default(1),
    completedAt: timestamp('completed_at'),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    lastUpdated: timestamp('last_updated')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      userPlanUnique: unique('user_reading_progress_user_id_plan_id_unique').on(
        table.userId,
        table.planId,
      ),
      userIdIdx: index('user_reading_progress_user_id_idx').on(table.userId),
      planIdIdx: index('user_reading_progress_plan_id_idx').on(table.planId),
    };
  },
);

// --- Prayer Pairs Table ---
// Stores information about anonymous prayer pairings between users.
export const prayer_pairs = pgTable(
  'prayer_pairs',
  {
    id: serial('id').primaryKey(),
    user1_id: integer('user1_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    user2_id: integer('user2_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    user1_last_prayed_at: timestamp('user1_last_prayed_at'),
    user2_last_prayed_at: timestamp('user2_last_prayed_at'),
    user1_notified_at: timestamp('user1_notified_at'),
    user2_notified_at: timestamp('user2_notified_at'),
    is_active: boolean('is_active').notNull().default(true),
  },
  (table) => {
    return {
      user1Idx: index('prayer_pairs_user1_id_idx').on(table.user1_id),
      user2Idx: index('prayer_pairs_user2_id_idx').on(table.user2_id),
      isActiveIdx: index('prayer_pairs_is_active_idx').on(table.is_active),
      check_user_order: check('user_id_order', sql`${table.user1_id} < ${table.user2_id}`),
    };
  },
);

// --- Bible Content Tables (Moved from import script) ---

// Bible Books Table
export const books = pgTable(
  'books',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    abbreviation: varchar('abbreviation', { length: 10 }).notNull(),
    testament: varchar('testament', { length: 2 }).notNull(), // 'VT' or 'NT'
    version: varchar('version', { length: 10 }).notNull(), // e.g., 'nvi'
    createdAt: timestamp('created_at').defaultNow(), // Removed withTimezone for consistency
  },
  (table) => {
    return {
      abbreviationVersionUnq: uniqueIndex(
        'books_abbreviation_version_unique_idx',
      ).on(table.abbreviation, table.version),
    };
  },
);

// Bible Chapters Table
export const chapters = pgTable(
  'chapters',
  {
    id: serial('id').primaryKey(),
    bookId: integer('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    chapterNumber: integer('chapter_number').notNull(),
    createdAt: timestamp('created_at').defaultNow(), // Removed withTimezone
  },
  (table) => {
    return {
      bookChapterUnq: uniqueIndex('chapters_book_id_chapter_number_unique_idx').on(
        table.bookId,
        table.chapterNumber,
      ),
    };
  },
);

// Bible Verses Table
export const verses = pgTable(
  'verses',
  {
    id: serial('id').primaryKey(),
    chapterId: integer('chapter_id')
      .notNull()
      .references(() => chapters.id, { onDelete: 'cascade' }),
    verseNumber: integer('verse_number').notNull(),
    text: text('text').notNull(),
    createdAt: timestamp('created_at').defaultNow(), // Removed withTimezone
  },
  (table) => {
    return {
      chapterVerseUnq: uniqueIndex('verses_chapter_id_verse_number_unique_idx').on(
        table.chapterId,
        table.verseNumber,
      ),
    };
  },
);

// --- Relationships ---

// Teams relations
export const teamsRelations = relations(teams, ({ many, one }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  user: one(users, {
    fields: [teams.userId],
    references: [users.id],
    relationName: 'userAccount',
  }),
}));

// Users relations
export const usersRelations = relations(users, ({ many, one }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations, { relationName: 'invitedBy' }),
  activityLogs: many(activityLogs),
  account: one(teams, {
    fields: [users.id],
    references: [teams.userId],
    relationName: 'userAccount',
  }),
  readingProgress: many(user_reading_progress),
  prayerPairsAsUser1: many(prayer_pairs, { relationName: 'user1' }),
  prayerPairsAsUser2: many(prayer_pairs, { relationName: 'user2' }),
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
    relationName: 'invitedBy',
  }),
}));

// TeamMembers relations
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

// ReadingPlans relations
export const readingPlansRelations = relations(reading_plans, ({ many }) => ({
  days: many(reading_plan_days),
  progress: many(user_reading_progress),
}));

// ReadingPlanDays relations
export const readingPlanDaysRelations = relations(reading_plan_days, ({ one }) => ({
  plan: one(reading_plans, {
    fields: [reading_plan_days.planId],
    references: [reading_plans.id],
  }),
}));

// UserReadingProgress relations
export const userReadingProgressRelations = relations(user_reading_progress, ({ one }) => ({
  user: one(users, {
    fields: [user_reading_progress.userId],
    references: [users.id],
  }),
  plan: one(reading_plans, {
    fields: [user_reading_progress.planId],
    references: [reading_plans.id],
  }),
}));

// PrayerPairs relations
export const prayerPairsRelations = relations(prayer_pairs, ({ one }) => ({
  user1: one(users, {
    fields: [prayer_pairs.user1_id],
    references: [users.id],
    relationName: 'user1',
  }),
  user2: one(users, {
    fields: [prayer_pairs.user2_id],
    references: [users.id],
    relationName: 'user2',
  }),
}));

// Bible Tables Relations (Added)
export const booksRelations = relations(books, ({ many }) => ({
  chapters: many(chapters),
}));

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  book: one(books, {
    fields: [chapters.bookId],
    references: [books.id],
  }),
  verses: many(verses),
}));

export const versesRelations = relations(verses, ({ one }) => ({
  chapter: one(chapters, {
    fields: [verses.chapterId],
    references: [chapters.id],
  }),
}));

// --- Exported Types ---

// Base Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;

// Composite type used in queries
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

// Type alias for ActivityType enum values
export type ActivityType = (typeof activityTypeEnum.enumValues)[number];

// Palavra Viva Specific Types
export type DailyContent = typeof daily_content.$inferSelect;
export type NewDailyContent = typeof daily_content.$inferInsert;
export type ReadingPlan = typeof reading_plans.$inferSelect;
export type NewReadingPlan = typeof reading_plans.$inferInsert;
export type ReadingPlanDay = typeof reading_plan_days.$inferSelect;
export type NewReadingPlanDay = typeof reading_plan_days.$inferInsert;
export type UserReadingProgress = typeof user_reading_progress.$inferSelect;
export type NewUserReadingProgress = typeof user_reading_progress.$inferInsert;
export type PrayerPair = typeof prayer_pairs.$inferSelect;
export type NewPrayerPair = typeof prayer_pairs.$inferInsert;

// Type for ReadingPlan with its days included
export type ReadingPlanWithDays = ReadingPlan & { days: ReadingPlanDay[] };

// Type for User with their account/subscription details included
export type UserWithSubscription = User & { account: Team | null };

// Bible Content Types (Added)
export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;
export type Verse = typeof verses.$inferSelect;
export type NewVerse = typeof verses.$inferInsert;