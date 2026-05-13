import type { MetadataRoute } from "next";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.AUTH_URL ??
  "https://semantic-forum-production.up.railway.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Static roots per locale
  for (const lang of ["ru", "en"] as const) {
    const roots = [
      "",
      "/entities",
      "/theories",
      "/schools",
      "/questions",
      "/events",
      "/polls",
      "/groups",
      "/mentors",
      "/leaderboard",
      "/stats",
    ];
    for (const path of roots) {
      entries.push({
        url: `${BASE_URL}/${lang}${path}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: path === "" ? 1.0 : 0.7,
      });
    }
  }

  // Dynamic content — keep queries cheap, limit per type
  try {
    const ents = await db.query.entities.findMany({
      columns: { slug: true, language: true, createdAt: true },
      limit: 2000,
    });
    for (const e of ents) {
      entries.push({
        url: `${BASE_URL}/${e.language}/entities/${e.slug}`,
        lastModified: e.createdAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // skip on db error
  }

  try {
    const theories = await db.query.theories.findMany({
      columns: { slug: true, language: true, createdAt: true },
      limit: 500,
    });
    for (const t of theories) {
      entries.push({
        url: `${BASE_URL}/${t.language}/theories/${t.slug}`,
        lastModified: t.createdAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // skip
  }

  try {
    const schools = await db.query.schools.findMany({
      columns: { slug: true, language: true, createdAt: true },
      limit: 500,
    });
    for (const s of schools) {
      entries.push({
        url: `${BASE_URL}/${s.language}/schools/${s.slug}`,
        lastModified: s.createdAt,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    // skip
  }

  try {
    const pubs = await db.query.publications.findMany({
      columns: { slug: true, language: true, createdAt: true, authorId: true },
      with: { author: { columns: { username: true } } },
      limit: 2000,
    });
    for (const p of pubs) {
      const username = p.author?.username;
      if (!username) continue;
      entries.push({
        url: `${BASE_URL}/${p.language}/u/${username}/p/${p.slug}`,
        lastModified: p.createdAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // skip
  }

  try {
    const questions = await db.query.questions.findMany({
      columns: { slug: true, language: true, createdAt: true },
      limit: 1000,
    });
    for (const q of questions) {
      entries.push({
        url: `${BASE_URL}/${q.language}/questions/${q.slug}`,
        lastModified: q.createdAt,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  } catch {
    // skip
  }

  try {
    const polls = await db.query.polls.findMany({
      columns: { slug: true, language: true, createdAt: true },
      limit: 500,
    });
    for (const p of polls) {
      entries.push({
        url: `${BASE_URL}/${p.language}/polls/${p.slug}`,
        lastModified: p.createdAt,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  } catch {
    // skip
  }

  try {
    const groups = await db.query.groups.findMany({
      columns: { slug: true, language: true, createdAt: true, isPrivate: true },
      limit: 500,
    });
    for (const g of groups) {
      if (g.isPrivate) continue;
      entries.push({
        url: `${BASE_URL}/${g.language}/groups/${g.slug}`,
        lastModified: g.createdAt,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  } catch {
    // skip
  }

  try {
    const users = await db.query.users.findMany({
      columns: { username: true, createdAt: true },
      limit: 5000,
    });
    for (const u of users) {
      if (!u.username) continue;
      entries.push({
        url: `${BASE_URL}/ru/u/${u.username}`,
        lastModified: u.createdAt,
        changeFrequency: "weekly",
        priority: 0.4,
      });
    }
  } catch {
    // skip
  }

  return entries;
}
