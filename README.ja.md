# readtime-cjk

`readtime-cjk` は、Markdown コンテンツの読了時間を推定する小さな TypeScript ライブラリです。CJK 文字、特に日本語をより適切に扱えるようにしてあり、Markdown や Obsidian スタイルのブログ記事に向いています。

- [English README](./README.md)

## 特徴

- CJK 文字数と英単語数を別々に数える
- fenced code block を非空行単位で数える
- `mdast-util-from-markdown` で Markdown を解析する
- frontmatter、画像、URL、inline code、HTML を既定で無視する
- `![[embed]]` や `[[wikilink]]` などの Obsidian 記法に対応する
- 詳細な API と簡易フォーマッタの両方を公開する

## インストール

```bash
pnpm add readtime-cjk
```

## 基本的な使い方

```ts
import { getReadingTime, readtime } from "readtime-cjk";

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

## 詳細な使い方

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

## オプション

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `cjkCharsPerMinute` | `number` | `500` | CJK 文字の読了速度 |
| `englishWordsPerMinute` | `number` | `200` | 英単語の読了速度 |
| `codeLinesPerMinute` | `number` | `20` | code block の非空行の読了速度 |
| `includeCodeBlocks` | `boolean` | `true` | fenced code block を非空行で数えるかどうか |
| `includeInlineCode` | `boolean` | `false` | inline code を通常テキストとして数えるかどうか |
| `includeUrls` | `boolean` | `false` | URL 文字列をカウント対象に含めるかどうか |
| `includeImageAlt` | `boolean` | `false` | Markdown 画像の alt を数えるかどうか |
| `includeHtml` | `boolean` | `false` | raw HTML ノードを数えるかどうか |
| `ignoreFrontmatter` | `boolean` | `true` | 先頭の YAML frontmatter を削除するかどうか |
| `ignoreObsidianImages` | `boolean` | `true` | `![[file]]` のような Obsidian embed を削除するかどうか |
| `format` | `"short" \| "long"` | `"short"` | `1 min` / `1 minute` のどちらで返すか |

## 結果オブジェクト

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

## CJK の扱い

`readtime-cjk` は Unicode property escapes を使って、次の文字種を CJK 文字として数えます。

- Hiragana
- Katakana
- Han
- Hangul

英単語は次の正規表現で別に数えます。

```ts
/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g
```

最終的な読了時間は次の式で求めます。

```ts
rawMinutes =
  cjkChars / cjkCharsPerMinute +
  englishWords / englishWordsPerMinute +
  codeLines / codeLinesPerMinute;
```

そのあと、次のように切り上げます。

```ts
minutes = Math.max(1, Math.ceil(rawMinutes));
```

カウント対象が 0 しかない場合は `undefined` を返します。

## Markdown と Obsidian の扱い

既定では、読了時間を水増ししやすい内容を除外します。

- ドキュメント先頭の YAML frontmatter
- `![[image.png]]` のような Obsidian embed
- `![alt](url)` のような Markdown 画像
- URL
- inline code
- raw HTML ノード

fenced code block は別扱いで、非空行数として数えます。

Obsidian の wikilink は前処理で次のように正規化します。

- `[[note]]` は `note`
- `[[note#section]]` は `note`
- `[[note|label]]` は `label`
- `[[note#section|label]]` は `label`

このライブラリは Obsidian スタイルのブログ記事に合わせることを目的にしていますが、Obsidian の全構文を完全に解釈するものではありません。

## 開発

依存関係のインストール:

```bash
corepack enable
corepack use pnpm@10.34.2
pnpm install
```

チェックの実行:

```bash
pnpm typecheck
pnpm test
pnpm build
```
