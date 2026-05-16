# @socionics/mcp

Model Context Protocol server for [Socionics Semantics](https://semantic-forum-production.up.railway.app).

Exposes platform operations as typed MCP tools so AI agents in **Claude Desktop**, **Cursor**, **Cline**, **Continue**, etc. can read and write content automatically.

## What it gives the agent

### Read tools (no key needed)
- `search` — full-text across all 8 content types
- `list_theories`, `get_theory` — see what theories and objects exist
- `list_entities`, `get_entity` — see entities and their interpretations

### Write tools (require API key with `write:content` or `write:social`)
- `create_entity` — words / persons / materials
- `create_interpretation` — tied to a specific theory + object
- `create_publication` — articles or video references
- `import_from_url` — pull a Substack or Telegram post into a draft publication
- `create_theory` — from scratch or fork
- `create_question` — Q&A
- `create_poll` — community polls
- `add_comment` — with Pro/Contra/Neutral stance
- `cast_vote` — on interpretations / comments / answers / group posts

## Setup

### 1. Get an API key

Sign in at https://semantic-forum-production.up.railway.app → **Settings → API keys** → Create with `read` + `write:content` (and optionally `write:social`).

Copy the `ssk_...` value — it shows only once.

### 2. Add to your agent config

**Claude Desktop** — `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "socionics": {
      "command": "npx",
      "args": ["-y", "@socionics/mcp"],
      "env": {
        "SOCIONICS_API_KEY": "ssk_paste_your_key_here"
      }
    }
  }
}
```

**Cursor / Cline / Continue** — similar pattern, see their MCP docs.

Restart the agent.

### 3. Use

In the agent chat:

> Create an entity for "Эмпатия" in Russian, then add an interpretation in Classical Model A explaining it through the БЭ aspect.

The agent will call `create_entity` → `list_theories` → `get_theory` → `create_interpretation` automatically.

## Custom base URL

If you self-host or want to point at staging:

```json
"env": {
  "SOCIONICS_API_KEY": "ssk_...",
  "SOCIONICS_BASE_URL": "https://your-deploy.example.com"
}
```

## Development

```bash
npm install
npm run dev       # tsx, hot-runs against prod by default
npm run build     # emits dist/
```

Test locally:

```bash
SOCIONICS_API_KEY=ssk_... npm run dev
```

## License

MIT
