# Socionics Semantics Platform — Status Snapshot

## Live URLs

- **Prod:** https://semantic-forum-production.up.railway.app/ru
- **Repo:** https://github.com/sergeshaneri/semantic-forum
- **Hosting:** Railway (web + Postgres add-on, auto-deploys from `main`)
- **Path:** `C:\Serge\Socionics Semantics Forum`

## Tech Stack (locked-in)

- **Framework:** Next.js 16 (App Router, RSC) — *NOT the Next.js you know, read `node_modules/next/dist/docs/`*
- **API:** tRPC v11 (single source of truth for web + AI agents via Bearer auth, and future Expo mobile)
- **DB:** Postgres on Railway (~40 tables, 14 migrations)
- **ORM:** Drizzle (migrations in `server/db/migrations/`, generate via `npm run db:generate`)
- **Auth:** Auth.js v5 (NextAuth) — Credentials (bcrypt) + optional Google. JWT sessions. **Bearer API keys** alongside session for non-browser clients
- **Email:** Resend (welcome on registration, optional)
- **Styling:** Tailwind CSS v4 + shadcn/ui + react-markdown + remark-gfm
- **i18n:** `language` column on every content row; `/[lang]/...` routing with `ru | en`
- **Dark mode:** localStorage flag, FOUC-free via head script

## Key files / patterns

- **Routers:** `server/trpc/routers/*` — every feature has its own (~31 routers)
- **Schema:** `server/db/schema.ts` (one big file)
- **Migrations:** `server/db/migrations/0000..0014*.sql` — Drizzle-generated
- **Bootstrap:** `scripts/bootstrap.ts` runs on every Railway deploy:
  1. `runMigrations()` — applies pending SQL
  2. `runSeed()` — inserts mock entities/users/interpretations if DB empty
  3. `runExpandSeed()` — upserts canonical "Классическая Модель А" (89 TheoryObjects) + "Теория поколений (Чурюмов-Шанэри)" fork
- **i18n dict:** `lib/i18n/dictionaries.ts` — single typed `Dictionary` with `ru` + `en`. **NO function fields** (RSC serialization). Plural formatters live in `lib/i18n/formatters.ts`
- **Citations:** `lib/citations.ts` — `expandCitations(body, lang)` resolves `[[Title]]`, `[[#object-slug]]`, `[[@username]]` to entity / theory object / user profile links. Called from routers before sending bodies to clients
- **Mentions:** `lib/mentions.ts` — `extractMentions(body)` → usernames; used by comment/interpretation/answer create mutations to create notifications
- **Badges:** `lib/badges.ts` — pure-function badge derivation from user stats
- **Slug:** `lib/slug.ts` — Cyrillic transliteration
- **API keys:** `lib/api-key.ts` — generate (32-byte hex with `ssk_` prefix), sha256 hash storage, scope check
- **Rate limit:** `lib/rate-limit.ts` — in-memory token bucket per identity (session/API key/IP). Wired into `protectedProcedure`. Single-instance only; swap for Redis when scaling
- **Diff:** `lib/diff.ts` — line-level LCS diff for revision history
- **URL import:** `lib/import-url.ts` — Substack / Telegram / generic OG-meta parser, no cheerio dep
- **Email:** `lib/email.ts` — Resend wrapper, bilingual welcome template, never blocks on failure

## DB tables (~40)

| Domain | Tables |
|--------|--------|
| Auth | users (+ onboarding/checklist/welcome flags), accounts, sessions, verification_tokens |
| Auth API | api_keys (Bearer for CLIs / agents, scoped) |
| Content | theories, theory_objects, citations, entities, entity_relations, interpretations, interpretation_revisions, interpretation_coauthors, comments, annotations |
| Social | votes, follows, bookmarks, notifications, conversations, conversation_participants, messages |
| Profile | user_links, user_schools, user_influences |
| Knowledge | schools, sources, school_sources, publications, publication_revisions, publication_coauthors, publication_tags, publication_references |
| Commerce | products, product_reviews |
| Curation | tags, entity_tags, collections, collection_items |
| Q&A | questions, answers |
| Events | events, event_attendees |
| Polls | polls, poll_votes |
| Groups | groups, group_members, group_posts, group_post_comments |

## tRPC routers (registered in `server/trpc/root.ts`)

```
health, auth, user, userLink, affiliation, apiKey, import,
entity, entityRelation, theory, theoryObject, annotation, tag,
interpretation, comment, publication, product,
vote, notification, bookmark, search, dm,
school, source, trending, leaderboard,
collection, question, answer, event, poll, group, stats
```

## Pages (App Router)

