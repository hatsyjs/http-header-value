import { HthvDelimiter } from '../hthv-delimiter.js';
import type { ParserConfig } from './parser-config.js';
import type { ParserInput } from './parser-input.js';
import { spacesParser } from './spaces-parser.js';

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
