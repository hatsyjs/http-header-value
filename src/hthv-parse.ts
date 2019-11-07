/**
 * @module http-header-value
 */
import { newHthvParser } from './new-hthv-parser';

/**
 * Parses HTTP header value.
 *
 * Splits the value onto {@link HthvItem items}.
 *
 * Recognizes top-level comments only. Not nested comments.
 *
 * Handles date/time values in [IMF-fixdate] format only.
 *
 * Treats illegal characters as ASCII letters.
 *
 * [IMF-fixdate]: https://tools.ietf.org/html/rfc7231#section-7.1.1.1
 *
 * @param value  HTTP header value to parse.
 *
 * @returns An array of comma- or space- separated value items.
 */
export const hthvParse = /*#__PURE__*/ newHthvParser();
