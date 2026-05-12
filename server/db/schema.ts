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
export const voteTargetEnum = pgEnum("vote_target", ["interpretation", "comment"]);
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
