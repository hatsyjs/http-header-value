import { HthvDelimiter } from '../hthv-delimiter';
import { ParserConfig } from './parser-config';
import { ParserInput } from './parser-input';

/**
 * @internal
 */
export function nextInComment(config: ParserConfig): (input: ParserInput) => string {
  return input => {

    let c = input.s[input.i];

    if (c !== '\\') {
      input.d = config.delimiterOf(c);
      return c;
    }

    ++input.i;
    if (input.i < input.s.length) {
      c = input.s[input.i];
      input.d = config.delimiterOf(c) ? HthvDelimiter.NonToken : HthvDelimiter.None;
    } else {
      input.d = HthvDelimiter.NonToken;
    }

    return c;
  };
}
