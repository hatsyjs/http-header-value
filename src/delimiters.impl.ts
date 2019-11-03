/**
 * @internal
 */
export const enum DelimiterKind {
  Token = 1,
  Escaped = 2,
  Item = 3,
}

/**
 * @internal
 */
export const delimiters: { readonly [sep: string]: 1 | 2 | 3 } = {
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
