/**
 * @packageDocumentation
 * @module @hatsy/http-header-value
 */
import { HthvDelimiter } from './hthv-delimiter';
import { defaultParserConfig } from './parser';

/**
 * Conditionally encloses HTTP header value or its part into double quotes.
 *
 * Quotes will be added if delimiter or special character is present in input `string`, or the input `string` is empty.
 * {@link hthvEscapeQ Escapes} `"` and `\` symbols.
 *
 * @param string - A string to quote.
 *
 * @returns Either a string enclosed in double quotes, or original `string` if there is no need to quote it.
 */
export function hthvQuote(string: string): string {
  if (!string) {
    return '""';
  }

  const { delimiterOf } = defaultParserConfig;
  let escaped: undefined | string;
  let quote = false;

  for (let i = 0; i < string.length; ++i) {

    const c = string[i];
    const delimiter = delimiterOf(c);

    if (delimiter) {
      if (delimiter & HthvDelimiter.Escaped) {
        if (!escaped) {
          escaped = string.substring(0, i);
        }
        escaped += '\\' + c;
      }
      quote = true;
    } else if (escaped) {
      escaped += c;
    }
  }

  return quote ? `"${escaped || string}"` : string;
}
