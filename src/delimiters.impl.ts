/**
 * @internal
 */
export const enum DelimiterKind {
  Token = 1,
  Escaped = 2,
  Item = 3,
}

const delimiters: { readonly [sep: string]: 1 | 2 | 3 } = {
  ' ': DelimiterKind.Item,
  '\t': DelimiterKind.Item,
  ',': DelimiterKind.Item,
  ';': DelimiterKind.Item,
  '"': DelimiterKind.Escaped,
  '\\': DelimiterKind.Escaped,
  '(': DelimiterKind.Token,
  ')': DelimiterKind.Token,
  '/': DelimiterKind.Token,
  ':': DelimiterKind.Token,
  '<': DelimiterKind.Token,
  '=': DelimiterKind.Token,
  '>': DelimiterKind.Token,
  '?': DelimiterKind.Token,
  '@': DelimiterKind.Token,
  '[': DelimiterKind.Token,
  ']': DelimiterKind.Token,
  '{': DelimiterKind.Token,
  '}': DelimiterKind.Token,
};

/**
 * @internal
 */
export function detectDelimiterKind(c: string): 1 | 2 | 3 | undefined {

  const delimiterKind = delimiters[c];

  return delimiterKind || (c >= '\u0000' && c <= ' ' || c === '\u007f' ? DelimiterKind.Token : undefined);
}
