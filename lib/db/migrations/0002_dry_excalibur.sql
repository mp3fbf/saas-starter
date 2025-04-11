CREATE TABLE IF NOT EXISTS "books" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"abbreviation" varchar(10) NOT NULL,
	"testament" varchar(2) NOT NULL,
	"version" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chapters" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"chapter_number" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
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
	CONSTRAINT "user_id_order" CHECK ("prayer_pairs"."user1_id" < "prayer_pairs"."user2_id")
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
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verses" (
	"id" serial PRIMARY KEY NOT NULL,
	"chapter_id" integer NOT NULL,
	"verse_number" integer NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_invited_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "team_members" DROP CONSTRAINT "team_members_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "team_members" DROP CONSTRAINT "team_members_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "action" SET DATA TYPE activity_type;--> statement-breakpoint
-- ALTER TABLE "teams" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
-- ALTER TABLE "users" ADD COLUMN "notification_time" time DEFAULT '07:00:00';--> statement-breakpoint
-- ALTER TABLE "users" ADD COLUMN "notification_tz" varchar(50) DEFAULT 'America/Sao_Paulo' NOT NULL;--> statement-breakpoint
-- ALTER TABLE "users" ADD COLUMN "push_subscription" jsonb;--> statement-breakpoint
-- ALTER TABLE "users" ADD COLUMN "theme" varchar(50) DEFAULT 'light' NOT NULL;--> statement-breakpoint
-- ALTER TABLE "users" ADD COLUMN "trial_end_date" timestamp;--> statement-breakpoint
-- ALTER TABLE "users" ADD COLUMN "requested_pairing_at" timestamp;--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_pairs" ADD CONSTRAINT "prayer_pairs_user1_id_users_id_fk" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_pairs" ADD CONSTRAINT "prayer_pairs_user2_id_users_id_fk" FOREIGN KEY ("user2_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_plan_days" ADD CONSTRAINT "reading_plan_days_plan_id_reading_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."reading_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reading_progress" ADD CONSTRAINT "user_reading_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reading_progress" ADD CONSTRAINT "user_reading_progress_plan_id_reading_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."reading_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verses" ADD CONSTRAINT "verses_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "books_abbreviation_version_unique_idx" ON "books" USING btree ("abbreviation","version");--> statement-breakpoint
CREATE UNIQUE INDEX "chapters_book_id_chapter_number_unique_idx" ON "chapters" USING btree ("book_id","chapter_number");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_content_date_idx" ON "daily_content" USING btree ("content_date");--> statement-breakpoint
CREATE INDEX "prayer_pairs_user1_id_idx" ON "prayer_pairs" USING btree ("user1_id");--> statement-breakpoint
CREATE INDEX "prayer_pairs_user2_id_idx" ON "prayer_pairs" USING btree ("user2_id");--> statement-breakpoint
CREATE INDEX "prayer_pairs_is_active_idx" ON "prayer_pairs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "reading_plan_days_plan_id_idx" ON "reading_plan_days" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "reading_plans_theme_idx" ON "reading_plans" USING btree ("theme");--> statement-breakpoint
CREATE INDEX "reading_plans_is_premium_idx" ON "reading_plans" USING btree ("is_premium");--> statement-breakpoint
CREATE INDEX "user_reading_progress_user_id_idx" ON "user_reading_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_reading_progress_plan_id_idx" ON "user_reading_progress" USING btree ("plan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "verses_chapter_id_verse_number_unique_idx" ON "verses" USING btree ("chapter_id","verse_number");--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "teams" ADD CONSTRAINT "teams_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_team_unique_idx" ON "team_members" USING btree ("user_id","team_id");--> statement-breakpoint
-- CREATE UNIQUE INDEX "teams_user_id_idx" ON "teams" USING btree ("user_id");--> statement-breakpoint
-- CREATE UNIQUE INDEX "teams_stripe_customer_id_idx" ON "teams" USING btree ("stripe_customer_id");--> statement-breakpoint
-- CREATE UNIQUE INDEX "teams_stripe_subscription_id_idx" ON "teams" USING btree ("stripe_subscription_id");--> statement-breakpoint
-- ALTER TABLE "teams" ADD CONSTRAINT "teams_user_id_unique" UNIQUE("user_id");