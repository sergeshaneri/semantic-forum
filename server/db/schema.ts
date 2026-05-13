import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const publicationKindEnum = pgEnum("publication_kind", [
  "article",
  "video",
]);
export const productKindEnum = pgEnum("product_kind", [
  "course",
  "consultation",
  "book",
  "typing",
  "workshop",
  "other",
]);
export const linkKindEnum = pgEnum("link_kind", [
  "website",
  "telegram",
  "youtube",
  "instagram",
  "twitter",
  "vk",
  "linkedin",
  "github",
  "other",
]);
export const refTargetEnum = pgEnum("ref_target", [
  "entity",
  "theory",
  "theory_object",
]);

export const sourceKindEnum = pgEnum("source_kind", [
  "book",
  "article",
  "paper",
  "video",
  "podcast",
  "website",
  "other",
]);

export const collectionItemTargetEnum = pgEnum("collection_item_target", [
  "entity",
  "interpretation",
  "theory",
  "theory_object",
  "publication",
  "product",
  "school",
  "source",
]);

export const langEnum = pgEnum("lang", ["ru", "en"]);
export const entityKindEnum = pgEnum("entity_kind", [
  "word",
  "person",
  "material",
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "mention",
  "reply",
  "interpretation_voted",
  "follow",
  "review",
  "message",
]);
export const bookmarkTargetEnum = pgEnum("bookmark_target", [
  "entity",
  "interpretation",
  "theory",
  "theory_object",
  "publication",
  "product",
]);
export const theoryObjectKindEnum = pgEnum("theory_object_kind", [
  "aspect",
  "function_position",
  "type",
  "intertype_relation",
  "dichotomy",
  "custom",
]);
export const stanceEnum = pgEnum("stance", ["pro", "contra", "neutral"]);
export const voteTargetEnum = pgEnum("vote_target", [
  "interpretation",
  "comment",
  "answer",
]);
export const eventKindEnum = pgEnum("event_kind", [
  "online",
  "offline",
  "hybrid",
]);
export const rsvpStatusEnum = pgEnum("rsvp_status", [
  "going",
  "maybe",
  "interested",
]);
export const entityRelationKindEnum = pgEnum("entity_relation_kind", [
  "related",
  "synonym",
  "antonym",
  "part_of",
  "contains",
  "example_of",
  "instance_of",
  "causes",
  "precedes",
  "custom",
]);

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  username: varchar("username", { length: 64 }).unique(),
  name: varchar("name", { length: 128 }),
  image: text("image"),
  bio: text("bio"),
  roles: jsonb("roles").$type<string[]>().default([]).notNull(),
  mentorAvailable: boolean("mentor_available").default(false).notNull(),
  mentorSeeking: boolean("mentor_seeking").default(false).notNull(),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userLinks = pgTable(
  "user_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: linkKindEnum("kind").notNull(),
    label: varchar("label", { length: 100 }).notNull(),
    url: varchar("url", { length: 500 }).notNull(),
    position: integer("position").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
);

export const publications = pgTable(
  "publications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: publicationKindEnum("kind").notNull(),
    title: varchar("title", { length: 300 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    body: text("body").notNull(),
    externalUrl: varchar("external_url", { length: 500 }),
    language: langEnum("language").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (t) => [uniqueIndex("publications_author_slug_idx").on(t.authorId, t.slug)],
);

export const publicationTags = pgTable(
  "publication_tags",
  {
    publicationId: uuid("publication_id")
      .notNull()
      .references(() => publications.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.publicationId, t.tagId] })],
);

export const publicationReferences = pgTable("publication_references", {
  id: uuid("id").primaryKey().defaultRandom(),
  publicationId: uuid("publication_id")
    .notNull()
    .references(() => publications.id, { onDelete: "cascade" }),
  targetType: refTargetEnum("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  note: varchar("note", { length: 200 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: productKindEnum("kind").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description").notNull(),
  priceCents: integer("price_cents"),
  currency: varchar("currency", { length: 3 }),
  url: varchar("url", { length: 500 }),
  language: langEnum("language").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const schools = pgTable(
  "schools",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 200 }).notNull(),
    name: varchar("name", { length: 300 }).notNull(),
    description: text("description").notNull(),
    foundedYear: integer("founded_year"),
    foundedPlace: varchar("founded_place", { length: 200 }),
    founderName: varchar("founder_name", { length: 200 }),
    websiteUrl: varchar("website_url", { length: 500 }),
    language: langEnum("language").notNull(),
    isSeed: boolean("is_seed").default(false).notNull(),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("schools_slug_lang_idx").on(t.slug, t.language)],
);

