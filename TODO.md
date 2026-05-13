# TODO — Pending Features

Status as of round 7. Features are bundled in suggested rounds. Each item has a design hint so future-me / future-Claude can start coding without re-thinking.

## Quick wins (next round, batch them)

### 1. "Add to Collection" menu — finish collections UX
**Schema:** ready (`collections` + `collection_items`, polymorphic targets).
**Router:** ready (`collection.addItem`, `collection.removeItem`, `collection.mine`).
**UI to do:**
- New client component `<AddToCollectionMenu targetType targetId>` placed next to `<BookmarkButton>` everywhere bookmarks exist (entity page, interpretation card, publication page, theory page, school page, product page, question page, event page).
- Dropdown showing user's collections (cache via `trpc.collection.mine.useQuery({ enabled: open })`).
- "Сохранено в N коллекциях" indicator + checkboxes per collection.
- "+ Новая коллекция" inline mini-form at the bottom of the dropdown.

### 2. Cross-references UI in publication form
**Schema:** ready (`publication_references`, polymorphic).
**Router:** ready (`publication.create` accepts `references[]`).
**UI to do:**
- In `<AddPublicationForm>`, below tags input, add a "Связать с" section.
- Use `trpc.search.global` debounced + dropdown to pick entity / theory / theory_object.
- Chips for chosen references, drop on `×`.
- Pass to mutation.

### 3. Mentorship matchmaker — surface flags
**Schema:** ready (`users.mentor_available`, `users.mentor_seeking`).
**Router to add:** `user.mentorList({ kind: 'available' | 'seeking', language })` returning users with flag set, ordered by karma.
**UI to do:**
- New page `/[lang]/mentors` with two tabs (Available / Seeking).
- Cards with avatar, name, schools, "Связаться" button → message to TG link if user has one in `userLinks` else mailto.

## Medium

### 4. Direct messages (DMs)
**New schema:**
```ts
conversations (id, createdAt)
conversation_participants (conversationId, userId, lastReadAt, primary key)
messages (id, conversationId, authorId, body, createdAt)
```
**Router:** `dm.list`, `dm.thread`, `dm.send`, `dm.markRead`.
**UI:** `/messages` (list of threads) + `/messages/[conversationId]` (thread).
**Notifications:** integrate with existing `notifications` table (new type `message` — add to enum).
**Realtime nice-to-have:** Pusher / Ably / SSE / polling. For MVP, just 30s polling on conversation page.

### 5. Groups / Communities
**Decision pending:** are these like Reddit subs (anyone posts), Discourse forums (threaded), or Slack-like channels?
**Suggested MVP:** Reddit-like.
**New schema:**
```ts
groups (id, slug, name, description, language, ownerId, isPrivate, createdAt)
group_members (groupId, userId, role: owner | moderator | member, joinedAt, primary key)
group_posts (id, groupId, authorId, title, slug, body, language, createdAt)
group_post_comments (use existing comments? or new table — interpretation comments are already polymorphic-ish)
```
**Decision:** reuse `comments` and make it polymorphic over both `interpretations` and `group_posts` — would need migration. Or make a separate `group_post_comments`. Probably simpler: separate table.
**Pages:** `/groups`, `/groups/[slug]`, `/groups/[slug]/posts/[postSlug]`.

### 6. Versioning (interpretations & publications)
**New schema:**
```ts
interpretation_revisions (id, interpretationId, body, theoryId, theoryObjectId, editorId, createdAt)
publication_revisions (id, publicationId, title, body, editorId, createdAt)
```
**Trigger:** on every `update` mutation, snapshot before-state into revisions.
**UI:** "История правок" button on interpretation/publication → modal with diff between revisions.
**Diff lib:** `diff-match-patch` or `jsdiff` — render unified-diff style with green/red lines.

### 7. Co-authorship
**New schema:**
```ts
interpretation_coauthors (interpretationId, userId, role: editor | translator | reviewer)
publication_coauthors (publicationId, userId, role)
```
**Router:** add `addCoauthor` / `removeCoauthor` mutations on each (only by main author).
**UI:** "Соавторы" section on the create/edit form with username search → add chip.
**Permissions:** any co-author can edit (or only certain roles). MVP — all co-authors can edit.

