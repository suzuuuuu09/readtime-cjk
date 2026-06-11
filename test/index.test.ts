import { describe, expect, it } from "vitest";
import { getReadingTime, readtime } from "../src/index.js";

describe("readtime", () => {
  it("counts Japanese text as CJK characters", () => {
    const result = readtime("これは日本語の記事です。");

    expect(result).toBeDefined();
    expect(result?.cjkChars).toBe(11);
    expect(result?.englishWords).toBe(0);
  });

  it("counts English text as English words", () => {
    const result = readtime("This package counts English words and numbers like 123.");

    expect(result).toBeDefined();
    expect(result?.englishWords).toBe(9);
    expect(result?.cjkChars).toBe(0);
  });

  it("ignores Markdown images by default", () => {
    const result = readtime("Before ![diagram overview](./image.png) after");

    expect(result).toBeDefined();
    expect(result?.englishWords).toBe(2);
  });

  it("ignores Obsidian image embeds by default", () => {
    const result = readtime("Before ![[image.png]] after");

    expect(result).toBeDefined();
    expect(result?.englishWords).toBe(2);
  });

  it("ignores URLs by default", () => {
    const result = readtime("Visit https://example.com/docs and www.example.com/path now.");

    expect(result).toBeDefined();
    expect(result?.englishWords).toBe(3);
  });

  it("counts code blocks by non-empty lines", () => {
    const result = readtime("```ts\nconst a = 1;\n\nconsole.log(a);\n```");

    expect(result).toBeDefined();
    expect(result?.codeLines).toBe(2);
    expect(result?.englishWords).toBe(0);
  });

  it("disables code block counting when includeCodeBlocks is false", () => {
    const result = readtime("```ts\nconst a = 1;\nconsole.log(a);\n```", {
      includeCodeBlocks: false,
    });

    expect(result).toBeUndefined();
  });

  it("formats long output", () => {
    expect(getReadingTime("hello", { format: "long" })).toBe("1 minute");

    const result = getReadingTime("word ".repeat(250), { format: "long" });
    expect(result).toBe("2 minutes");
  });

  it("returns undefined for empty input", () => {
    expect(readtime("")).toBeUndefined();
    expect(readtime("![alt](image.png)")).toBeUndefined();
  });

  it("normalizes Obsidian wikilinks", () => {
    const result = readtime("[[note]] [[note#section]] [[note|label]] [[note#section|visible text]]");

    expect(result).toBeDefined();
    expect(result?.englishWords).toBe(5);
  });
});
