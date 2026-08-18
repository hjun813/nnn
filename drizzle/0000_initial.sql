CREATE TYPE "public"."application_status" AS ENUM('SAVED', 'IN_PROGRESS', 'APPLIED', 'EXPIRED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."deadline_type" AS ENUM('FIXED', 'ALWAYS_OPEN', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('TODO', 'IN_PROGRESS', 'DONE', 'NOT_REQUIRED');--> statement-breakpoint
CREATE TYPE "public"."task_type" AS ENUM('RESUME', 'PORTFOLIO', 'ESSAY', 'ASSIGNMENT', 'CODING_TEST', 'CUSTOM');--> statement-breakpoint
CREATE TABLE "application_task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_posting_id" uuid NOT NULL,
	"type" "task_type" NOT NULL,
	"title" text NOT NULL,
	"status" "task_status" DEFAULT 'TODO' NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "essay_question" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_posting_id" uuid NOT NULL,
	"question" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_posting" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"position_title" text NOT NULL,
	"source_url" text,
	"normalized_url" text,
	"platform" text,
	"deadline_type" "deadline_type" DEFAULT 'UNKNOWN' NOT NULL,
	"actual_deadline" timestamp with time zone,
	"target_deadline" timestamp with time zone,
	"status" "application_status" DEFAULT 'SAVED' NOT NULL,
	"status_before_expiry" "application_status",
	"memo" text,
	"applied_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "target_before_actual" CHECK ("job_posting"."target_deadline" is null or "job_posting"."actual_deadline" is null or "job_posting"."target_deadline" <= "job_posting"."actual_deadline")
);
--> statement-breakpoint
CREATE TABLE "status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_posting_id" uuid NOT NULL,
	"from_status" "application_status",
	"to_status" "application_status" NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"timezone" text DEFAULT 'Asia/Seoul' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "application_task" ADD CONSTRAINT "application_task_job_posting_id_job_posting_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_posting"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "essay_question" ADD CONSTRAINT "essay_question_job_posting_id_job_posting_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_posting"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting" ADD CONSTRAINT "job_posting_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_job_posting_id_job_posting_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_posting"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "application_task_job_order_idx" ON "application_task" USING btree ("job_posting_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "job_posting_user_normalized_url_unique" ON "job_posting" USING btree ("user_id","normalized_url");--> statement-breakpoint
CREATE INDEX "job_posting_user_status_target_idx" ON "job_posting" USING btree ("user_id","status","target_deadline");--> statement-breakpoint
CREATE INDEX "job_posting_user_status_actual_idx" ON "job_posting" USING btree ("user_id","status","actual_deadline");