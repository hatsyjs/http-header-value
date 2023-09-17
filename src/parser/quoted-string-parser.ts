import { HthvDelimiter } from '../hthv-delimiter.js';
import type { ParserConfig } from './parser-config.js';
import type { ParserInput } from './parser-input.js';

/**
 * @internal
 */
export function quotedStringParser({
  delimiterOf,
}: ParserConfig): (input: ParserInput, out: (value: string) => void) => void {
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
      } else if (delimiterOf(c) & HthvDelimiter.Quote) {
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
