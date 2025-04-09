DO $$ BEGIN
 CREATE TYPE "activity_type" AS ENUM (
  -- Auth & Account
  'SIGN_UP',
  'SIGN_IN',
  'SIGN_OUT',
  'UPDATE_PASSWORD',
  'DELETE_ACCOUNT',
  'UPDATE_ACCOUNT',
  -- Team (Kept from template)
  'CREATE_TEAM',
  'REMOVE_TEAM_MEMBER',
  'INVITE_TEAM_MEMBER',
  'ACCEPT_INVITATION',
  -- Palavra Viva Specific Actions
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
  'CHANGE_THEME'
 );
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
-- Add new values to the activity_type enum
-- Note: Cannot add multiple values in one command before PostgreSQL 10
-- Separate commands for broader compatibility, though Drizzle might generate combined if targetting newer PG.
-- DO $$ BEGIN
--     ALTER TYPE "activity_type" ADD VALUE 'VIEW_DAILY_CONTENT';
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;
-- DO $$ BEGIN
--     ALTER TYPE "activity_type" ADD VALUE 'PLAY_AUDIO';
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;
-- DO $$ BEGIN
--     ALTER TYPE "activity_type" ADD VALUE 'SHARE_CONTENT';
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;
-- DO $$ BEGIN
--     ALTER TYPE "activity_type" ADD VALUE 'ADD_PRAYER';
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;
-- DO $$ BEGIN
--     ALTER TYPE "activity_type" ADD VALUE 'DELETE_PRAYER';
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;
-- DO $$ BEGIN
--     ALTER TYPE "activity_type" ADD VALUE 'START_READING_PLAN';
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;
-- DO $$ BEGIN
--     ALTER TYPE "activity_type" ADD VALUE 'COMPLETE_READING_DAY';
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;
-- DO $$ BEGIN
--     ALTER TYPE "activity_type" ADD VALUE 'COMPLETE_READING_PLAN';
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;
-- DO $$ BEGIN
--     ALTER TYPE "activity_type" ADD VALUE 'REQUEST_PRAYER_PAIR';
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;
-- DO $$ BEGIN
--     ALTER TYPE "activity_type" ADD VALUE 'MARK_PRAYER_DONE';
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;
-- DO $$ BEGIN
--     ALTER TYPE "activity_type" ADD VALUE 'ENABLE_NOTIFICATIONS';
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;
-- DO $$ BEGIN
--     ALTER TYPE "activity_type" ADD VALUE 'CHANGE_THEME';
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;
-- Removed the above ALTER TYPE ADD VALUE blocks as the CREATE TYPE now includes all values.

-- Create new tables
CREATE TABLE IF NOT EXISTS "daily_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_date" date NOT NULL,
	"verse_ref" varchar(100) NOT NULL,
	"verse_text" text NOT NULL,
	"reflection_text" text NOT NULL,
	"audio_url_free" text,
	"audio_url_premium" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_content_content_date_unique" UNIQUE("content_date")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prayer_pairs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user1_id" integer NOT NULL,
	"user2_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user1_last_prayed_at" timestamp,
	"user2_last_prayed_at" timestamp,
	"user1_notified_at" timestamp,
	"user2_notified_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "user_id_order" CHECK(user1_id < user2_id)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reading_plan_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"day_number" integer NOT NULL,
	"verse_ref" varchar(100) NOT NULL,
	"verse_text" text NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reading_plan_days_plan_id_day_number_unique" UNIQUE("plan_id","day_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reading_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"duration_days" integer NOT NULL,
	"theme" varchar(100),
	"is_premium" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_reading_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"current_day" integer DEFAULT 1 NOT NULL,
	"completed_at" timestamp,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_reading_progress_user_id_plan_id_unique" UNIQUE("user_id","plan_id")
);

-- Update existing tables (FKs, columns, indexes, action type)

-- Drop existing FKs that need ON DELETE changes
ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "activity_logs_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "activity_logs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "invitations" DROP CONSTRAINT IF EXISTS "invitations_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "invitations" DROP CONSTRAINT IF EXISTS "invitations_invited_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "team_members_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "team_members_team_id_teams_id_fk";

-- Add columns to users table
ALTER TABLE "users" ADD COLUMN "notification_time" time DEFAULT '07:00:00';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "notification_tz" varchar(50) DEFAULT 'America/Sao_Paulo' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "push_subscription" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "theme" varchar(50) DEFAULT 'light' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "trial_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "requested_pairing_at" timestamp;

-- Add userId column and constraint to teams table
ALTER TABLE "teams" ADD COLUMN "user_id" integer; -- Allow NULL initially
--> statement-breakpoint

-- Populate user_id for existing teams based on team_members
-- Assumes each team has a corresponding entry in team_members linking it to the user
UPDATE teams t SET user_id = tm.user_id FROM team_members tm WHERE t.id = tm.team_id AND t.user_id IS NULL;
--> statement-breakpoint

-- Now apply the NOT NULL constraint
ALTER TABLE "teams" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "teams" ADD CONSTRAINT "teams_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_user_id_unique" UNIQUE("user_id");

-- Change activity_logs action column type
ALTER TABLE "activity_logs" ALTER COLUMN "action" TYPE activity_type USING "action"::activity_type;

-- Add indexes
CREATE UNIQUE INDEX IF NOT EXISTS "teams_user_id_idx" ON "teams" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "teams_stripe_customer_id_idx" ON "teams" ("stripe_customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "teams_stripe_subscription_id_idx" ON "teams" ("stripe_subscription_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_team_unique_idx" ON "team_members" ("user_id","team_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "daily_content_date_idx" ON "daily_content" ("content_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "prayer_pairs_user1_id_idx" ON "prayer_pairs" ("user1_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "prayer_pairs_user2_id_idx" ON "prayer_pairs" ("user2_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "prayer_pairs_is_active_idx" ON "prayer_pairs" ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reading_plan_days_plan_id_idx" ON "reading_plan_days" ("plan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reading_plans_theme_idx" ON "reading_plans" ("theme");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reading_plans_is_premium_idx" ON "reading_plans" ("is_premium");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_reading_progress_user_id_idx" ON "user_reading_progress" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_reading_progress_plan_id_idx" ON "user_reading_progress" ("plan_id");

-- Re-add FKs with updated ON DELETE rules
DO $$ BEGIN
 ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invitations" ADD CONSTRAINT "invitations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prayer_pairs" ADD CONSTRAINT "prayer_pairs_user1_id_users_id_fk" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prayer_pairs" ADD CONSTRAINT "prayer_pairs_user2_id_users_id_fk" FOREIGN KEY ("user2_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reading_plan_days" ADD CONSTRAINT "reading_plan_days_plan_id_reading_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."reading_plans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_reading_progress" ADD CONSTRAINT "user_reading_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_reading_progress" ADD CONSTRAINT "user_reading_progress_plan_id_reading_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."reading_plans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;