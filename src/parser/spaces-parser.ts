import { HthvDelimiter } from '../hthv-delimiter.js';
import type { ParserConfig } from './parser-config.js';
import type { ParserInput } from './parser-input.js';

/**
 * @internal
 */
export function spacesParser({ delimiterOf }: ParserConfig): (input: ParserInput) => boolean {
  return input => {
    const start = input.i;

    do {
      const c = input.s[input.i];

      if (!(delimiterOf(c) & HthvDelimiter.Space)) {
        break;
      }
      input.i++;
    } while (input.i < input.s.length);

    return input.i !== start;
  };
}
