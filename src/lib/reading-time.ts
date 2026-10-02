const FENCED_CODE = /```[\s\S]*?```/g;
const INLINE_CODE = /`[^`]*`/g;
const BLOCK_MATH = /\$\$[\s\S]*?\$\$/g;
const INLINE_MATH = /\$[^$\n]*\$/g;
const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;
const LATIN_WORD = /[A-Za-z0-9]+/g;

/**
 * Estimated reading time in minutes for a Markdown body.
 *
 * Fenced and inline code, as well as block and inline math, are stripped
 * before counting. CJK characters and Latin words each count as one unit,
 * ~350 units per minute, with a 1-minute floor.
 */
export function readingMinutes(markdown: string): number {
  const text = markdown
    .replace(FENCED_CODE, '')
    .replace(INLINE_CODE, '')
    .replace(BLOCK_MATH, '')
    .replace(INLINE_MATH, '');

  const cjk = text.match(CJK)?.length ?? 0;
  const words = text.match(LATIN_WORD)?.length ?? 0;

  return Math.max(1, Math.round((cjk + words) / 350));
}
