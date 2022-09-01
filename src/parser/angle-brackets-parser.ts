import { HthvDelimiter } from '../hthv-delimiter';
import type { ParserConfig } from './parser-config';
import type { ParserInput } from './parser-input';

/**
 * @internal
 */
export function angleBracketsParser({
  delimiterOf,
}: ParserConfig): (input: ParserInput, out: (v: string) => void) => boolean {
  return (input, out) => {
    if (!(delimiterOf(input.s[input.i]) & HthvDelimiter.AngleBracketStart)) {
      return false;
    }

    let result = '';

    ++input.i;
    while (input.i < input.s.length) {
      const c = input.s[input.i++];

      if (delimiterOf(c) & HthvDelimiter.AngleBracketEnd) {
        break;
      }
      result += c;
    }

    out(result);

    return true;
  };
}
