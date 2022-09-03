import { parseNone } from './parse-none';
import type { ParserConfig } from './parser-config';
import type { ParserInput } from './parser-input';

const datePattern =
  /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d\d (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d\d\d\d \d\d:\d\d:\d\d GMT/;

/**
 * @internal
 */
export function dateTimeParser({
  dateTime,
}: ParserConfig): (input: ParserInput, out: (v: string) => void) => boolean {
  return dateTime ? parseDateTime : parseNone;
}

function parseDateTime(input: ParserInput, out: (value: string) => void): boolean {
  input.s = input.s.substring(input.i);
  input.i = 0;
  if (datePattern.test(input.s)) {
    out(input.s.substring(input.i, (input.i += 29)));

    return true;
  }

  return false;
}
