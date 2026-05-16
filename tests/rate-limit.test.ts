import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

const NOW = 1_700_000_000_000;

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows traffic under the cap", () => {
    const id = `test-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      const r = rateLimit(id, { capacity: 5, windowMs: 60_000 });
      expect(r.ok).toBe(true);
      expect(r.remaining).toBe(4 - i);
    }
  });

  it("blocks once the cap is reached and returns retry hint", () => {
    const id = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      rateLimit(id, { capacity: 3, windowMs: 60_000 });
    }
    const blocked = rateLimit(id, { capacity: 3, windowMs: 60_000 });
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the window elapses", () => {
    const id = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      rateLimit(id, { capacity: 3, windowMs: 60_000 });
    }
    vi.setSystemTime(NOW + 60_001);
    const r = rateLimit(id, { capacity: 3, windowMs: 60_000 });
    expect(r.ok).toBe(true);
    expect(r.remaining).toBe(2);
  });

  it("scopes counters per identity", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      rateLimit(a, { capacity: 3, windowMs: 60_000 });
    }
    const otherUser = rateLimit(b, { capacity: 3, windowMs: 60_000 });
    expect(otherUser.ok).toBe(true);
  });
});