### 8. Annotations on materials (Genius-style)
**Most complex. Multiple weeks of work.**
**Schema:**
```ts
annotations (id, entityId, startOffset, endOffset, anchorText, authorId, language)
annotation_interpretations — link annotations to interpretations
```
**UI:**
- Highlighting layer over rendered material (markdown body for text materials, transcript for video materials).
- On selection — popup "Добавить интерпретацию к этому фрагменту".
- Side margin shows colored markers for existing annotations.
- Click marker → sidebar with interpretations on that fragment.
**Library to consider:** `rangy` or custom Selection API + DOM-range serialization.
**Defer:** until other features stable. This needs UX prototyping.

## Lower priority

### 9. Cite syntax: `[[#title]]` for theory-objects, `[[@username]]` for users
**Extension** of existing `expandCitations`. Easy to add — just regex variants.

### 10. Podcasts dedicated rendering
**Schema:** already supported via `materials` + `source.kind = 'podcast'`.
**To add:** audio embed in `MaterialEmbed` — detect Spotify/Apple/Yandex Music URL and use their iframe embed widgets. Generic audio URL → HTML5 `<audio>` element.

### 11. Import from Telegram / Substack
**Telegram:** Telegram channels expose a public web view. Could scrape or use Telegram Bot API to import messages as publications.
**Substack:** RSS-based, easier.
**Approach:** new endpoint `import.fromUrl(url)` that fetches, parses, and creates a draft publication. User reviews and publishes.

### 12. API embed widget
**New route:** `/embed/[type]/[id]` returns minimal HTML page with a single card (interpretation, school, etc.).
**Use case:** external blogs embed our content via `<iframe>`.
**Add:** `X-Frame-Options: ALLOWALL` for these routes, CSP-friendly.

### 13. Reply threading on comments
**Schema:** already has `comments.parent_comment_id` — unused so far. Just need UI:
- Render replies indented under parent (max 3 levels deep).
- "Reply" button on each comment puts new comment as child.

### 14. Email digest
**Use:** weekly summary of unread notifications, top trending, new content from followed users.
**Setup:** background job (Vercel Cron or Railway scheduled task) + email provider (Resend).

### 15. Polls / typing-by-voting
**New schema:** `polls (id, question, options jsonb, language, createdBy)` + `poll_votes (pollId, userId, optionIndex)`.
**Use case:** community types a person by voting on which TIM they think it is.

### 16. Anonymous read-only stats
- Public dashboard `/stats` — number of users, interpretations, theories, recent activity counts.

### 17. Themes / dark mode toggle
- Add toggle in header (Sun/Moon icon).
- Persist in localStorage + `data-theme` attribute on `<html>`.

## Refactor / Tech debt

- Move `seed.ts` mock data to a separate JSON or YAML file — currently hardcoded TS literals
- Extract `getBySlug` patterns into a generic helper (entity/theory/school/publication all have similar shape)
- Add Drizzle prepared statements for hot paths (vote.cast, notification.unreadCount)
- Add `ON CONFLICT DO NOTHING` to upsert paths in expand-seed (currently catches `try/empty catch`)
- Replace `confirm()` browser dialogs with shadcn AlertDialog
- Mobile responsive audit — header collapses awkwardly on narrow screens

## Open decisions

1. **Avatars:** currently URL field. Switch to Railway Volume upload? Or Cloudflare R2? Or Cloudinary? Decision needed before scaling.
2. **Telegram login:** still TODO from original plan. Login Widget approach (~2-3 days).
3. **AI features (V2):** auto-detect logical fallacies in interpretations? Suggest related citations? Out of scope until traction.
4. **Premium tier:** plan said vtoryichnye typologies (Психософия, Темпористика) and AI as paid. Not implemented; no payments wired yet.
5. **Moderation:** no roles yet. Should "curator" / "admin" badges grant editing of others' work? Currently locked to author only.
