const FRONTMATTER_REGEX = /^\uFEFF?(?:[ \t]*\r?\n)*---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/;
const OBSIDIAN_EMBED_REGEX = /!\[\[[^\]]+\]\]/g;
const OBSIDIAN_WIKILINK_REGEX = /\[\[([^[\]]+)\]\]/g;

/**
 * Remove frontmatter and normalize common Obsidian syntax before Markdown parsing.
 */
export function preprocessMarkdown(
  text: string,
  ignoreFrontmatter: boolean,
  ignoreObsidianImages: boolean,
): string {
  let result = text;

  if (ignoreFrontmatter) {
    result = result.replace(FRONTMATTER_REGEX, "");
  }

  if (ignoreObsidianImages) {
    result = result.replace(OBSIDIAN_EMBED_REGEX, " ");
  }

  return result.replace(OBSIDIAN_WIKILINK_REGEX, (_, content: string) => {
    const [targetPart, labelPart] = content.split("|");

    // Prefer the visible label when present; otherwise drop section anchors.
    if (labelPart) {
      return labelPart.trim();
    }

    return targetPart.split("#", 1)[0].trim();
  });
}