export const sources = pgTable("sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: sourceKindEnum("kind").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  authorNames: varchar("author_names", { length: 500 }),
  year: integer("year"),
  url: varchar("url", { length: 500 }),
  isbn: varchar("isbn", { length: 20 }),
  description: text("description"),
  language: langEnum("language").notNull(),
  addedBy: text("added_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const schoolSources = pgTable(
  "school_sources",
  {
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    note: varchar("note", { length: 200 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.schoolId, t.sourceId] })],
);

export const userSchools = pgTable(
  "user_schools",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.schoolId] })],
);

export const userInfluences = pgTable("user_influences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  influencerUserId: text("influencer_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  externalName: varchar("external_name", { length: 200 }),
  note: varchar("note", { length: 300 }),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    description: text("description"),
    isPublic: boolean("is_public").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("collections_user_slug_idx").on(t.userId, t.slug)],
);

export const collectionItems = pgTable(
  "collection_items",
  {
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    targetType: collectionItemTargetEnum("target_type").notNull(),
    targetId: text("target_id").notNull(),
    note: varchar("note", { length: 300 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    primaryKey({
      columns: [t.collectionId, t.targetType, t.targetId],
    }),
  ],
);

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: text("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 300 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    body: text("body").notNull(),
    language: langEnum("language").notNull(),
    isResolved: boolean("is_resolved").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (t) => [uniqueIndex("questions_slug_lang_idx").on(t.slug, t.language)],
);

export const answers = pgTable("answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  authorId: text("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  body: text("body").notNull(),
  isAccepted: boolean("is_accepted").default(false).notNull(),
  votesUp: integer("votes_up").default(0).notNull(),
  votesDown: integer("votes_down").default(0).notNull(),
  score: integer("score").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizerId: text("organizer_id").references(() => users.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 300 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    description: text("description").notNull(),
    kind: eventKindEnum("kind").notNull(),
    startAt: timestamp("start_at").notNull(),
    endAt: timestamp("end_at"),
    location: varchar("location", { length: 300 }),
    locationUrl: varchar("location_url", { length: 500 }),
    language: langEnum("language").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (t) => [uniqueIndex("events_slug_lang_idx").on(t.slug, t.language)],
);

export const eventAttendees = pgTable(
  "event_attendees",
  {
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: rsvpStatusEnum("status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.userId] })],
);

export const productReviews = pgTable(
  "product_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: smallint("rating").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (t) => [uniqueIndex("product_reviews_uniq_idx").on(t.productId, t.authorId)],
);

export const follows = pgTable(
  "follows",
  {
    followerId: text("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: text("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.followerId, t.followingId] })],
);

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const theories = pgTable(
  "theories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: text("author_id").references(() => users.id, { onDelete: "set null" }),
    parentTheoryId: uuid("parent_theory_id"),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    description: text("description"),
    language: langEnum("language").notNull(),
    isSeed: boolean("is_seed").default(false).notNull(),
    ratingAvg: integer("rating_avg").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("theories_slug_lang_idx").on(t.slug, t.language),
    foreignKey({
      columns: [t.parentTheoryId],
      foreignColumns: [t.id],
      name: "theories_parent_fk",
    }),
  ],
);

export const theoryObjects = pgTable(
  "theory_objects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    theoryId: uuid("theory_id")
      .notNull()
      .references(() => theories.id, { onDelete: "cascade" }),
    kind: theoryObjectKindEnum("kind").notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    description: text("description"),
    metadata: jsonb("metadata"),
    parentObjectId: uuid("parent_object_id"),
    position: integer("position").default(0).notNull(),
    language: langEnum("language").notNull(),
  },
  (t) => [
    uniqueIndex("theory_objects_slug_idx").on(t.theoryId, t.slug),
    foreignKey({
      columns: [t.parentObjectId],
      foreignColumns: [t.id],
      name: "theory_objects_parent_fk",
    }),
  ],
);

export const citations = pgTable("citations", {
  id: uuid("id").primaryKey().defaultRandom(),
  theoryObjectId: uuid("theory_object_id")
    .notNull()
    .references(() => theoryObjects.id, { onDelete: "cascade" }),
  authorName: varchar("author_name", { length: 200 }).notNull(),
  sourceTitle: varchar("source_title", { length: 500 }),
  quoteText: text("quote_text").notNull(),
  pageRef: varchar("page_ref", { length: 100 }),
  language: langEnum("language").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const entities = pgTable(
  "entities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: entityKindEnum("kind").notNull(),
    title: varchar("title", { length: 300 }).notNull(),
    slug: varchar("slug", { length: 300 }).notNull(),
    descriptionWiki: text("description_wiki"),
    embedUrl: varchar("embed_url", { length: 500 }),
    sourceUrl: varchar("source_url", { length: 500 }),
    language: langEnum("language").notNull(),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("entities_slug_lang_idx").on(t.slug, t.language)],
);

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipientId: text("recipient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
  type: notificationTypeEnum("type").notNull(),
  targetType: varchar("target_type", { length: 32 }),
  targetId: text("target_id"),
  url: varchar("url", { length: 500 }),
  message: text("message"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookmarks = pgTable(
  "bookmarks",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: bookmarkTargetEnum("target_type").notNull(),
    targetId: text("target_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.targetType, t.targetId] })],
);

export const interpretations = pgTable("interpretations", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityId: uuid("entity_id")
    .notNull()
    .references(() => entities.id, { onDelete: "cascade" }),
  theoryId: uuid("theory_id")
    .notNull()
    .references(() => theories.id, { onDelete: "restrict" }),
  theoryObjectId: uuid("theory_object_id")
    .notNull()
    .references(() => theoryObjects.id, { onDelete: "restrict" }),
  authorId: text("author_id").references(() => users.id, { onDelete: "set null" }),
  body: text("body").notNull(),
  language: langEnum("language").notNull(),
  votesUp: integer("votes_up").default(0).notNull(),
  votesDown: integer("votes_down").default(0).notNull(),
  score: integer("score").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    interpretationId: uuid("interpretation_id")
      .notNull()
      .references(() => interpretations.id, { onDelete: "cascade" }),
    parentCommentId: uuid("parent_comment_id"),
    authorId: text("author_id").references(() => users.id, { onDelete: "set null" }),
    body: text("body").notNull(),
    stance: stanceEnum("stance").default("neutral").notNull(),
    votesUp: integer("votes_up").default(0).notNull(),
    votesDown: integer("votes_down").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (t) => [
    foreignKey({
      columns: [t.parentCommentId],
      foreignColumns: [t.id],
      name: "comments_parent_fk",
    }),
  ],
);

export const votes = pgTable(
  "votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: voteTargetEnum("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    value: smallint("value").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("votes_user_target_idx").on(t.userId, t.targetType, t.targetId)],
);

export const entityRelations = pgTable(
  "entity_relations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceEntityId: uuid("source_entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    targetEntityId: uuid("target_entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    kind: entityRelationKindEnum("kind").notNull(),
    customLabel: varchar("custom_label", { length: 100 }),
    description: text("description"),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("entity_relations_uniq_idx").on(
      t.sourceEntityId,
      t.targetEntityId,
      t.kind,
    ),
  ],
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 100 }).notNull(),
    label: varchar("label", { length: 200 }).notNull(),
    language: langEnum("language").notNull(),
  },
  (t) => [uniqueIndex("tags_slug_lang_idx").on(t.slug, t.language)],
);

export const entityTags = pgTable(
  "entity_tags",
  {
    entityId: uuid("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.entityId, t.tagId] })],
);

// ----- Versioning: revisions tables -----

export const interpretationRevisions = pgTable("interpretation_revisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  interpretationId: uuid("interpretation_id")
    .notNull()
    .references(() => interpretations.id, { onDelete: "cascade" }),
  theoryId: uuid("theory_id").notNull(),
  theoryObjectId: uuid("theory_object_id").notNull(),
  body: text("body").notNull(),
  editorId: text("editor_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const publicationRevisions = pgTable("publication_revisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  publicationId: uuid("publication_id")
    .notNull()
    .references(() => publications.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 300 }).notNull(),
  body: text("body").notNull(),
  externalUrl: varchar("external_url", { length: 500 }),
  editorId: text("editor_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----- Direct messages -----

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastMessageAt: timestamp("last_message_at"),
});

export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lastReadAt: timestamp("last_read_at"),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.conversationId, t.userId] })],
);

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----- Polls -----

