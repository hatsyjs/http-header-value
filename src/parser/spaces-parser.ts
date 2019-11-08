/**
 * @internal
 */
import { HthvDelimiter } from '../hthv-delimiter';
import { ParserConfig } from './parser-config';
import { ParserInput } from './parser-input';

export function spacesParser(config: ParserConfig): (input: ParserInput) => boolean {
  return input => {

    const start = input.i;

    do {

      const c = input.s[input.i];

      if (!(config.delimiterOf(c) & HthvDelimiter.Space)) {
        break;
      }
      input.i++;
    } while (input.i < input.s.length);

    return input.i !== start;
  };
}
