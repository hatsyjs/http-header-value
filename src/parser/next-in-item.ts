import { ParserConfig } from './parser-config';
import { ParserInput } from './parser-input';

/**
 * @internal
 */
export function nextInItem({ delimiterOf }: ParserConfig): (input: ParserInput) => string {
  return input => {

    const c = input.s[input.i];

    input.d = delimiterOf(c);

    return c;
  };
}
