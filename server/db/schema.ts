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

export const langEnum = pgEnum("lang", ["ru", "en"]);
export const entityKindEnum = pgEnum("entity_kind", ["word", "person"]);
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
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
    language: langEnum("language").notNull(),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("entities_slug_lang_idx").on(t.slug, t.language)],
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
