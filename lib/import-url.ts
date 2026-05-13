/**
 * Tiny URL importer for Substack, Telegram public posts, and generic OG pages.
 * Pure regex-based — no cheerio dep. Best-effort: we extract title + body text
 * + source URL, then return them for the caller to create a draft publication.
 */

export type ImportedPost = {
  source: "substack" | "telegram" | "generic";
  title: string;
  body: string;
  sourceUrl: string;
};

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; SocionicsSemanticsBot/1.0; +https://semantic-forum-production.up.railway.app)",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "ru,en;q=0.8",
};

const FETCH_TIMEOUT_MS = 12_000;
const MAX_BYTES = 2_000_000; // 2 MB safety cap

export async function importFromUrl(rawUrl: string): Promise<ImportedPost> {
  const url = normalizeUrl(rawUrl);
  if (!url) throw new Error("Некорректный URL");

  const html = await fetchHtml(url);

  if (url.includes("substack.com")) {
    return parseSubstack(html, url);
  }
  if (url.includes("t.me/") || url.includes("telegram.me/")) {
    return parseTelegram(html, url);
  }
  return parseGeneric(html, url);
}

function normalizeUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: FETCH_HEADERS,
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error(`Источник ответил ${res.status}`);
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("html") && !ct.includes("text/")) {
      throw new Error(`Источник не HTML (${ct || "unknown"})`);
    }
    const reader = res.body?.getReader();
    if (!reader) {
      return await res.text();
    }
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        total += value.byteLength;
        if (total > MAX_BYTES) {
          await reader.cancel();
          break;
        }
        chunks.push(value);
      }
    }
    const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)));
    return buf.toString("utf-8");
  } finally {
    clearTimeout(timer);
  }
}

// ----- meta extractors -----

function metaContent(html: string, prop: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escapeRegExp(prop)}["'][^>]*content=["']([^"']*)["'][^>]*>`,
    "i",
  );
  const m = html.match(re);
  if (m) return decodeHtmlEntities(m[1]!.trim());
  // alt order
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escapeRegExp(prop)}["']`,
    "i",
  );
  const m2 = html.match(re2);
  return m2 ? decodeHtmlEntities(m2[1]!.trim()) : null;
}

function pageTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decodeHtmlEntities(stripTags(m[1]!).trim()) : null;
}

function extractArticleBody(html: string): string | null {
  // Try <article> first
  const article = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (article) {
    return htmlToText(article[1]!);
  }
  // Fall back to main
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (main) return htmlToText(main[1]!);
  return null;
}

function htmlToText(input: string): string {
  // Strip scripts/styles fully
  let s = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
  // Block elements → newline
  s = s.replace(/<\/(p|div|section|li|h[1-6]|br|hr)>/gi, "\n");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  // Strip remaining tags
  s = s.replace(/<[^>]+>/g, "");
  // Collapse whitespace
  s = decodeHtmlEntities(s);
  s = s.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return s;
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, "");
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCharCode(parseInt(h, 16)),
    );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ----- parsers -----

function parseSubstack(html: string, url: string): ImportedPost {
  const title =
    metaContent(html, "og:title") ??
    metaContent(html, "twitter:title") ??
    pageTitle(html) ??
    "Без заголовка";
  const summary = metaContent(html, "og:description") ?? "";
  const article = extractArticleBody(html) ?? "";
  const body = combine(summary, article);
  return {
    source: "substack",
    title,
    body: body || summary || "(пустой пост)",
    sourceUrl: url,
  };
}

function parseTelegram(html: string, url: string): ImportedPost {
  // Telegram public web view: post body lives in .tgme_widget_message_text
  const m = html.match(
    /<div[^>]+class="[^"]*tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  );
  const body = m ? htmlToText(m[1]!) : extractArticleBody(html) ?? "";
  const titleMeta = metaContent(html, "og:title");
  const titleDesc = metaContent(html, "og:description") ?? "";
  // Telegram og:title is usually the channel name; prefer first line of body for title.
  const firstLine = (body.split(/\n/).find((l) => l.trim().length > 0) ?? "")
    .trim()
    .slice(0, 140);
  const title = firstLine || titleMeta || "Пост из Telegram";
  return {
    source: "telegram",
    title,
    body: body || titleDesc || "(пост без текста)",
    sourceUrl: url,
  };
}

function parseGeneric(html: string, url: string): ImportedPost {
  const title =
    metaContent(html, "og:title") ??
    metaContent(html, "twitter:title") ??
    pageTitle(html) ??
    "Импорт";
  const desc = metaContent(html, "og:description") ?? "";
  const article = extractArticleBody(html) ?? "";
  const body = combine(desc, article);
  return {
    source: "generic",
    title,
    body: body || desc || "(пустая страница)",
    sourceUrl: url,
  };
}

function combine(summary: string, body: string): string {
  const s = summary.trim();
  const b = body.trim();
  if (!s) return b;
  if (!b) return s;
  // Avoid duplicating the summary if the body already starts with it.
  if (b.startsWith(s)) return b;
  return `${s}\n\n${b}`;
}
