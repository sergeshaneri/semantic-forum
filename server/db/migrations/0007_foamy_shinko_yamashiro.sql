CREATE TABLE "interpretation_coauthors" (
	"interpretation_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "interpretation_coauthors_interpretation_id_user_id_pk" PRIMARY KEY("interpretation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "interpretation_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interpretation_id" uuid NOT NULL,
	"theory_id" uuid NOT NULL,
	"theory_object_id" uuid NOT NULL,
	"body" text NOT NULL,
	"editor_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publication_coauthors" (
	"publication_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "publication_coauthors_publication_id_user_id_pk" PRIMARY KEY("publication_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "publication_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publication_id" uuid NOT NULL,
	"title" varchar(300) NOT NULL,
	"body" text NOT NULL,
	"external_url" varchar(500),
	"editor_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interpretation_coauthors" ADD CONSTRAINT "interpretation_coauthors_interpretation_id_interpretations_id_fk" FOREIGN KEY ("interpretation_id") REFERENCES "public"."interpretations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretation_coauthors" ADD CONSTRAINT "interpretation_coauthors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretation_revisions" ADD CONSTRAINT "interpretation_revisions_interpretation_id_interpretations_id_fk" FOREIGN KEY ("interpretation_id") REFERENCES "public"."interpretations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretation_revisions" ADD CONSTRAINT "interpretation_revisions_editor_id_users_id_fk" FOREIGN KEY ("editor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication_coauthors" ADD CONSTRAINT "publication_coauthors_publication_id_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication_coauthors" ADD CONSTRAINT "publication_coauthors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication_revisions" ADD CONSTRAINT "publication_revisions_publication_id_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication_revisions" ADD CONSTRAINT "publication_revisions_editor_id_users_id_fk" FOREIGN KEY ("editor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;