```
/[lang]                                  — home (hero + trending + popular entities + theories + feed)
/[lang]/entities                         — list + add
/[lang]/entities/[slug]                  — detail (+ Annotations + EntityRelations)
/[lang]/theories                         — list + create
/[lang]/theories/[slug]                  — detail with kind-filter tabs, add object, fork
/[lang]/theories/[slug]/objects/[objSlug] — wiki page with citations + edit
/[lang]/schools                          — list + create
/[lang]/schools/[slug]                   — description + literature + members
/[lang]/questions                        — Q&A list + ask
/[lang]/questions/[slug]                 — question + answers + accept
/[lang]/events                           — upcoming list + create
/[lang]/events/[slug]                    — detail + RSVP
/[lang]/polls                            — list + create
/[lang]/polls/[slug]                     — poll voter with bar visualization
/[lang]/groups                           — list + create
/[lang]/groups/[slug]                    — group home + posts + members + join/leave
/[lang]/groups/[slug]/posts/[postSlug]   — post with VoteWidget + comments
/[lang]/messages                         — DM thread list
/[lang]/messages/[conversationId]        — DM thread with 30s polling
/[lang]/mentors                          — Available / Seeking tabs
/[lang]/leaderboard                      — top by karma (week/month/all)
/[lang]/collections                      — my collections + create
/[lang]/stats                            — public dashboard (totals + weekly)
/[lang]/tags/[slug]                      — tag aggregation (entities + publications)
/[lang]/u/[username]                     — profile (roles/links/schools/influences/badges/karma/feed sections)
/[lang]/u/[username]/p/[slug]            — publication (article or video + revisions + coauthors + refs)
/[lang]/u/[username]/products/[id]       — product + reviews
/[lang]/u/[username]/collections/[slug]  — public collection view
/[lang]/search?q=X                       — global search (8 result types)
/[lang]/notifications                    — full list
/[lang]/bookmarks                        — saved items
/[lang]/login, /[lang]/register          — auth forms
/[lang]/settings/api-keys                — API key management (session-only)
/[lang]/docs/api                         — public docs with curl examples
/embed/[type]/[id]                       — shareable cards for iframe (entity/theory/school/poll)
/api/trpc/[trpc], /api/auth/[...nextauth]
/sitemap.xml, /robots.txt                — SEO (dynamic, per-locale)
```

## What's working in prod

**Core sandbox:**
- Auth (email/password, optional Google), profile with roles + bio + image + links + schools + influences + mentor flags
- Entities (word / person / material with iframe embed: YouTube/Vimeo/Spotify/SoundCloud/Yandex Music/direct audio) — CRUD with author-only edit/delete
- Theories — create / fork / edit / delete (author-only, seeds locked)
- TheoryObjects — CRUD by theory author
- Interpretations — CRUD + revisions + co-authors + markdown bodies with `[[citations]]` resolved server-side
- Comments — CRUD with Pro/Contra/Neutral, voting, **3-level threading via parent_comment_id**
- Voting — interpretations / comments / answers / group_posts, optimistic UI
- Entity-relations — 9 typed + custom, directional flip
- **Annotations** — Genius-style: highlight fragment → attach note, server-side offsets, "Find in text" via URL fragment

**Knowledge layer:**
- Schools with founder/year/place/website + literature list + member chips
- User affiliations: schools (multiselect), influences (platform users OR external names)

**Social:**
- @mentions trigger notifications in interpretations, comments, answers
- Follow/unfollow with notification, FollowFeed widget on home
- Notifications bell with unread badge, /notifications list
- Bookmarks (polymorphic), /bookmarks list
- Collections — create + view + add items via `<AddToCollectionMenu>`
- Direct messages (1-on-1) with 30s polling + unread counts
- Groups (Reddit-style) with posts, comments, voting, ownership / join-leave
- Polls with optimistic voting, bar visualization, optional close date
- Q&A with accepted-answer flag
- Events with RSVP (going/maybe/interested)

**Discovery:**
- Global search across entities/theories/publications/users/questions/polls/public groups/group posts
- Trending widget on home (top-5 last 7 days)
- Leaderboard week/month/all
- Mentors page with Available/Seeking tabs
- Stats public dashboard
- Tag pages

**Author tools:**
- Publications (article + video with YouTube embed) with tags + cross-references + revisions + co-authors
- **URL import** — Substack / Telegram / generic OG-meta into a draft publication
- Products with price + currency
- Product reviews
- **Embed widget** at `/embed/[type]/[id]` for iframing on third-party sites (entity/theory/school/poll)

**Citations system (`[[X]]` syntax):**
- `[[Title]]` → entity (fallback to theory)
- `[[Title|alias]]` → with custom display text
- `[[#object-slug]]` → theory object
- `[[@username]]` → user profile

