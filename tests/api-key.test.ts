import { describe, expect, it } from "vitest";
import { generateApiKey, hashSecret, hasWriteScope, KEY_PREFIX } from "@/lib/api-key";

describe("generateApiKey", () => {
  it("emits the ssk_ prefix", () => {
    const k = generateApiKey();
    expect(k.raw.startsWith(KEY_PREFIX)).toBe(true);
  });

  it("emits 64 hex chars after the prefix", () => {
    const k = generateApiKey();
    const secret = k.raw.slice(KEY_PREFIX.length);
    expect(secret).toMatch(/^[0-9a-f]{64}$/);
  });

  it("hash matches sha256 of the raw secret part", () => {
    const k = generateApiKey();
    const secret = k.raw.slice(KEY_PREFIX.length);
    expect(k.hash).toBe(hashSecret(secret));
  });

  it("hash is 64 hex chars (sha256)", () => {
    const k = generateApiKey();
    expect(k.hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("prefix includes first 8 chars of the secret for UI display", () => {
    const k = generateApiKey();
    const secret = k.raw.slice(KEY_PREFIX.length);
    expect(k.prefix).toBe(`${KEY_PREFIX}${secret.slice(0, 8)}`);
  });

  it("generates different secrets each call", () => {
    const a = generateApiKey();
    const b = generateApiKey();
    expect(a.raw).not.toBe(b.raw);
    expect(a.hash).not.toBe(b.hash);
  });
});

describe("hasWriteScope", () => {
  it("returns true for '*'", () => {
    expect(hasWriteScope(["*"])).toBe(true);
  });
  it("returns true for any write:* scope", () => {
    expect(hasWriteScope(["write:content"])).toBe(true);
    expect(hasWriteScope(["write:social"])).toBe(true);
    expect(hasWriteScope(["read", "write:social"])).toBe(true);
  });
  it("returns false for read-only scopes", () => {
    expect(hasWriteScope(["read"])).toBe(false);
    expect(hasWriteScope([])).toBe(false);
  });
  it("ignores unrelated scopes", () => {
    expect(hasWriteScope(["admin"])).toBe(false); // admin is gated separately
  });
});
