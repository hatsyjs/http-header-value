import { HthvDelimiter } from '../hthv-delimiter';
import type { ParserConfig } from './parser-config';
import type { ParserInput } from './parser-input';
import { spacesParser } from './spaces-parser';

/**
 * @internal
 */
export function itemDelimitParser(config: ParserConfig): (input: ParserInput) => boolean {

  const { delimiterOf } = config;
  const skipSpaces = spacesParser(config);

  return input => {
    if (delimiterOf(input.s[input.i]) & HthvDelimiter.Item) {
      input.i++;
      skipSpaces(input);

      return true;
    }

    return false;
  };
}
