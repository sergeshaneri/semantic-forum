#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { baseUrl, trpcMutate, trpcQuery } from "./client.js";

const langSchema = z
  .enum(["ru", "en"])
  .describe("Content language. ru by default.");
const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "lowercase letters, digits, hyphens")
  .describe("URL slug — lowercase letters, digits, hyphens.");

const server = new McpServer({
  name: "socionics-mcp",
  version: "0.1.0",
});

// ----- Reads -----

server.registerTool(
  "search",
  {
    title: "Search platform content",
    description:
      "Search across entities, theories, publications, users, questions, polls, groups and posts. Public endpoint, no API key needed.",
    inputSchema: {
      query: z.string().min(1).max(120).describe("Search query."),
      language: langSchema.default("ru"),
      limit: z.number().int().min(1).max(20).default(8),
    },
  },
  async ({ query, language, limit }) => {
    const r = await trpcQuery("search.global", {
      q: query,
      language,
      limit,
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(r, null, 2),
        },
      ],
    };
  },
);

server.registerTool(
  "list_theories",
  {
    title: "List theories",
    description:
      "List all theories in the given language, including their slug and whether they are seeds.",
    inputSchema: {
      language: langSchema.default("ru"),
    },
  },
  async ({ language }) => {
    const r = await trpcQuery("theory.list", { language });
    return {
      content: [{ type: "text", text: JSON.stringify(r, null, 2) }],
    };
  },
);

server.registerTool(
  "get_theory",
  {
    title: "Get a theory and all its objects",
    description:
      "Returns a theory with its objects (aspects, function positions, TIMs, dichotomies, etc). Useful for picking the right theoryObjectId when creating interpretations.",
    inputSchema: {
      slug: z.string().describe("Theory slug, e.g. 'classical-model-a'"),
      language: langSchema.default("ru"),
    },
  },
  async ({ slug, language }) => {
    const r = await trpcQuery("theory.getBySlug", { slug, language });
    return {
      content: [{ type: "text", text: JSON.stringify(r, null, 2) }],
    };
  },
);

server.registerTool(
  "get_entity",
  {
    title: "Get an entity by slug",
    description:
      "Returns an entity with all its interpretations (across all theories). Use to find an entityId or inspect existing arguments.",
    inputSchema: {
      slug: z.string(),
      language: langSchema.default("ru"),
    },
  },
  async ({ slug, language }) => {
    const r = await trpcQuery("entity.getBySlug", { slug, language });
    return {
      content: [{ type: "text", text: JSON.stringify(r, null, 2) }],
    };
  },
);

server.registerTool(
  "list_entities",
  {
    title: "List entities",
    description:
      "Paginated list of entities (words / persons / materials) in the given language.",
    inputSchema: {
      language: langSchema.default("ru"),
      kind: z
        .enum(["word", "person", "material"])
        .optional()
        .describe("Optional filter."),
      limit: z.number().int().min(1).max(100).default(50),
    },
  },
  async ({ language, kind, limit }) => {
    const r = await trpcQuery("entity.list", { language, kind, limit });
    return {
      content: [{ type: "text", text: JSON.stringify(r, null, 2) }],
    };
  },
);

// ----- Writes -----

server.registerTool(
  "create_entity",
  {
    title: "Create a new entity",
    description:
      "Creates a word, person, or material. Use for new concepts/people the community will interpret. descriptionWiki should be neutral — no socionic claims (those go in interpretations).",
    inputSchema: {
      kind: z
        .enum(["word", "person", "material"])
        .describe("Kind. 'material' supports an embed URL."),
      title: z.string().min(1).max(300),
      slug: slugSchema,
      descriptionWiki: z
        .string()
        .min(20)
        .max(3000)
        .describe("Neutral wiki-style description. Markdown supported."),
      language: langSchema.default("ru"),
      embedUrl: z
        .string()
        .url()
        .max(500)
        .optional()
        .describe("Only for kind=material. YouTube / Vimeo / Spotify / etc."),
      sourceUrl: z.string().url().max(500).optional(),
    },
  },
  async (input) => {
    const r = await trpcMutate<{ id: string; slug: string }>(
      "entity.create",
      input,
    );
    return {
      content: [
        {
          type: "text",
          text: `Created entity ${r.id} (${r.slug}). URL: ${baseUrl}/${input.language ?? "ru"}/entities/${r.slug}`,
        },
      ],
    };
  },
);

server.registerTool(
  "create_interpretation",
  {
    title: "Create an interpretation",
    description:
      "Publishes an interpretation tied to a specific theory + theory object. Body supports markdown and citations: [[Entity]], [[#object-slug]], [[@username]].",
    inputSchema: {
      entityId: z.string().uuid().describe("Use get_entity / search first."),
      theoryId: z.string().uuid().describe("Use get_theory / list_theories."),
      theoryObjectId: z
        .string()
        .uuid()
        .describe("The object inside the theory (aspect, TIM, etc.)"),
      body: z
        .string()
        .min(20)
        .max(5000)
        .describe("Reasoned argument. Min 20 chars."),
    },
  },
  async (input) => {
    const r = await trpcMutate<{ id: string }>(
      "interpretation.create",
      input,
    );
    return {
      content: [
        {
          type: "text",
          text: `Created interpretation ${r.id}.`,
        },
      ],
    };
  },
);

