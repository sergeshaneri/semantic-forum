CREATE TYPE "public"."bookmark_target" AS ENUM('entity', 'interpretation', 'theory', 'theory_object', 'publication', 'product');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('mention', 'reply', 'interpretation_voted', 'follow', 'review');--> statement-breakpoint
ALTER TYPE "public"."entity_kind" ADD VALUE 'material';--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"user_id" text NOT NULL,
	"target_type" "bookmark_target" NOT NULL,
	"target_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookmarks_user_id_target_type_target_id_pk" PRIMARY KEY("user_id","target_type","target_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_id" text NOT NULL,
	"actor_id" text,
	"type" "notification_type" NOT NULL,
	"target_type" varchar(32),
	"target_id" text,
	"url" varchar(500),
	"message" text,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "entities" ADD COLUMN "embed_url" varchar(500);--> statement-breakpoint
ALTER TABLE "entities" ADD COLUMN "source_url" varchar(500);--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;