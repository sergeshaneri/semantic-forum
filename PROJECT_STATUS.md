# Socionics Semantics Platform — Status Snapshot

## Live URLs

- **Prod:** https://semantic-forum-production.up.railway.app/ru
- **Repo:** https://github.com/sergeshaneri/semantic-forum
- **Hosting:** Railway (web + Postgres add-on, auto-deploys from `main`)
- **Path:** `C:\Serge\Socionics Semantics Forum`

## Tech Stack (locked-in)

- **Framework:** Next.js 16 (App Router, RSC) — *NOT the Next.js you know, read `node_modules/next/dist/docs/`*
- **API:** tRPC v11 (single source of truth for web + future Expo mobile)
- **DB:** Postgres on Railway
- **ORM:** Drizzle (migrations in `server/db/migrations/`, generate via `npm run db:generate`)
- **Auth:** Auth.js v5 (NextAuth) — Credentials (bcrypt) + optional Google OAuth. JWT sessions
- **Styling:** Tailwind CSS v4 + shadcn/ui + react-markdown + remark-gfm
- **i18n:** `language` column on every content row; `/[lang]/...` routing with `ru | en`

## Key Files / Patterns

- **Routers:** `server/trpc/routers/*` — every feature has its own
- **Schema:** `server/db/schema.ts` (single big file, ~600 lines)
- **Migrations:** `server/db/migrations/0000..0006*.sql` — Drizzle-generated
- **Bootstrap:** `scripts/bootstrap.ts` runs on every Railway deploy:
  1. `runMigrations()` — applies pending SQL
  2. `runSeed()` — inserts mock entities/users/interpretations if DB empty
  3. `runExpandSeed()` — upserts canonical "Классическая Модель А" (89 TheoryObjects) + "Теория поколений (Чурюмов-Шанэри)" fork
- **i18n dict:** `lib/i18n/dictionaries.ts` — single typed Dictionary with `ru` + `en`. **NO function fields** (RSC serialization). Plural formatters live in `lib/i18n/formatters.ts`
- **Citations:** `lib/citations.ts` — `expandCitations(body, lang)` resolves `[[Title]]` and `[[Title|alias]]` to entity/theory links. Called from routers before sending bodies to clients
- **Mentions:** `lib/mentions.ts` — `extractMentions(body)` → array of usernames. Used by comment/interpretation/answer create mutations to create notifications
- **Badges:** `lib/badges.ts` — pure-function badge derivation from user stats
- **Slug:** `lib/slug.ts` — Cyrillic transliteration

## DB Tables (24 total + Auth.js)

| Domain | Tables |
|--------|--------|
| Auth | users, accounts, sessions, verification_tokens |
| Content | theories, theory_objects, citations, entities, entity_relations, interpretations, comments |
| Social | votes, follows, bookmarks, notifications, user_links, user_schools, user_influences |
| Knowledge | schools, sources, school_sources, publications, publication_tags, publication_references |
| Commerce | products, product_reviews |
| Curation | tags, entity_tags, collections, collection_items |
| Q&A | questions, answers |
| Events | events, event_attendees |

## tRPC Routers (registered in `server/trpc/root.ts`)

```
health, auth, user, userLink, affiliation,
entity, entityRelation, theory, theoryObject,
interpretation, comment, publication, product,
vote, notification, bookmark, search,
school, source, trending, leaderboard,
collection, question, answer, event
```

## Pages (App Router)

```
/[lang]                                  — home (hero + trending + popular entities + theories + feed)
/[lang]/entities                         — list + add form
/[lang]/entities/[slug]                  — detail with interpretations, voting, comments, relations, MaterialEmbed for kind=material
/[lang]/theories                         — list + create
/[lang]/theories/[slug]                  — detail with kind-filter tabs, add object, fork
/[lang]/theories/[slug]/objects/[objSlug] — wiki page with citations + edit for owner
/[lang]/schools                          — list + create
/[lang]/schools/[slug]                   — description + literature + members
/[lang]/questions                        — Q&A list + ask
/[lang]/questions/[slug]                 — question + answers + accept
/[lang]/events                           — upcoming list + create
/[lang]/events/[slug]                    — detail + RSVP buttons
/[lang]/leaderboard                      — top by karma (week/month/all)
/[lang]/collections                      — my collections + create
/[lang]/u/[username]                     — profile (roles/links/schools/influences/badges/karma/feed sections)
/[lang]/u/[username]/p/[slug]            — publication (article or video)
/[lang]/u/[username]/products/[id]       — product + reviews
/[lang]/u/[username]/collections/[slug]  — public collection view
/[lang]/search?q=X                       — global search
/[lang]/notifications                    — full list
/[lang]/bookmarks                        — saved items
/[lang]/login, /[lang]/register          — auth forms
/api/trpc/[trpc], /api/auth/[...nextauth]
```

## What's Working on Prod