server.registerTool(
  "create_publication",
  {
    title: "Publish an article or video reference",
    description:
      "Creates a publication on the author's profile. For videos pass kind='video' + externalUrl. Citations [[X]] in body auto-link.",
    inputSchema: {
      kind: z.enum(["article", "video"]),
      title: z.string().min(2).max(300),
      slug: slugSchema,
      body: z.string().min(20).max(50_000),
      language: langSchema.default("ru"),
      externalUrl: z
        .string()
        .url()
        .max(500)
        .optional()
        .describe("Required for kind=video."),
      tags: z
        .array(z.string().min(1).max(50))
        .max(20)
        .optional()
        .describe("Free-form tags, lowercased."),
    },
  },
  async (input) => {
    const r = await trpcMutate<{ id: string; slug: string }>(
      "publication.create",
      input,
    );
    return {
      content: [
        {
          type: "text",
          text: `Created publication ${r.id} (${r.slug}).`,
        },
      ],
    };
  },
);

server.registerTool(
  "import_from_url",
  {
    title: "Import a Substack or Telegram post as a publication",
    description:
      "Fetches the URL server-side, parses og:title / body / .tgme_widget_message_text, and creates a draft publication. Original link is appended as source.",
    inputSchema: {
      url: z.string().url(),
      language: langSchema.default("ru"),
    },
  },
  async (input) => {
    const r = await trpcMutate<{ id: string; slug: string; source: string }>(
      "import.asPublication",
      input,
    );
    return {
      content: [
        {
          type: "text",
          text: `Imported from ${r.source}: publication ${r.id} (${r.slug}).`,
        },
      ],
    };
  },
);

server.registerTool(
  "create_theory",
  {
    title: "Create a new theory",
    description:
      "Create from scratch or fork an existing one. Forking copies all objects so you can edit definitions.",
    inputSchema: {
      name: z.string().min(2).max(200),
      slug: slugSchema,
      description: z.string().max(5000).optional(),
      language: langSchema.default("ru"),
      parentTheoryId: z
        .string()
        .uuid()
        .optional()
        .describe("Pass to fork an existing theory."),
      copyObjects: z
        .boolean()
        .default(true)
        .describe("When forking, copy parent theory's objects too."),
    },
  },
  async (input) => {
    const r = await trpcMutate<{ id: string; slug: string }>(
      "theory.create",
      input,
    );
    return {
      content: [
        {
          type: "text",
          text: `Created theory ${r.id} (${r.slug}). URL: ${baseUrl}/${input.language ?? "ru"}/theories/${r.slug}`,
        },
      ],
    };
  },
);

server.registerTool(
  "create_question",
  {
    title: "Ask a question to the community",
    description:
      "Posts a Q&A question. Body supports markdown and citations.",
    inputSchema: {
      title: z.string().min(5).max(300),
      slug: slugSchema,
      body: z.string().min(10).max(20_000),
      language: langSchema.default("ru"),
    },
  },
  async (input) => {
    const r = await trpcMutate<{ id: string; slug: string }>(
      "question.create",
      input,
    );
    return {
      content: [
        {
          type: "text",
          text: `Asked question ${r.id} (${r.slug}).`,
        },
      ],
    };
  },
);

server.registerTool(
  "create_poll",
  {
    title: "Create a community poll",
    description: "2–20 options, with optional close date.",
    inputSchema: {
      question: z.string().min(5).max(500),
      slug: slugSchema,
      description: z.string().max(2000).optional(),
      options: z.array(z.string().min(1).max(200)).min(2).max(20),
      language: langSchema.default("ru"),
      closesAt: z
        .string()
        .datetime()
        .optional()
        .describe("ISO datetime when voting closes."),
    },
  },
  async (input) => {
    const payload: Record<string, unknown> = { ...input };
    if (input.closesAt) payload.closesAt = new Date(input.closesAt);
    const r = await trpcMutate<{ id: string; slug: string }>(
      "poll.create",
      payload,
    );
    return {
      content: [
        {
          type: "text",
          text: `Created poll ${r.id} (${r.slug}).`,
        },
      ],
    };
  },
);

server.registerTool(
  "cast_vote",
  {
    title: "Vote on an interpretation, comment, answer or group post",
    description:
      "Use targetType + targetId. Value 1 (upvote) or -1 (downvote). Voting the same way again removes the vote.",
    inputSchema: {
      targetType: z.enum([
        "interpretation",
        "comment",
        "answer",
        "group_post",
      ]),
      targetId: z.string().uuid(),
      value: z.union([z.literal(1), z.literal(-1)]),
    },
  },
  async (input) => {
    const r = await trpcMutate<{
      votesUp: number;
      votesDown: number;
      score: number;
      userVote: number;
    }>("vote.cast", input);
    return {
      content: [
        {
          type: "text",
          text: `Score now ${r.score} (+${r.votesUp} / -${r.votesDown}).`,
        },
      ],
    };
  },
);

server.registerTool(
  "add_comment",
  {
    title: "Comment on an interpretation",
    description:
      "Adds a comment with a stance. Use parentCommentId for nested replies (up to 3 levels).",
    inputSchema: {
      interpretationId: z.string().uuid(),
      body: z.string().min(2).max(2000),
      stance: z
        .enum(["pro", "contra", "neutral"])
        .default("neutral")
        .describe("pro=support, contra=refute, neutral=clarify."),
      parentCommentId: z.string().uuid().optional(),
    },
  },
  async (input) => {
    const r = await trpcMutate<{ id: string }>("comment.create", input);
    return {
      content: [{ type: "text", text: `Posted comment ${r.id}.` }],
    };
  },
);

// ----- Server lifecycle -----

const transport = new StdioServerTransport();
await server.connect(transport);
