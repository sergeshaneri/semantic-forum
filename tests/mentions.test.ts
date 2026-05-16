import { describe, expect, it } from "vitest";
import { extractMentions } from "@/lib/mentions";

describe("extractMentions", () => {
  it("extracts a single @username", () => {
    expect(extractMentions("hi @anna_sociotyper how are you")).toEqual([
      "anna_sociotyper",
    ]);
  });

  it("extracts multiple unique mentions", () => {
    expect(
      extractMentions("@ivan_methodologist and @anna_sociotyper, ping @alex_skeptic"),
    ).toEqual(["ivan_methodologist", "anna_sociotyper", "alex_skeptic"]);
  });

  it("dedupes repeated mentions", () => {
    expect(extractMentions("@bob said @bob")).toEqual(["bob"]);
  });

  it("doesn't match mid-word @", () => {
    // email-like — should not match
    expect(extractMentions("write to user@example.com")).toEqual([]);
  });

  it("doesn't match too-short or too-long handles", () => {
    expect(extractMentions("@ab")).toEqual([]);
    expect(extractMentions(`@${"a".repeat(33)}`)).toEqual([]);
    expect(extractMentions(`@${"a".repeat(32)}`)).toEqual([
      "a".repeat(32),
    ]);
  });

  it("accepts mention at the very start of the body", () => {
    expect(extractMentions("@alice hi")).toEqual(["alice"]);
  });

  it("returns empty array for no matches", () => {
    expect(extractMentions("no one is mentioned here")).toEqual([]);
  });
});
