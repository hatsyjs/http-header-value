/**
 * @internal
 */
import { ParserInput } from './parser-input';

export function skipSpace(input: ParserInput): boolean {

  const c = input.s[input.i];

  if (c === ' ' || c === '\t') {
    input.i++;
    return true;
  }

  return false;
}
