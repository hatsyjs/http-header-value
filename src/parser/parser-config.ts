import { HthvDelimiter, HthvDelimiterChar } from '../hthv-delimiter';
import { HthvDelimitConfig } from '../hthv-parser';

/**
 * @internal
 */
export interface ParserConfig {
  delimiterOf(char: string): number;
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
  '"': HthvDelimiter.NonToken | HthvDelimiter.Escaped | HthvDelimiter.QuotedString,
  '\\': HthvDelimiter.NonToken | HthvDelimiter.Escaped,
  '(': HthvDelimiter.NonToken,
  ')': HthvDelimiter.NonToken,
  '/': HthvDelimiter.NonToken,
  ':': HthvDelimiter.NonToken,
  '<': HthvDelimiter.NonToken,
  '=': HthvDelimiter.NonToken | HthvDelimiter.Assignment,
  '>': HthvDelimiter.NonToken,
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
export function buildParserConfig(delimit?: HthvDelimitConfig): ParserConfig {

  const delimitConfig: DelimitConfig = delimit ? { ...defaultDelimit, ...delimit } : defaultDelimit;

  return {
    delimiterOf(c) {
      return delimitConfig[c as HthvDelimiterChar]
          || (c >= '\u0000' && c <= ' ' || c === '\u007f' ? HthvDelimiter.NonToken : HthvDelimiter.None);
    },
  };
}

export const defaultParserConfig = /*#__PURE__*/ buildParserConfig();

export const commentParserConfig = /*#__PURE__*/ buildParserConfig({
  ':': HthvDelimiter.NonToken | HthvDelimiter.Assignment,
  ')': HthvDelimiter.NonToken | HthvDelimiter.Item | HthvDelimiter.Escaped,
  '(': HthvDelimiter.NonToken | HthvDelimiter.Escaped,
  '=': HthvDelimiter.NonToken,
  ',': HthvDelimiter.NonToken,
  ' ': HthvDelimiter.NonToken,
});
