/**
 * @internal
 */
import { ParserInput } from './parser-input';

export function skipSpaces(input: ParserInput): boolean {

  const start = input.i;

  for (; ;) {

    const c = input.s[input.i];

    if (c !== ' ' && c !== '\t') {
      break;
    }
    input.i++;
  }

  return input.i !== start;
}
