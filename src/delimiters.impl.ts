/**
 * @internal
 */
export const enum DelimiterKind {
  Token = 1,
  Item = 2,
}

/**
 * @internal
 */
export const delimiters: { readonly [sep: string]: 1 | 2 } = {
  ' ': DelimiterKind.Item,
  '\t': DelimiterKind.Item,
  ',': DelimiterKind.Item,
  ';': DelimiterKind.Item,
  '"': DelimiterKind.Token,
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
  '\\': DelimiterKind.Token,
  ']': DelimiterKind.Token,
  '{': DelimiterKind.Token,
  '}': DelimiterKind.Token,
};
