import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

describe("slugify", () => {
  it("transliterates Russian to Latin", () => {
    expect(slugify("Эмпатия")).toBe("empatiya");
    expect(slugify("Достоевский")).toBe("dostoevskiy");
  });

  it("converts spaces to single hyphens", () => {
    expect(slugify("Карл Густав Юнг")).toBe("karl-gustav-yung");
  });

  it("collapses runs of non-alphanumerics", () => {
    expect(slugify("hello!!! world??")).toBe("hello-world");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("—test—")).toBe("test");
  });

  it("lowercases input", () => {
    expect(slugify("FooBarBaz")).toBe("foobarbaz");
  });

  it("returns slugs matching the canonical pattern", () => {
    const cases = [
      "Простой текст",
      "Эмоциональная этика (БЭ)",
      "Тип ЛИИ — Робеспьер",
      "О ЧЁМ ЭТО",
      "Дон Кихот",
    ];
    for (const c of cases) {
      const s = slugify(c);
      expect(s, `failed for ${JSON.stringify(c)} -> ${JSON.stringify(s)}`).toMatch(SLUG_RE);
    }
  });

  it("caps slugs at 60 chars", () => {
    const long = "очень ".repeat(40);
    expect(slugify(long).length).toBeLessThanOrEqual(60);
  });

  it("strips soft and hard signs (ъ ь)", () => {
    expect(slugify("объект")).toBe("obekt");
    expect(slugify("конь")).toBe("kon");
  });
});
