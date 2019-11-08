import { HthvDelimiter } from '../hthv-delimiter';
import { ParserConfig } from './parser-config';
import { ParserInput } from './parser-input';
import { skipSpaces } from './skip-spaces';

/**
 * @internal
 */
export function itemDelimitParser(config: ParserConfig): (input: ParserInput) => boolean {
  return input => {
    if (config.delimiterOf(input.s[input.i]) & HthvDelimiter.Item) {
      input.i++;
      skipSpaces(input);
      return true;
    }
    return false;
  };
}
