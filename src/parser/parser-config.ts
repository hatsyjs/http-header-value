import { HthvDelimiter, HthvDelimiterChar } from '../hthv-delimiter.js';
import type { HthvParserConfig } from '../hthv-parser.js';

/**
 * @internal
 */
export interface ParserConfig {
  readonly dateTime?: boolean | undefined;
  delimiterOf(this: void, char: string): number;
}

/**
 * @internal
 */
export type DelimitConfig = { [char in HthvDelimiterChar]: number };

/**
 * @internal
 */
export const defaultDelimit: DelimitConfig = {
  ' ': HthvDelimiter.NonToken | HthvDelimiter.Space | HthvDelimiter.Item,
  '\t': HthvDelimiter.NonToken | HthvDelimiter.Space | HthvDelimiter.Item,
  ',': HthvDelimiter.NonToken | HthvDelimiter.Item,
  ';': HthvDelimiter.NonToken | HthvDelimiter.Parameter,
  '"': HthvDelimiter.NonToken | HthvDelimiter.Escaped | HthvDelimiter.Quote,
  '\\': HthvDelimiter.NonToken | HthvDelimiter.Escaped,
  '<': HthvDelimiter.NonToken | HthvDelimiter.AngleBracketStart,
  '>': HthvDelimiter.NonToken | HthvDelimiter.AngleBracketEnd,
  '=': HthvDelimiter.NonToken | HthvDelimiter.Assignment,
  '(': HthvDelimiter.NonToken,
  ')': HthvDelimiter.NonToken,
  '/': HthvDelimiter.NonToken,
  ':': HthvDelimiter.NonToken,
  '?': HthvDelimiter.NonToken,
  '@': HthvDelimiter.NonToken,
  '[': HthvDelimiter.NonToken,
  ']': HthvDelimiter.NonToken,
  '{': HthvDelimiter.NonToken,
  '}': HthvDelimiter.NonToken,
};

/**
 * @internal
 */
export function buildParserConfig({ delimit, dateTime }: HthvParserConfig = {}): ParserConfig {
  const delimitConfig: DelimitConfig = delimit ? { ...defaultDelimit, ...delimit } : defaultDelimit;

  return {
    dateTime,
    delimiterOf(c) {
      return (
        delimitConfig[c as HthvDelimiterChar] ||
        ((c >= '\u0000' && c <= ' ') || c === '\u007f'
          ? HthvDelimiter.NonToken
          : HthvDelimiter.None)
      );
    },
  };
}

/**
 * @internal
 */
export const defaultParserConfig = /*#__PURE__*/ buildParserConfig();

/**
 * @internal
 */
export const commentParserConfig = /*#__PURE__*/ buildParserConfig({
  delimit: {
    ':': HthvDelimiter.NonToken | HthvDelimiter.Assignment,
    '(': HthvDelimiter.NonToken | HthvDelimiter.Escaped | HthvDelimiter.Comment,
    ')': HthvDelimiter.NonToken | HthvDelimiter.Escaped | HthvDelimiter.Item,
    ' ': HthvDelimiter.NonToken | HthvDelimiter.Space,
    '\t': HthvDelimiter.NonToken | HthvDelimiter.Space,
    '=': HthvDelimiter.NonToken,
    ',': HthvDelimiter.NonToken,
  },
});
