<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project quick-ref

This is the **Socionics Semantics Platform** — a Next.js 16 + tRPC + Drizzle + Auth.js app deployed on Railway.

Before touching anything, read in order:

1. **`PROJECT_STATUS.md`** — full snapshot of what's been built, schema, routers, pages, env vars, gotchas
2. **`TODO.md`** — pending features with design notes; pick from here
3. **`server/db/schema.ts`** — the canonical schema. 24+ tables. Use Drizzle relations, not raw FKs
4. **`server/trpc/root.ts`** — all routers wired together

## Critical conventions (don't break these)

- **No functions in `lib/i18n/dictionaries.ts`** — RSC payload can't serialize them. Plural rules go in `lib/i18n/formatters.ts`
- **`protectedProcedure` gives you `ctx.userId: string`** — don't reach into `ctx.session.user.id` (it's `string | undefined`)
- **Run `npm run typecheck` before pushing**. CI happens on Railway after push, but typecheck catches everything earlier
- **Markdown bodies render via `<Markdown>` from `@/components/socionics/markdown`** — citations are expanded server-side in routers (`expandCitations` from `lib/citations.ts`). Don't render raw user input
- **`auth()` is called in `[lang]/layout.tsx`** for the header. Pages that need session can `await auth()` again — it's safe with JWT strategy
- **Slug pattern:** `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Use `slugify()` from `lib/slug.ts` for Cyrillic input
- **Migrations are auto-applied on every deploy** via `scripts/bootstrap.ts` (non-fatal — failures log and continue)

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
