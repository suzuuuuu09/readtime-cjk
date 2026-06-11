import { fromMarkdown } from "mdast-util-from-markdown";
import { toString } from "mdast-util-to-string";
import type { Code, Nodes } from "mdast";
import { DEFAULT_OPTIONS, type ReadtimeOptions, type ReadtimeResult } from "./types.js";
import { preprocessMarkdown } from "./preprocess.js";

const CJK_CHAR_REGEX =
  /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}\p{Script=Hangul}]/gu;
const ENGLISH_WORD_REGEX = /[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g;
const URL_REGEX =
  /\b(?:https?:\/\/[^\s<>()]+|mailto:[^\s<>()]+|www\.[^\s<>()]+|[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+(?:\/[^\s<>()]*)?)/gi;

type CounterState = {
  textParts: string[];
  codeLines: number;
};

/**
 * Estimate reading time for Markdown content with separate CJK, English, and code rates.
 *
 * Returns `undefined` when the input is empty or contains no countable content.
 */
export const readtime = (
  text: string,
  options?: ReadtimeOptions,
): ReadtimeResult | undefined => {
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };
  const normalizedInput = preprocessMarkdown(
    text,
    resolvedOptions.ignoreFrontmatter,
    resolvedOptions.ignoreObsidianImages,
  );
  const tree = fromMarkdown(normalizedInput);
  const state: CounterState = {
    textParts: [],
    codeLines: 0,
  };

  collectNodeContent(tree, state, resolvedOptions);

  const readableText = normalizeText(state.textParts.join(" "));
  const cjkChars = countMatches(readableText, CJK_CHAR_REGEX);
  const englishWords = countMatches(readableText, ENGLISH_WORD_REGEX);
  const codeLines = resolvedOptions.includeCodeBlocks ? state.codeLines : 0;

  if (cjkChars === 0 && englishWords === 0 && codeLines === 0) {
    return undefined;
  }

  const rawMinutes =
    cjkChars / resolvedOptions.cjkCharsPerMinute +
    englishWords / resolvedOptions.englishWordsPerMinute +
    codeLines / resolvedOptions.codeLinesPerMinute;
  const minutes = Math.max(1, Math.ceil(rawMinutes));

  return {
    minutes,
    text: formatMinutes(minutes, resolvedOptions.format),
    rawMinutes,
    cjkChars,
    englishWords,
    codeLines,
  };
};

/**
 * Return the formatted reading time text for Markdown content.
 *
 * Returns `undefined` when the input is empty or contains no countable content.
 */
export const getReadingTime = (
  text: string,
  options?: ReadtimeOptions,
): string | undefined => readtime(text, options)?.text;

/**
 * Walk the mdast tree and collect prose text and code block line counts.
 */
function collectNodeContent(
  node: Nodes,
  state: CounterState,
  options: Required<ReadtimeOptions>,
): void {
  switch (node.type) {
    case "code":
      // Code blocks are tracked separately from prose and counted by line.
      if (options.includeCodeBlocks) {
        state.codeLines += countCodeLines(node);
      }
      return;
    case "inlineCode":
      if (options.includeInlineCode) {
        state.textParts.push(node.value);
      }
      return;
    case "image":
      if (options.includeImageAlt && node.alt) {
        state.textParts.push(node.alt);
      }
      return;
    case "html":
      if (options.includeHtml) {
        state.textParts.push(node.value);
      }
      return;
    case "link":
      // Count visible link text by default and only add the URL itself when enabled.
      state.textParts.push(stripUrls(toString(node), options));
      if (options.includeUrls) {
        state.textParts.push(node.url);
      }
      return;
    case "definition":
      if (options.includeUrls) {
        state.textParts.push(node.url);
      }
      return;
    case "text":
      state.textParts.push(stripUrls(node.value, options));
      return;
    default:
      traverseChildren(node, state, options);
  }
}

/**
 * Visit child nodes for mdast nodes that contain nested content.
 */
function traverseChildren(
  node: Nodes,
  state: CounterState,
  options: Required<ReadtimeOptions>,
): void {
  if ("children" in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      collectNodeContent(child, state, options);
    }
  }
}

/**
 * Remove URL-like substrings unless URL counting is explicitly enabled.
 */
function stripUrls(text: string, options: Required<ReadtimeOptions>): string {
  if (options.includeUrls) {
    return text;
  }

  return text.replace(URL_REGEX, " ");
}

/**
 * Count non-empty lines in a fenced code block.
 */
function countCodeLines(node: Code): number {
  return node.value
    .split(/\r?\n/u)
    .filter((line) => line.trim().length > 0).length;
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function countMatches(text: string, pattern: RegExp): number {
  return Array.from(text.matchAll(pattern)).length;
}

/**
 * Format whole-minute output in either short or long style.
 */
function formatMinutes(
  minutes: number,
  format: Required<ReadtimeOptions>["format"],
): string {
  if (format === "long") {
    return minutes === 1 ? "1 minute" : `${minutes} minutes`;
  }

  return `${minutes} min`;
}

