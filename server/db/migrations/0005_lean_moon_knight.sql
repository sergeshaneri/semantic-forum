CREATE TYPE "public"."collection_item_target" AS ENUM('entity', 'interpretation', 'theory', 'theory_object', 'publication', 'product', 'school', 'source');--> statement-breakpoint
CREATE TYPE "public"."source_kind" AS ENUM('book', 'article', 'paper', 'video', 'podcast', 'website', 'other');--> statement-breakpoint
CREATE TABLE "collection_items" (
	"collection_id" uuid NOT NULL,
	"target_type" "collection_item_target" NOT NULL,
	"target_id" text NOT NULL,
	"note" varchar(300),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "collection_items_collection_id_target_type_target_id_pk" PRIMARY KEY("collection_id","target_type","target_id")
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_sources" (
	"school_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"note" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "school_sources_school_id_source_id_pk" PRIMARY KEY("school_id","source_id")
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(200) NOT NULL,
	"name" varchar(300) NOT NULL,
	"description" text NOT NULL,
	"founded_year" integer,
	"founded_place" varchar(200),
	"founder_name" varchar(200),
	"website_url" varchar(500),
	"language" "lang" NOT NULL,
	"is_seed" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "source_kind" NOT NULL,
	"title" varchar(500) NOT NULL,
	"author_names" varchar(500),
	"year" integer,
	"url" varchar(500),
	"isbn" varchar(20),
	"description" text,
	"language" "lang" NOT NULL,
	"added_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_influences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"influencer_user_id" text,
	"external_name" varchar(200),
	"note" varchar(300),
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_schools" (
	"user_id" text NOT NULL,
	"school_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_schools_user_id_school_id_pk" PRIMARY KEY("user_id","school_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mentor_available" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mentor_seeking" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_sources" ADD CONSTRAINT "school_sources_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_sources" ADD CONSTRAINT "school_sources_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schools" ADD CONSTRAINT "schools_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_influences" ADD CONSTRAINT "user_influences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_influences" ADD CONSTRAINT "user_influences_influencer_user_id_users_id_fk" FOREIGN KEY ("influencer_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_schools" ADD CONSTRAINT "user_schools_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_schools" ADD CONSTRAINT "user_schools_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "collections_user_slug_idx" ON "collections" USING btree ("user_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "schools_slug_lang_idx" ON "schools" USING btree ("slug","language");