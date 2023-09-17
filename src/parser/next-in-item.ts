import type { ParserConfig } from './parser-config.js';
import type { ParserInput } from './parser-input.js';

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
