/**
 * @packageDocumentation
 * @module @hatsy/http-header-value
 */
import { HthvDelimiter } from './hthv-delimiter';
import { commentParserConfig, defaultParserConfig, ParserConfig } from './parser';

/**
 * Escapes a `string` to be included into [quoted-string](https://tools.ietf.org/html/rfc7230#section-3.2.6) within HTTP
 * header value.
 *
 * Replaces `\` with `\\`, and `"` with `\"`.
 *
 * @param string  A string to escape.
 *
 * @returns Escaped `string`.
 */
export function hthvEscapeQ(string: string): string {
  return escape(string, defaultParserConfig);
}

/**
 * Escapes a `string` to be included into [comment](https://tools.ietf.org/html/rfc7230#section-3.2.6) withing HTTP
 * header value.
 *
 * Replaces `\` with `\\`, `"` with `\"`, `(` with `\(`, and `)` with `\)`.
 *
 * According to [RFC7230] the sender should not escape a double quote in this case. However, it may be necessary
 * to distinguish between raw double quote and nested [quoted-string].
 *
 * [RFC7230]: https://tools.ietf.org/html/rfc7230
 * [quoted-string]: https://tools.ietf.org/html/rfc7230#section-3.2.6
 *
 * @param string  A string to escape.
 *
 * @returns Escaped `string`.
 */
export function hthvEscapeC(string: string): string {
  return escape(string, commentParserConfig);
}

function escape(string: string, config: ParserConfig): string {

  let escaped: undefined | string;

  for (let i = 0; i < string.length; ++i) {

    const c = string[i];

    if (config.delimiterOf(c) & HthvDelimiter.Escaped) {
      if (!escaped) {
        escaped = string.substring(0, i);
      }
      escaped += '\\' + c;
    } else if (escaped) {
      escaped += c;
    }
  }

  return escaped || string;
}
