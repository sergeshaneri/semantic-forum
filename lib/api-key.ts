import { createHash, randomBytes } from "crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { apiKeys } from "@/server/db/schema";

/**
 * API key format:
 *   ssk_<64 hex chars>
 *
 * Storage:
 *   keyHash = sha256(secret).hex   — looked up directly, no need for slow hash
 *                                    (secret is 256-bit random, not user input)
 *   prefix  = "ssk_" + secret[0:8] — shown in UI for identification
 *
 * Scopes (informational + minimal enforcement):
 *   "read"           — read-only API surface
 *   "write:content"  — create entities / theories / publications / etc.
 *   "write:social"   — votes, comments, RSVP, follows, bookmarks
 *   "admin"          — manage own API keys (NOT honored by API key itself — sessions only)
 *   "*"              — everything
 */

export const KEY_PREFIX = "ssk_";

export type ApiKeyScope =
  | "read"
  | "write:content"
  | "write:social"
  | "admin"
  | "*";

export const KNOWN_SCOPES = [
  "read",
  "write:content",
  "write:social",
  "admin",
] as const;

export function generateApiKey(): {
  raw: string;
  hash: string;
  prefix: string;
} {
  const secret = randomBytes(32).toString("hex"); // 64 hex chars
  const raw = `${KEY_PREFIX}${secret}`;
  const hash = createHash("sha256").update(secret).digest("hex");
  const prefix = `${KEY_PREFIX}${secret.slice(0, 8)}`;
  return { raw, hash, prefix };
}

export function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export type VerifiedApiKey = {
  id: string;
  userId: string;
  scopes: string[];
};

/**
 * Look up an API key by its raw value (`ssk_...`).
 * Returns null for any failure (bad format, not found, expired, revoked).
 * Updates lastUsedAt non-blocking.
 */
export async function verifyApiKey(
  raw: string,
): Promise<VerifiedApiKey | null> {
  if (!raw.startsWith(KEY_PREFIX)) return null;
  const secret = raw.slice(KEY_PREFIX.length);
  if (secret.length !== 64 || !/^[0-9a-f]+$/i.test(secret)) return null;
  const hash = hashSecret(secret);

  const [row] = await db
    .select({
      id: apiKeys.id,
      userId: apiKeys.userId,
      scopes: apiKeys.scopes,
      revokedAt: apiKeys.revokedAt,
      expiresAt: apiKeys.expiresAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, hash))
    .limit(1);

  if (!row) return null;
  if (row.revokedAt) return null;
  if (row.expiresAt && new Date(row.expiresAt).getTime() < Date.now()) {
    return null;
  }

  // Non-blocking: update lastUsedAt.
  db.update(apiKeys)
    .set({ lastUsedAt: sql`now()` })
    .where(eq(apiKeys.id, row.id))
    .catch(() => {
      /* swallow */
    });

  return {
    id: row.id,
    userId: row.userId,
    scopes: row.scopes ?? [],
  };
}

export function hasWriteScope(scopes: string[]): boolean {
  return scopes.some((s) => s === "*" || s.startsWith("write"));
}
