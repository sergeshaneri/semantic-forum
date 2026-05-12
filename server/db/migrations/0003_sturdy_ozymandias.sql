CREATE TYPE "public"."link_kind" AS ENUM('website', 'telegram', 'youtube', 'instagram', 'twitter', 'vk', 'linkedin', 'github', 'other');--> statement-breakpoint
CREATE TYPE "public"."product_kind" AS ENUM('course', 'consultation', 'book', 'typing', 'workshop', 'other');--> statement-breakpoint
CREATE TYPE "public"."publication_kind" AS ENUM('article', 'video');--> statement-breakpoint
CREATE TYPE "public"."ref_target" AS ENUM('entity', 'theory', 'theory_object');--> statement-breakpoint
CREATE TABLE "product_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"author_id" text NOT NULL,
	"rating" smallint NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"kind" "product_kind" NOT NULL,
	"title" varchar(300) NOT NULL,
	"description" text NOT NULL,
	"price_cents" integer,
	"currency" varchar(3),
	"url" varchar(500),
	"language" "lang" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "publication_references" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publication_id" uuid NOT NULL,
	"target_type" "ref_target" NOT NULL,
	"target_id" uuid NOT NULL,
	"note" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publication_tags" (
	"publication_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "publication_tags_publication_id_tag_id_pk" PRIMARY KEY("publication_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "publications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" text NOT NULL,
	"kind" "publication_kind" NOT NULL,
	"title" varchar(300) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"external_url" varchar(500),
	"language" "lang" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"kind" "link_kind" NOT NULL,
	"label" varchar(100) NOT NULL,
	"url" varchar(500) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "roles" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication_references" ADD CONSTRAINT "publication_references_publication_id_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication_tags" ADD CONSTRAINT "publication_tags_publication_id_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication_tags" ADD CONSTRAINT "publication_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications" ADD CONSTRAINT "publications_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_links" ADD CONSTRAINT "user_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "product_reviews_uniq_idx" ON "product_reviews" USING btree ("product_id","author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "publications_author_slug_idx" ON "publications" USING btree ("author_id","slug");