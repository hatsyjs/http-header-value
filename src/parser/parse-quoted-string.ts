/**
 * @internal
 */
import { ParserInput } from './parser-input';

export function parseQuotedString(input: ParserInput, out: (value: string) => void): boolean {

  let unquoted = '';

  ++input.i;
  for (; input.i < input.s.length; ++input.i) {

    const c = input.s[input.i];

    switch (c) {
      case '\\':

        const next = input.s[++input.i];

        if (next) {
          unquoted += next;
        } else {
          unquoted += c;
        }

        break;
      case '"':
        ++input.i;
        out(unquoted);
        return true;
      default:
        unquoted += c;
    }
  }

  out(unquoted);

  return true;
}