**Core sandbox:**
- Auth (email/password, optional Google), profile with roles + bio + image + links + schools + influences + mentor flags
- Entities (word / person / **material with iframe embed**) — CRUD with author-only edit/delete
- Theories — create / fork (copies all 89 objects) / edit / delete (author-only, seeds locked)
- TheoryObjects — CRUD by theory author with kind tabs (87 in Classical, 10 in Generations)
- Interpretations — CRUD, theory-filter dropdown, **markdown bodies** with `[[citations]]` resolved server-side
- Comments — CRUD with Pro/Contra/Neutral stance, voting
- Voting — interpretations / comments / answers, optimistic UI
- Entity-relations — 9 typed + custom, with directional flip (part_of ↔ contains)

**Knowledge layer:**
- Schools with founder/year/place/website + literature list (book/article/paper/video/podcast/website/other) + member chips
- User affiliations: schools (multiselect), influences (platform users OR external names like Augusta), mentor flags

**Social:**
- @mentions trigger notifications in interpretations, comments, answers
- Follow/unfollow with notification, FollowFeed widget on home
- Notifications bell with unread badge, /notifications list page
- Bookmarks (polymorphic across 6 types), /bookmarks list
- Collections — create + view + add items via router (UI for "Add to collection" from any resource → still TODO)
- Leaderboard /leaderboard with week/month/all-time karma
- Auto-derived badges on profile (Author × 10, Theorist, Expert, etc.)
- Global search across entities/theories/publications/users
- Trending widget on home — top-5 interpretations of last 7 days

**Author tools:**
- Publications (article + video with YouTube embed) with tags + cross-references
- Products (course/consultation/book/typing/workshop/other) with price + currency
- Product reviews (1-5 stars + body, one per author per product)

**Q&A:**
- Questions with markdown body + slug
- Answers with voting, accept-as-solution (only by question author), resolves question

**Events:**
- Online/offline/hybrid with datetime, location, link
- RSVP going/maybe/interested with counts and attendee chips

**Citations system:**
- `[[Entity title]]` and `[[Entity|alias]]` auto-link in interpretation/publication/question/answer bodies
- Falls back to theory matches, misses left as plain text

## Seeded Demo Data

Run automatically by `scripts/expand-seed.ts` on each deploy (idempotent upsert):

- **Classical Model A** (sid, ru): 8 aspects, 8 function positions, 16 TIMs (with MBTI + quadra metadata), 14 intertype relations (incl. 4 directed), 15 Reinin dichotomies (4 Jung + 11 Reinin), 4 quadras, 4 clubs, 4 temperaments, 7 aspect dichotomies, 7 function dichotomies = **89 TheoryObjects**
- **Theory of Generations (Чурюмов-Шанэри)** (fork of Classical): 4 fractal levels (Дуон/Метабон/Аспектон/Социон), 2 meta-dichotomies (Generation, Meta-verticality), 4 inheritance laws = **10 custom objects**
- 4 mock users (`ivan_methodologist`, `anna_sociotyper`, `alex_skeptic`, `maria_classics`)
- 5 entities, 7 interpretations, 5 citations

## Common Commands

```bash
npm run dev               # next dev
npm run build             # next build (verifies typecheck + bundle)
npm run typecheck         # tsc --noEmit (NO Edit before this passes)
npm run db:generate       # generate migration from schema diff (needs DATABASE_URL stub)
npm run db:seed           # seed mock data into DB (idempotent)
npm run db:expand         # apply canonical Classical Model A expansion
npm run db:bootstrap      # full bootstrap (migrate + seed + expand)
git push                  # Railway auto-deploys from main
```

## Bootstrap Flow on Railway Deploy

```
nixpacks → npm ci → npm run build → npm start
                                       ↓
                              tsx scripts/bootstrap.ts
                                       ↓
                              runMigrations() → runSeed() → runExpandSeed()
                                       ↓
                                 next start
```

Bootstrap is **non-fatal** — if any step fails, logs error and continues to `next start`. Schema mutations are upsert / idempotent.

## Env Vars (Railway)

- `DATABASE_URL` — Postgres, set automatically by Railway add-on
- `AUTH_SECRET` — JWT signing key (set once, generated via `npx auth secret`)
- `AUTH_URL` — Full public URL (https://semantic-forum-production.up.railway.app)
- `NEXT_PUBLIC_APP_URL` — same as AUTH_URL
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — *optional*, only enables Google provider when both set

## Known Constraints

- **Dictionary cannot contain functions** — RSC serialization fails. Use `lib/i18n/formatters.ts` for plural rules
- **TypeScript narrowing:** `protectedProcedure` injects `ctx.userId: string` (narrowed). Don't use `ctx.session.user.id` (it's `string | undefined`)
- **Zod v4:** `z.enum(...)` returns `_def.values` differently — use `as const` arrays for value extraction
- **Citation expansion happens server-side in routers** — touched: entity.getBySlug, publication.getBySlug, question.getBySlug. Add to new routers if they render markdown bodies
- **Next 16 search params are async** — `searchParams: Promise<{...}>` and `await searchParams`
- **Markdown rendering:** import `Markdown` from `@/components/socionics/markdown` — wraps `react-markdown` with our prose styles
- **Single auth() per request** — `auth()` is called in `[lang]/layout.tsx`. If you call it again in a page, it's fine for JWT strategy but historically caused crashes on prod. Prefer reading session from layout via context if possible (we have `SessionProvider` in `lib/auth/session-context.tsx`)
