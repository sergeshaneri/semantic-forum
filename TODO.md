# TODO — Pending Features

Status as of round 13 (post-batch covering DMs, Polls, Groups, Annotations, API keys, Onboarding, Welcome email, URL import, Mobile nav, MCP server, OG images, Indexes, Rate limit, Tests).

Most of the original TODO has shipped. What's left is split between **infrastructure hardening** that compounds over time and **net-new features** that need product judgment.

---

## Infra hardening (recommended next)

### Rate limit → Redis
Currently in-memory in `lib/rate-limit.ts`. Single Railway instance is fine. The day we go multi-instance, swap for `@upstash/ratelimit` or a small Redis. Same interface, ~20 LOC change.

### Error tracking
No Sentry / OpenTelemetry currently. When a real user hits a 500 we have no idea. Wire Sentry SDK with `dsn` env var, sample 100% of errors for now. ~1 hour.

### Database backups verification
Railway has automatic backups, but we never tested restore. One-time: snapshot → restore to a fresh DB → run smoke test.

### Move seed data to JSON
`scripts/seed.ts` and `scripts/expand-seed.ts` hardcode TS literals. Move to `seed/classical-model-a.json` + `seed/generations.json` for easier community contribution. Pure refactor.

### Prepared statements for hot paths
`vote.cast`, `notification.unreadCount`, `user.checklistProgress` run on every action. Drizzle supports `.prepare()`. Measurable latency win once traffic grows.

### Postgres full-text search
`search.global` uses ILIKE which can't use indexes for `%term%`. Switch to `tsvector` / `tsquery` with a generated column or trigger. Big win for search relevance + speed.

### Group post comments → notifications
Currently group post comments don't trigger notifications. Mirror the interpretation-comment logic (notify post author + @mentions).

### Double-load on group post page
`/groups/[slug]/posts/[postSlug]` fetches the group twice (once via `getPost`, once via `getBySlug` for `isMember`). Merge into one query.

---

## Net-new features (need user input on priority)

### Spam / abuse reporting + moderation queue
New `reports` table (reporter, target type+id, reason, status). Report button on interpretations / comments / posts / DMs. Admin queue at `/admin/reports`. Requires deciding who's "admin" — owner flag, role-based, or just the first user.

### Reactions (emoji on comments / posts)
Like Discord/Slack. New `reactions` table (target type+id, emoji, userId). UI: emoji picker on hover. Lower friction than a full vote, faster signal.

### SSE / WebSocket for realtime
DMs and notifications poll every 30s. SSE through Next.js Route Handlers (`/api/sse`) would push instantly. Pusher / Ably as managed alternative.

### Translate between ru/en
Button on interpretation / publication: "Translate to EN". Uses DeepL or OpenAI under the hood. Stored as a separate row linked by `originalId` — same pattern as theory forks.

### Premium tier
Plan mentioned this for advanced typologies (Психософия, Темпористика) and AI features. Needs payment gateway choice (Stripe? Robokassa? LemonSqueezy?). Big project.

### TypingPoll — specialized poll for "what's this person's TIM"
Pre-fills the 16 TIMs as options. Aggregates results in profile of the person being typed. Could be a v2 of polls or a separate table.

### Activity feed beyond follows
Currently `/[lang]` shows follow-only feed. Add "trending" mixed-feed: high-vote interpretations from anyone in last 24h, regardless of follow. Reddit-style frontpage.

### Annotation v2: margin markers
Current annotations are listed below body. Show them as colored markers in the right margin, click to scroll to fragment, like Genius / Hypothesis.

### Telegram OAuth login
Original plan deferred to v2. Telegram login widget — community-supported Auth.js provider exists, ~half-day integration.

### Mobile app via Expo
`tRPC` API is ready — would just be a React Native shell over the same router. Big undertaking.

---

## Polish + tech debt

- **Profile customization**: cover image, theme accent color, gradient
- **Better empty states** — most "empty" sections just say "пока нет". Could illustrate
- **Email verification flow** — currently any email lands as a valid account
- **Password reset** — no flow currently. Once Resend is wired, add `forgot-password` page
- **Account deletion** — GDPR requires this be possible
- **Export my data** — JSON dump of everything the user authored
- **PWA manifest** — installable as app, offline read of bookmarks
- **Image upload** — currently profile image is URL only. Add R2/Cloudinary upload
- **Markdown editor with preview** — replace bare textareas. `@uiw/react-md-editor` or roll our own with `<Markdown>` preview pane
- **Dark mode visual audit** — was added quickly, some places look off
- **Mobile UX audit on real devices** — hamburger works, but exact spacing / tap targets need eyes

---

## Open decisions

1. **Avatars storage:** URL field for now. R2 / Cloudinary / Railway Volume when scaling
2. **AI features:** auto-detect fallacies in arguments? Cite-suggestion? Out of scope until traction
3. **Moderation roles:** "curator" / "admin" badges? Currently only authors can edit
4. **Pricing model:** if premium tier ships, what's the line between free and paid?
5. **Mobile native:** Expo is the technical answer, but is there demand?
