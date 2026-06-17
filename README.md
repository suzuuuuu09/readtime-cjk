# readtime-cjk

`readtime-cjk` is a small TypeScript library for estimating reading time from Markdown content with better support for CJK text, including Japanese, Chinese, and Korean. It is designed for Markdown and Obsidian-style blog posts where plain word-count based estimators are often inaccurate.

- [日本語版](./README.ja.md)

## Features

- Counts CJK characters, including Japanese, Chinese, and Korean, separately from English words
- Counts fenced code blocks by non-empty lines
- Parses Markdown with `mdast-util-from-markdown`
- Ignores frontmatter, images, URLs, inline code, and HTML by default
- Handles common Obsidian patterns such as `![[embed]]` and `[[wikilink]]`
- Exports both a detailed API and a convenience formatter

## Installation

```bash
pnpm add readtime-cjk
```

## Basic Usage

```ts
import { readtime, getReadingTime } from "readtime-cjk";

const markdown = `
# Hello

これは日本語の記事です。

\`\`\`ts
const message = "hello";
console.log(message);
\`\`\`
`;

const result = readtime(markdown);

console.log(result);
// {
//   minutes: 1,
//   text: "1 min",
//   rawMinutes: ...,
//   cjkChars: ...,
//   englishWords: ...,
//   codeLines: ...
// }

console.log(getReadingTime(markdown));
// "1 min"
```

## Detailed Usage

```ts
import { readtime } from "readtime-cjk";

const result = readtime(markdown, {
  cjkCharsPerMinute: 600,
  englishWordsPerMinute: 220,
  codeLinesPerMinute: 25,
  includeInlineCode: true,
  includeImageAlt: true,
  format: "long",
});
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `cjkCharsPerMinute` | `number` | `500` | Reading rate for CJK characters |
| `englishWordsPerMinute` | `number` | `200` | Reading rate for English words |
| `codeLinesPerMinute` | `number` | `20` | Reading rate for code block lines |
| `includeCodeBlocks` | `boolean` | `true` | Count fenced code blocks by non-empty lines |
| `includeInlineCode` | `boolean` | `false` | Include inline code as normal text |
| `includeUrls` | `boolean` | `false` | Include URL strings in the text count |
| `includeImageAlt` | `boolean` | `false` | Include Markdown image alt text |
| `includeHtml` | `boolean` | `false` | Include raw HTML node text |
| `ignoreFrontmatter` | `boolean` | `true` | Remove leading YAML frontmatter before parsing |
| `ignoreObsidianImages` | `boolean` | `true` | Remove Obsidian embeds such as `![[file]]` before parsing |
| `format` | `"short" \| "long"` | `"short"` | Format result text as `1 min` or `1 minute` |

## Result Object

```ts
type ReadtimeResult = {
  minutes: number;
  text: string;
  rawMinutes: number;
  cjkChars: number;
  englishWords: number;
  codeLines: number;
};
```

## CJK Behavior

`readtime-cjk` counts these scripts as CJK characters using Unicode property escapes:

- Hiragana
- Katakana
- Han
- Hangul

This means Japanese, Chinese, and Korean text are all included in the same CJK character bucket. The default `cjkCharsPerMinute` value is a shared approximation for CJK content, not a language-specific reading model.

English words are counted separately with this pattern:

```ts
/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g
```

The final estimate is calculated as:

```ts
rawMinutes =
  cjkChars / cjkCharsPerMinute +
  englishWords / englishWordsPerMinute +
  codeLines / codeLinesPerMinute;
```

Then it is rounded up:

```ts
minutes = Math.max(1, Math.ceil(rawMinutes));
```

If the content has no countable text or code, the result is `undefined`.

## Markdown and Obsidian Handling

By default, the library parses Markdown and excludes content that often inflates reading time:

- YAML frontmatter at the start of the document
- Obsidian embeds like `![[image.png]]`
- Markdown images like `![alt](url)`
- URLs
- inline code
- raw HTML nodes

Fenced code blocks are handled separately and counted by non-empty lines.

For Obsidian wikilinks, the library performs a small pre-processing step:

- `[[note]]` becomes `note`
- `[[note#section]]` becomes `note`
- `[[note|label]]` becomes `label`
- `[[note#section|label]]` becomes `label`

This is intended to work well for Markdown and Obsidian-style blog posts, but it does not aim to fully parse every Obsidian syntax extension.

## Development

Install dependencies:

```bash
corepack enable
corepack use pnpm@10.34.2
pnpm install
```

Run checks:

```bash
pnpm typecheck
pnpm test
pnpm build
```
