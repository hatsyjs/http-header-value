/**
 * @internal
 */
export const enum Delimiter {
  None,
  TokenEnd,
  QuotedChar,
  RecordEnd,
  Eq,
  Quote,
  CommentEnd,
}

export type DelimiterKind = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const delimiters: { readonly [sep: string]: DelimiterKind } = {
  ' ': Delimiter.RecordEnd,
  '\t': Delimiter.RecordEnd,
  ',': Delimiter.RecordEnd,
  ';': Delimiter.RecordEnd,
  '"': Delimiter.QuotedChar,
  '\\': Delimiter.QuotedChar,
  '(': Delimiter.TokenEnd,
  ')': Delimiter.TokenEnd,
  '/': Delimiter.TokenEnd,
  ':': Delimiter.TokenEnd,
  '<': Delimiter.TokenEnd,
  '=': Delimiter.TokenEnd,
  '>': Delimiter.TokenEnd,
  '?': Delimiter.TokenEnd,
  '@': Delimiter.TokenEnd,
  '[': Delimiter.TokenEnd,
  ']': Delimiter.TokenEnd,
  '{': Delimiter.TokenEnd,
  '}': Delimiter.TokenEnd,
};

/**
 * @internal
 */
export function detectDelimiterKind(c: string): DelimiterKind {

  const delimiterKind = delimiters[c];

  return delimiterKind || (c >= '\u0000' && c <= ' ' || c === '\u007f' ? Delimiter.TokenEnd : Delimiter.None);
}
