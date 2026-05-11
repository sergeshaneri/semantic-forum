CREATE TYPE "public"."entity_kind" AS ENUM('word', 'person');--> statement-breakpoint
CREATE TYPE "public"."lang" AS ENUM('ru', 'en');--> statement-breakpoint
CREATE TYPE "public"."stance" AS ENUM('pro', 'contra', 'neutral');--> statement-breakpoint
CREATE TYPE "public"."theory_object_kind" AS ENUM('aspect', 'function_position', 'type', 'intertype_relation', 'dichotomy', 'custom');--> statement-breakpoint
CREATE TYPE "public"."vote_target" AS ENUM('interpretation', 'comment');--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "citations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"theory_object_id" uuid NOT NULL,
	"author_name" varchar(200) NOT NULL,
	"source_title" varchar(500),
	"quote_text" text NOT NULL,
	"page_ref" varchar(100),
	"language" "lang" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interpretation_id" uuid NOT NULL,
	"parent_comment_id" uuid,
	"author_id" text,
	"body" text NOT NULL,
	"stance" "stance" DEFAULT 'neutral' NOT NULL,
	"votes_up" integer DEFAULT 0 NOT NULL,
	"votes_down" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "entity_kind" NOT NULL,
	"title" varchar(300) NOT NULL,
	"slug" varchar(300) NOT NULL,
	"description_wiki" text,
	"language" "lang" NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entity_tags" (
	"entity_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "entity_tags_entity_id_tag_id_pk" PRIMARY KEY("entity_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "interpretations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid NOT NULL,
	"theory_id" uuid NOT NULL,
	"theory_object_id" uuid NOT NULL,
	"author_id" text,
	"body" text NOT NULL,
	"language" "lang" NOT NULL,
	"votes_up" integer DEFAULT 0 NOT NULL,
	"votes_down" integer DEFAULT 0 NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"label" varchar(200) NOT NULL,
	"language" "lang" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" text,
	"parent_theory_id" uuid,
	"name" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" text,
	"language" "lang" NOT NULL,
	"is_seed" boolean DEFAULT false NOT NULL,
	"rating_avg" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theory_objects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"theory_id" uuid NOT NULL,
	"kind" "theory_object_kind" NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" text,
	"metadata" jsonb,
	"parent_object_id" uuid,
	"position" integer DEFAULT 0 NOT NULL,
	"language" "lang" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255),
	"email_verified" timestamp,
	"username" varchar(64),
	"name" varchar(128),
	"image" text,
	"password_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"target_type" "vote_target" NOT NULL,
	"target_id" uuid NOT NULL,
	"value" smallint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citations" ADD CONSTRAINT "citations_theory_object_id_theory_objects_id_fk" FOREIGN KEY ("theory_object_id") REFERENCES "public"."theory_objects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_interpretation_id_interpretations_id_fk" FOREIGN KEY ("interpretation_id") REFERENCES "public"."interpretations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entities" ADD CONSTRAINT "entities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_tags" ADD CONSTRAINT "entity_tags_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_tags" ADD CONSTRAINT "entity_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretations" ADD CONSTRAINT "interpretations_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretations" ADD CONSTRAINT "interpretations_theory_id_theories_id_fk" FOREIGN KEY ("theory_id") REFERENCES "public"."theories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretations" ADD CONSTRAINT "interpretations_theory_object_id_theory_objects_id_fk" FOREIGN KEY ("theory_object_id") REFERENCES "public"."theory_objects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretations" ADD CONSTRAINT "interpretations_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theories" ADD CONSTRAINT "theories_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theories" ADD CONSTRAINT "theories_parent_fk" FOREIGN KEY ("parent_theory_id") REFERENCES "public"."theories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theory_objects" ADD CONSTRAINT "theory_objects_theory_id_theories_id_fk" FOREIGN KEY ("theory_id") REFERENCES "public"."theories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theory_objects" ADD CONSTRAINT "theory_objects_parent_fk" FOREIGN KEY ("parent_object_id") REFERENCES "public"."theory_objects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "entities_slug_lang_idx" ON "entities" USING btree ("slug","language");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_slug_lang_idx" ON "tags" USING btree ("slug","language");--> statement-breakpoint
CREATE UNIQUE INDEX "theories_slug_lang_idx" ON "theories" USING btree ("slug","language");--> statement-breakpoint
CREATE UNIQUE INDEX "theory_objects_slug_idx" ON "theory_objects" USING btree ("theory_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "votes_user_target_idx" ON "votes" USING btree ("user_id","target_type","target_id");