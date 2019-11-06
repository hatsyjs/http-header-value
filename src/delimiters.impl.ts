/**
 * @internal
 */
export const enum Delimiter {
  None,
  Token,
  QuotedChar,
  Record,
  Eq,
  Quote,
}

export type DelimiterKind =
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5;

const delimiters: { readonly [sep: string]: DelimiterKind } = {
  ' ': Delimiter.Record,
  '\t': Delimiter.Record,
  ',': Delimiter.Record,
  ';': Delimiter.Record,
  '"': Delimiter.QuotedChar,
  '\\': Delimiter.QuotedChar,
  '(': Delimiter.Token,
  ')': Delimiter.Token,
  '/': Delimiter.Token,
  ':': Delimiter.Token,
  '<': Delimiter.Token,
  '=': Delimiter.Token,
  '>': Delimiter.Token,
  '?': Delimiter.Token,
  '@': Delimiter.Token,
  '[': Delimiter.Token,
  ']': Delimiter.Token,
  '{': Delimiter.Token,
  '}': Delimiter.Token,
};

/**
 * @internal
 */
export function detectDelimiterKind(c: string): DelimiterKind {

  const delimiterKind = delimiters[c];

  return delimiterKind || (c >= '\u0000' && c <= ' ' || c === '\u007f' ? Delimiter.Token : Delimiter.None);
}
