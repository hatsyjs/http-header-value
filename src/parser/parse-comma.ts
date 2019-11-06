/**
 * @internal
 */
import { ParserInput } from './parser-input';

/**
 * @internal
 */
export function parseComma(input: ParserInput): boolean {
  if (input.s[input.i] === ',') {
    input.i++;
    return true;
  }
  return false;
}
