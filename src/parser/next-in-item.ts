import { ParserConfig } from './parser-config';
import { ParserInput } from './parser-input';

/**
 * @internal
 */
export function nextInItem(config: ParserConfig): (input: ParserInput) => string {
  return input => {

    const c = input.s[input.i];

    input.d = config.delimiterOf(c);

    return c;
  };
}
