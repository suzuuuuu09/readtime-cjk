/**
 * Options for reading time estimation.
 */
export type ReadtimeOptions = {
	/** Reading rate for CJK characters. @default 500 */
	cjkCharsPerMinute?: number;
	/** Reading rate for English words. @default 200 */
	englishWordsPerMinute?: number;
	/** Reading rate for non-empty fenced code block lines. @default 20 */
	codeLinesPerMinute?: number;
	/** Whether fenced code blocks should contribute to the estimate. @default true */
	includeCodeBlocks?: boolean;
	/** Whether inline code should be counted as normal text. @default false */
	includeInlineCode?: boolean;
	/** Whether URL strings should be counted as readable text. @default false */
	includeUrls?: boolean;
	/** Whether Markdown image alt text should be counted. @default false */
	includeImageAlt?: boolean;
	/** Whether raw HTML node text should be counted. @default false */
	includeHtml?: boolean;
	/** Whether leading YAML frontmatter should be removed before parsing. @default true */
	ignoreFrontmatter?: boolean;
	/** Whether Obsidian embeds like `![[file]]` should be removed before parsing. @default true */
	ignoreObsidianImages?: boolean;
	/** Output format for the human-readable text field. @default "short" */
	format?: "short" | "long";
};

/**
 * Detailed reading time result.
 */
export type ReadtimeResult = {
	/** Final reading time in whole minutes, rounded up with a minimum of 1. */
	minutes: number;
	/** Formatted label such as `"1 min"` or `"1 minute"`. */
	text: string;
	/** Unrounded reading time before applying the final minute rounding. */
	rawMinutes: number;
	/** Number of matched CJK characters in the readable text. */
	cjkChars: number;
	/** Number of matched English words in the readable text. */
	englishWords: number;
	/** Number of counted non-empty fenced code block lines. */
	codeLines: number;
};

export const DEFAULT_OPTIONS = {
	cjkCharsPerMinute: 500,
	englishWordsPerMinute: 200,
	codeLinesPerMinute: 20,
	includeCodeBlocks: true,
	includeInlineCode: false,
	includeUrls: false,
	includeImageAlt: false,
	includeHtml: false,
	ignoreFrontmatter: true,
	ignoreObsidianImages: true,
	format: "short",
} satisfies Required<ReadtimeOptions>;
