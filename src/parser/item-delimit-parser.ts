import { HthvDelimiter } from '../hthv-delimiter';
import { ParserConfig } from './parser-config';
import { ParserInput } from './parser-input';
import { spacesParser } from './spaces-parser';

/**
 * @internal
 */
export function itemDelimitParser(config: ParserConfig): (input: ParserInput) => boolean {

  const skipSpaces = spacesParser(config);

  return input => {
    if (config.delimiterOf(input.s[input.i]) & HthvDelimiter.Item) {
      input.i++;
      skipSpaces(input);
      return true;
    }
    return false;
  };
}
