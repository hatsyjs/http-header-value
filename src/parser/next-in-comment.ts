import { HthvDelimiter } from '../hthv-delimiter.js';
import type { ParserConfig } from './parser-config.js';
import type { ParserInput } from './parser-input.js';

/**
 * @internal
 */
export function nextInComment({ delimiterOf }: ParserConfig): (input: ParserInput) => string {
  return input => {
    let c = input.s[input.i];

    if (c !== '\\') {
      input.d = delimiterOf(c);

      return c;
    }

    ++input.i;
    if (input.i < input.s.length) {
      c = input.s[input.i];
      input.d = delimiterOf(c) ? HthvDelimiter.NonToken : HthvDelimiter.None;
    } else {
      input.d = HthvDelimiter.NonToken;
    }

    return c;
  };
}
