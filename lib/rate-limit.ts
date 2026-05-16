/**
 * Tiny in-memory token bucket per (identity).
 * Good enough for a single-instance Railway deploy. When we scale
 * horizontally, swap the Map for Redis or @upstash/ratelimit.
 *
 * Identity is "session:<userId>" or "key:<apiKeyId>" or "ip:<addr>".
 */

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

// House-keeping: prune expired buckets occasionally so the Map can't grow
// unbounded under churn. Triggered on every check that crosses a 5-min boundary.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 5 * 60_000) return;
  lastSweep = now;
  for (const [k, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(k);
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

/**
 * Increment the bucket for the given key. Returns ok=false when the cap is
 * exceeded within the window.
 */
export function rateLimit(
  identity: string,
  opts: { capacity: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  sweep(now);
  const existing = buckets.get(identity);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + opts.windowMs;
    buckets.set(identity, { count: 1, resetAt });
    return {
      ok: true,
      remaining: opts.capacity - 1,
      resetAt,
      retryAfterSeconds: 0,
    };
  }
  if (existing.count >= opts.capacity) {
    return {
      ok: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000),
      ),
    };
  }
  existing.count += 1;
  return {
    ok: true,
    remaining: opts.capacity - existing.count,
    resetAt: existing.resetAt,
    retryAfterSeconds: 0,
  };
}

/**
 * Reasonable defaults: session users get 60 mutations/min, API keys 30/min.
 * Cheating slightly higher than strict per-second for usability.
 */
export const LIMITS = {
  session: { capacity: 60, windowMs: 60_000 },
  apiKey: { capacity: 30, windowMs: 60_000 },
  ipAnon: { capacity: 30, windowMs: 60_000 },
} as const;

/** Best-effort extraction of client IP from common header set. */
export function clientIpFromHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
