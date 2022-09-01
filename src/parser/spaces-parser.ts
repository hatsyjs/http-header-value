import { HthvDelimiter } from '../hthv-delimiter';
import type { ParserConfig } from './parser-config';
import type { ParserInput } from './parser-input';

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
