import { HthvDelimiter } from '../hthv-delimiter';
import { ParserConfig } from './parser-config';
import { ParserInput } from './parser-input';

/**
 * @internal
 */
export function quotedStringParser(
    config: ParserConfig,
): (input: ParserInput, out: (value: string) => void) => void {
  return (input, out) => {

    let unquoted = '';

    ++input.i;
    for (; input.i < input.s.length; ++input.i) {

      const c = input.s[input.i];

      if (c === '\\') {

        const next = input.s[++input.i];

        if (next) {
          unquoted += next;
        } else {
          unquoted += c;
        }
      } else if (config.delimiterOf(c) & HthvDelimiter.Quote) {
        ++input.i;
        out(unquoted);
        return;
      } else {
        unquoted += c;
      }
    }

    out(unquoted);
  };
}