**Onboarding:**
- 8-step `<OnboardingTour>` modal (welcome / content / interpretations / social / author tools / Q&A / advanced / final), keyboard nav, dismissable
- Floating `<ProgressChecklist>` with 6 auto-detected steps (profile, first interpretation, comment, vote, follow, authored)
- `<HintTooltip>` "?" icons on stance / karma / slug / citations / theory-required / interpretation-body
- Welcome email via Resend (bilingual, opt-in by setting `RESEND_API_KEY`)

**Mobile:**
- `<MobileNav>` hamburger with full-screen panel (primary / more / session sections), closes on route change + ESC
- Header trimmed below `sm`: search hidden, message + bookmark icons hidden, register pill only

**SEO / sharing:**
- Sitemap dynamic (per-locale + all public content)
- robots.txt disallows API / DMs / bookmarks / notifications
- Embed widget with `frame-ancestors *` CSP

**API / automation:**
- API keys (`ssk_<64-hex>`) with scopes (read / write:content / write:social / admin)
- 60/min session, 30/min API key, 5 registrations/hour per IP rate limits (in-memory)
- `/docs/api` with curl examples for entity / interpretation / publication / theory.list / search
- `apiKey` router (session-only): mine / create / revoke / delete, capped at 20 active

**Performance:**
- 21 DB indexes on hot paths (votes lookups, notification unread, interpretation by entity/theory/author, comments by interpretation, messages by conversation+time, group posts by group, etc.)

## Seeded demo data

Run automatically by `scripts/expand-seed.ts` on each deploy (idempotent upsert):

- **Classical Model A** (sid, ru): 8 aspects, 8 function positions, 16 TIMs (with MBTI + quadra metadata), 14 intertype relations, 15 Reinin dichotomies, 4 quadras, 4 clubs, 4 temperaments, 7 aspect dichotomies, 7 function dichotomies = **89 TheoryObjects**
- **Theory of Generations (Чурюмов-Шанэри)** (fork of Classical): 4 fractal levels (Дуон/Метабон/Аспектон/Социон), 2 meta-dichotomies (Generation, Meta-verticality), 4 inheritance laws = **10 custom objects**
- 4 mock users, 5 entities, 7 interpretations, 5 citations

## Common commands

```bash
npm run dev               # next dev
npm run build             # next build (verifies typecheck + bundle)
npm run typecheck         # tsc --noEmit (MUST pass before push)
npm run db:generate       # generate migration from schema diff (needs DATABASE_URL stub)
npm run db:seed           # seed mock data into DB (idempotent)
npm run db:expand         # apply canonical Classical Model A expansion
npm run db:bootstrap      # full bootstrap (migrate + seed + expand)
git push                  # Railway auto-deploys from main
```

## Bootstrap flow on Railway deploy

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

## Env vars (Railway)

- `DATABASE_URL` — Postgres, set automatically by Railway add-on
- `AUTH_SECRET` — JWT signing key (set once, generated via `npx auth secret`)
- `AUTH_URL` — Full public URL (https://semantic-forum-production.up.railway.app)
- `NEXT_PUBLIC_APP_URL` — same as AUTH_URL
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — *optional*, only enables Google when both set
- `RESEND_API_KEY` — *optional*, enables welcome emails
- `EMAIL_FROM` — *optional*, e.g. `Socionics Semantics <noreply@yourdomain>`

## Known constraints

- **Dictionary cannot contain functions** — RSC serialization fails. Use `lib/i18n/formatters.ts` for plural rules
- **TypeScript narrowing:** `protectedProcedure` injects `ctx.userId: string` (narrowed). Don't use `ctx.session.user.id` (it's `string | undefined`). It accepts EITHER session OR Bearer API key
- **`sessionOnlyProcedure`** for sensitive ops (managing keys, account settings) — refuses API-key auth
- **Zod v4:** `z.enum(...)` uses `as const` arrays for value extraction
- **Citation expansion is server-side in routers** — entity.getBySlug, publication.getBySlug, question.getBySlug, interpretation feed, etc. Add to new routers if they render markdown bodies
- **Next 16 search params are async** — `searchParams: Promise<{...}>` and `await searchParams`
- **Single auth() per request** — `auth()` is called in `[lang]/layout.tsx`. Calling again in pages is safe with JWT
- **Rate limit is in-memory** — works per Railway instance. When horizontal-scaling, move `lib/rate-limit.ts` to Redis (e.g. `@upstash/ratelimit`)
- **In-memory state survives only while the Node process lives** — Railway restarts (deploys, OOM) reset counters. For now this is acceptable
