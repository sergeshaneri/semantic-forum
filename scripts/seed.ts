import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  mockCitations,
  mockEntities,
  mockInterpretations,
  mockTheories,
  mockTheoryObjects,
  mockUsers,
} from "@/lib/mock/data";
import * as schema from "@/server/db/schema";

export async function runSeed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  console.log("[seed] connecting...");
  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client, { schema, casing: "snake_case" });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.theories);

  if (count > 0) {
    console.log(`[seed] db already contains ${count} theories, skipping`);
    await client.end({ timeout: 5 });
    return;
  }

  console.log("[seed] inserting users...");
  const insertedUsers = await db
    .insert(schema.users)
    .values(
      mockUsers.map((u) => ({
        username: u.username,
        name: u.name,
      })),
    )
    .returning({
      id: schema.users.id,
      username: schema.users.username,
    });

  const userIdMap = new Map<string, string>();
  for (const mu of mockUsers) {
    const real = insertedUsers.find((u) => u.username === mu.username);
    if (real) userIdMap.set(mu.id, real.id);
  }

  console.log("[seed] inserting seed theory...");
  const seedTheory = mockTheories.find((t) => t.isSeed);
  if (!seedTheory) throw new Error("no seed theory in mock data");

  const theoryIdMap = new Map<string, string>();

  const [seedInserted] = await db
    .insert(schema.theories)
    .values({
      name: seedTheory.name,
      slug: seedTheory.slug,
      description: seedTheory.description,
      language: seedTheory.language,
      isSeed: true,
      ratingAvg: seedTheory.ratingAvg,
      authorId: seedTheory.authorId
        ? (userIdMap.get(seedTheory.authorId) ?? null)
        : null,
    })
    .returning({ id: schema.theories.id });
  theoryIdMap.set(seedTheory.id, seedInserted.id);

  console.log("[seed] inserting forked theories...");
  for (const fork of mockTheories.filter((t) => !t.isSeed)) {
    const [inserted] = await db
      .insert(schema.theories)
      .values({
        name: fork.name,
        slug: fork.slug,
        description: fork.description,
        language: fork.language,
        isSeed: false,
        ratingAvg: fork.ratingAvg,
        authorId: fork.authorId
          ? (userIdMap.get(fork.authorId) ?? null)
          : null,
        parentTheoryId: fork.parentTheoryId
          ? (theoryIdMap.get(fork.parentTheoryId) ?? null)
          : null,
      })
      .returning({ id: schema.theories.id });
    theoryIdMap.set(fork.id, inserted.id);
  }

  console.log("[seed] inserting theory objects...");
  const objectIdMap = new Map<string, string>();
  for (const obj of mockTheoryObjects) {
    const [inserted] = await db
      .insert(schema.theoryObjects)
      .values({
        theoryId: theoryIdMap.get(obj.theoryId)!,
        kind: obj.kind,
        name: obj.name,
        slug: obj.slug,
        description: obj.description,
        metadata: obj.metadata ?? null,
        language: obj.language,
      })
      .returning({ id: schema.theoryObjects.id });
    objectIdMap.set(obj.id, inserted.id);
  }

  console.log("[seed] inserting citations...");
  for (const cit of mockCitations) {
    await db.insert(schema.citations).values({
      theoryObjectId: objectIdMap.get(cit.theoryObjectId)!,
      authorName: cit.authorName,
      sourceTitle: cit.sourceTitle ?? null,
      quoteText: cit.quoteText,
      pageRef: cit.pageRef ?? null,
      language: cit.language,
    });
  }

  console.log("[seed] inserting entities...");
  const entityIdMap = new Map<string, string>();
  for (const e of mockEntities) {
    const [inserted] = await db
      .insert(schema.entities)
      .values({
        kind: e.kind,
        title: e.title,
        slug: e.slug,
        descriptionWiki: e.descriptionWiki,
        language: e.language,
        createdBy: e.createdBy
          ? (userIdMap.get(e.createdBy) ?? null)
          : null,
      })
      .returning({ id: schema.entities.id });
    entityIdMap.set(e.id, inserted.id);
  }

  console.log("[seed] inserting interpretations + comments...");
  for (const i of mockInterpretations) {
    const [inserted] = await db
      .insert(schema.interpretations)
      .values({
        entityId: entityIdMap.get(i.entityId)!,
        theoryId: theoryIdMap.get(i.theoryId)!,
        theoryObjectId: objectIdMap.get(i.theoryObjectId)!,
        authorId: userIdMap.get(i.authorId) ?? null,
        body: i.body,
        language: i.language,
        votesUp: i.votesUp,
        votesDown: i.votesDown,
        score: i.score,
      })
      .returning({ id: schema.interpretations.id });

    for (const c of i.comments) {
      await db.insert(schema.comments).values({
        interpretationId: inserted.id,
        authorId: userIdMap.get(c.authorId) ?? null,
        body: c.body,
        stance: c.stance,
        votesUp: c.votesUp,
        votesDown: c.votesDown,
      });
    }
  }

  console.log("[seed] done");
  await client.end({ timeout: 5 });
}

const isMain =
  process.argv[1] &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (isMain) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[seed] failed:", err);
      process.exit(1);
    });
}
