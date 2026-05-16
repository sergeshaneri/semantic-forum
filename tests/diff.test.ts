import { describe, expect, it } from "vitest";
import { diffLines, type DiffPart } from "@/lib/diff";

function bucket(parts: DiffPart[]) {
  return {
    same: parts.filter((p) => p.kind === "same").map((p) => p.text),
    add: parts.filter((p) => p.kind === "add").map((p) => p.text),
    del: parts.filter((p) => p.kind === "del").map((p) => p.text),
  };
}

describe("diffLines", () => {
  it("returns all 'same' when texts are identical", () => {
    const parts = diffLines("a\nb\nc", "a\nb\nc");
    expect(parts.every((p) => p.kind === "same")).toBe(true);
    expect(bucket(parts).same).toEqual(["a", "b", "c"]);
  });

  it("detects pure insertions", () => {
    const parts = diffLines("a\nc", "a\nb\nc");
    const b = bucket(parts);
    expect(b.add).toEqual(["b"]);
    expect(b.del).toEqual([]);
    expect(b.same).toEqual(["a", "c"]);
  });

  it("detects pure deletions", () => {
    const parts = diffLines("a\nb\nc", "a\nc");
    const b = bucket(parts);
    expect(b.del).toEqual(["b"]);
    expect(b.add).toEqual([]);
    expect(b.same).toEqual(["a", "c"]);
  });

  it("detects a line replacement as add + del", () => {
    const parts = diffLines("a\nb\nc", "a\nX\nc");
    const b = bucket(parts);
    expect(b.add).toEqual(["X"]);
    expect(b.del).toEqual(["b"]);
    expect(b.same).toEqual(["a", "c"]);
  });

  it("handles full rewrites", () => {
    const parts = diffLines("a\nb", "x\ny");
    const b = bucket(parts);
    expect(b.add).toEqual(["x", "y"]);
    expect(b.del).toEqual(["a", "b"]);
    expect(b.same).toEqual([]);
  });

  it("handles empty old text", () => {
    const parts = diffLines("", "a\nb");
    const b = bucket(parts);
    expect(b.add).toEqual(["a", "b"]);
    expect(b.del).toEqual([""]);
  });

  it("preserves order — kept lines appear in original sequence", () => {
    const parts = diffLines("one\ntwo\nthree", "one\nTWO\nthree");
    const sames = parts.filter((p) => p.kind === "same").map((p) => p.text);
    expect(sames).toEqual(["one", "three"]);
  });
});