export const polls = pgTable(
  "polls",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 200 }).notNull(),
    question: varchar("question", { length: 500 }).notNull(),
    description: text("description"),
    options: jsonb("options").notNull(), // string[]
    language: langEnum("language").notNull(),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    closesAt: timestamp("closes_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("polls_slug_lang_idx").on(t.slug, t.language)],
);

export const pollVotes = pgTable(
  "poll_votes",
  {
    pollId: uuid("poll_id")
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    optionIndex: integer("option_index").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.pollId, t.userId] })],
);

// ----- Co-authorship -----

export const interpretationCoauthors = pgTable(
  "interpretation_coauthors",
  {
    interpretationId: uuid("interpretation_id")
      .notNull()
      .references(() => interpretations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.interpretationId, t.userId] })],
);

export const publicationCoauthors = pgTable(
  "publication_coauthors",
  {
    publicationId: uuid("publication_id")
      .notNull()
      .references(() => publications.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.publicationId, t.userId] })],
);

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  theoriesAuthored: many(theories),
  entitiesCreated: many(entities),
  interpretations: many(interpretations),
  comments: many(comments),
  votes: many(votes),
  followers: many(follows, { relationName: "userFollowing" }),
  following: many(follows, { relationName: "userFollower" }),
  links: many(userLinks),
  publications: many(publications),
  products: many(products),
  reviewsWritten: many(productReviews),
}));

