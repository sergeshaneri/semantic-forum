<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project quick-ref

This is the **Socionics Semantics Platform** — a Next.js 16 + tRPC v11 + Drizzle + Auth.js v5 app deployed on Railway.

Before touching anything, read in order:

1. **`PROJECT_STATUS.md`** — full snapshot of what's been built, schema, routers, pages, env vars, gotchas
2. **`TODO.md`** — pending features with design notes; pick from here
3. **`server/db/schema.ts`** — the canonical schema (~40 tables). Use Drizzle relations, not raw FKs
4. **`server/trpc/root.ts`** — all routers wired together

## Critical conventions (don't break these)

- **No functions in `lib/i18n/dictionaries.ts`** — RSC payload can't serialize them. Plural rules go in `lib/i18n/formatters.ts`
- **`protectedProcedure` gives you `ctx.userId: string`** — don't reach into `ctx.session.user.id` (it's `string | undefined`). It also accepts Bearer API keys, so session may be null even when userId is set
- **`sessionOnlyProcedure`** for endpoints that must reject API keys (managing keys themselves, account settings)
- **Mutations are rate-limited** via `lib/rate-limit.ts` (60/min session, 30/min API key). If you need to bypass, use `publicProcedure` and handle limits inline
- **Run `npm run typecheck` before pushing**. CI happens on Railway after push, but typecheck catches everything earlier
- **Markdown bodies render via `<Markdown>` from `@/components/socionics/markdown`** — citations (`[[Title]]`, `[[#object-slug]]`, `[[@username]]`) are expanded server-side in routers (`expandCitations` from `lib/citations.ts`). Don't render raw user input
- **`auth()` is called in `[lang]/layout.tsx`** for the header. Pages that need session can `await auth()` again — safe with JWT strategy
- **Slug pattern:** `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Use `slugify()` from `lib/slug.ts` for Cyrillic input
- **Migrations are auto-applied on every deploy** via `scripts/bootstrap.ts` (non-fatal — failures log and continue). Schema mutations are upsert / idempotent
- **`ConfirmDialog`** instead of `window.confirm()` for destructive actions. From `@/components/ui/confirm-dialog`
- **`HintTooltip`** for "?" hints. Hints live in `dict.hints.*`

## Adding a new mutation

1. Add Zod schema + handler in the relevant router under `server/trpc/routers/`
2. Use `protectedProcedure` (auto rate-limit + session OR API-key auth)
3. Don't forget Russian + English copy in `lib/i18n/dictionaries.ts` if it surfaces UI
4. If it changes data model, run `DATABASE_URL=... npm run db:generate` and commit the new SQL

## Common commands

```bash
npm run dev               # next dev
npm run typecheck         # MUST pass before push
npm run build             # full build + type check
npm run db:generate       # creates new SQL migration from schema diff (needs DATABASE_URL stub)
git push origin main      # Railway auto-deploys
```

## Live

- Prod: https://semantic-forum-production.up.railway.app
- Repo: https://github.com/sergeshaneri/semantic-forum
- HTTP API for agents: https://semantic-forum-production.up.railway.app/ru/docs/api
- MCP server (in repo): `mcp/` — separate npm package for AI-agent integration

## Env vars (required for full functionality)

| Var | Purpose | Required |
|-----|---------|----------|
| `DATABASE_URL` | Postgres | Yes (set automatically by Railway) |
| `AUTH_SECRET` | JWT signing | Yes |
| `AUTH_URL` / `NEXT_PUBLIC_APP_URL` | Public URL | Yes |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth | Optional |
| `RESEND_API_KEY` / `EMAIL_FROM` | Welcome emails | Optional |