export const userLinksRelations = relations(userLinks, ({ one }) => ({
  user: one(users, { fields: [userLinks.userId], references: [users.id] }),
}));

export const publicationsRelations = relations(publications, ({ one, many }) => ({
  author: one(users, {
    fields: [publications.authorId],
    references: [users.id],
  }),
  tags: many(publicationTags),
  references: many(publicationReferences),
  revisions: many(publicationRevisions),
  coauthors: many(publicationCoauthors),
}));

export const publicationTagsRelations = relations(publicationTags, ({ one }) => ({
  publication: one(publications, {
    fields: [publicationTags.publicationId],
    references: [publications.id],
  }),
  tag: one(tags, { fields: [publicationTags.tagId], references: [tags.id] }),
}));

export const publicationReferencesRelations = relations(
  publicationReferences,
  ({ one }) => ({
    publication: one(publications, {
      fields: [publicationReferences.publicationId],
      references: [publications.id],
    }),
  }),
);

export const interpretationRevisionsRelations = relations(
  interpretationRevisions,
  ({ one }) => ({
    interpretation: one(interpretations, {
      fields: [interpretationRevisions.interpretationId],
      references: [interpretations.id],
    }),
    editor: one(users, {
      fields: [interpretationRevisions.editorId],
      references: [users.id],
    }),
  }),
);

export const publicationRevisionsRelations = relations(
  publicationRevisions,
  ({ one }) => ({
    publication: one(publications, {
      fields: [publicationRevisions.publicationId],
      references: [publications.id],
    }),
    editor: one(users, {
      fields: [publicationRevisions.editorId],
      references: [users.id],
    }),
  }),
);

export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(
  conversationParticipants,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationParticipants.conversationId],
      references: [conversations.id],
    }),
    user: one(users, {
      fields: [conversationParticipants.userId],
      references: [users.id],
    }),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  author: one(users, {
    fields: [messages.authorId],
    references: [users.id],
  }),
}));

export const pollsRelations = relations(polls, ({ one, many }) => ({
  creator: one(users, {
    fields: [polls.createdBy],
    references: [users.id],
  }),
  votes: many(pollVotes),
}));

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
  poll: one(polls, { fields: [pollVotes.pollId], references: [polls.id] }),
  user: one(users, { fields: [pollVotes.userId], references: [users.id] }),
}));

export const interpretationCoauthorsRelations = relations(
  interpretationCoauthors,
  ({ one }) => ({
    interpretation: one(interpretations, {
      fields: [interpretationCoauthors.interpretationId],
      references: [interpretations.id],
    }),
    user: one(users, {
      fields: [interpretationCoauthors.userId],
      references: [users.id],
    }),
  }),
);

export const publicationCoauthorsRelations = relations(
  publicationCoauthors,
  ({ one }) => ({
    publication: one(publications, {
      fields: [publicationCoauthors.publicationId],
      references: [publications.id],
    }),
    user: one(users, {
      fields: [publicationCoauthors.userId],
      references: [users.id],
    }),
  }),
);

export const productsRelations = relations(products, ({ one, many }) => ({
  owner: one(users, { fields: [products.ownerId], references: [users.id] }),
  reviews: many(productReviews),
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.id],
  }),
  author: one(users, {
    fields: [productReviews.authorId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, {
    fields: [notifications.recipientId],
    references: [users.id],
    relationName: "userNotifications",
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
    relationName: "userActedAs",
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
}));

export const schoolsRelations = relations(schools, ({ one, many }) => ({
  creator: one(users, {
    fields: [schools.createdBy],
    references: [users.id],
  }),
  sources: many(schoolSources),
  members: many(userSchools),
}));

export const sourcesRelations = relations(sources, ({ one, many }) => ({
  addedByUser: one(users, {
    fields: [sources.addedBy],
    references: [users.id],
  }),
  schoolLinks: many(schoolSources),
}));

export const schoolSourcesRelations = relations(schoolSources, ({ one }) => ({
  school: one(schools, {
    fields: [schoolSources.schoolId],
    references: [schools.id],
  }),
  source: one(sources, {
    fields: [schoolSources.sourceId],
    references: [sources.id],
  }),
}));

export const userSchoolsRelations = relations(userSchools, ({ one }) => ({
  user: one(users, { fields: [userSchools.userId], references: [users.id] }),
  school: one(schools, {
    fields: [userSchools.schoolId],
    references: [schools.id],
  }),
}));

export const userInfluencesRelations = relations(userInfluences, ({ one }) => ({
  user: one(users, {
    fields: [userInfluences.userId],
    references: [users.id],
    relationName: "userOwnInfluences",
  }),
  influencerUser: one(users, {
    fields: [userInfluences.influencerUserId],
    references: [users.id],
    relationName: "userAsInfluencer",
  }),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(users, { fields: [collections.userId], references: [users.id] }),
  items: many(collectionItems),
}));

export const collectionItemsRelations = relations(
  collectionItems,
  ({ one }) => ({
    collection: one(collections, {
      fields: [collectionItems.collectionId],
      references: [collections.id],
    }),
  }),
);

export const questionsRelations = relations(questions, ({ one, many }) => ({
  author: one(users, {
    fields: [questions.authorId],
    references: [users.id],
  }),
  answers: many(answers),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
  author: one(users, {
    fields: [answers.authorId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  attendees: many(eventAttendees),
}));

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  event: one(events, {
    fields: [eventAttendees.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventAttendees.userId],
    references: [users.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "userFollower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "userFollowing",
  }),
}));

export const theoriesRelations = relations(theories, ({ one, many }) => ({
  author: one(users, { fields: [theories.authorId], references: [users.id] }),
  parent: one(theories, {
    fields: [theories.parentTheoryId],
    references: [theories.id],
    relationName: "theoryParent",
  }),
  forks: many(theories, { relationName: "theoryParent" }),
  objects: many(theoryObjects),
  interpretations: many(interpretations),
}));

export const theoryObjectsRelations = relations(theoryObjects, ({ one, many }) => ({
  theory: one(theories, {
    fields: [theoryObjects.theoryId],
    references: [theories.id],
  }),
  parent: one(theoryObjects, {
    fields: [theoryObjects.parentObjectId],
    references: [theoryObjects.id],
    relationName: "objParent",
  }),
  children: many(theoryObjects, { relationName: "objParent" }),
  citations: many(citations),
  interpretations: many(interpretations),
}));

export const citationsRelations = relations(citations, ({ one }) => ({
  theoryObject: one(theoryObjects, {
    fields: [citations.theoryObjectId],
    references: [theoryObjects.id],
  }),
}));

export const entitiesRelations = relations(entities, ({ one, many }) => ({
  creator: one(users, { fields: [entities.createdBy], references: [users.id] }),
  interpretations: many(interpretations),
  tags: many(entityTags),
  relationsFrom: many(entityRelations, { relationName: "relationSource" }),
  relationsTo: many(entityRelations, { relationName: "relationTarget" }),
}));

export const entityRelationsRelations = relations(entityRelations, ({ one }) => ({
  source: one(entities, {
    fields: [entityRelations.sourceEntityId],
    references: [entities.id],
    relationName: "relationSource",
  }),
  target: one(entities, {
    fields: [entityRelations.targetEntityId],
    references: [entities.id],
    relationName: "relationTarget",
  }),
  creator: one(users, {
    fields: [entityRelations.createdBy],
    references: [users.id],
  }),
}));

export const interpretationsRelations = relations(interpretations, ({ one, many }) => ({
  entity: one(entities, {
    fields: [interpretations.entityId],
    references: [entities.id],
  }),
  theory: one(theories, {
    fields: [interpretations.theoryId],
    references: [theories.id],
  }),
  theoryObject: one(theoryObjects, {
    fields: [interpretations.theoryObjectId],
    references: [theoryObjects.id],
  }),
  author: one(users, {
    fields: [interpretations.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  revisions: many(interpretationRevisions),
  coauthors: many(interpretationCoauthors),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  interpretation: one(interpretations, {
    fields: [comments.interpretationId],
    references: [interpretations.id],
  }),
  parent: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: "commentParent",
  }),
  replies: many(comments, { relationName: "commentParent" }),
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  entities: many(entityTags),
}));

export const entityTagsRelations = relations(entityTags, ({ one }) => ({
  entity: one(entities, {
    fields: [entityTags.entityId],
    references: [entities.id],
  }),
  tag: one(tags, { fields: [entityTags.tagId], references: [tags.id] }),
}));
