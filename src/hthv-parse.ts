/**
 * @packageDocumentation
 * @module @hatsy/http-header-value
 */
import { HthvParser, newHthvParser } from './hthv-parser';

/**
 * Parses HTTP header value.
 *
 * Splits the value onto {@link HthvItem items}.
 *
 * Parser is configured with default {@link HthvParserConfig config}.
 *
 * Does not recognize comments or date/time values.
 *
 * Treats illegal characters as ASCII letters.
 *
 * @param value - HTTP header value to parse.
 *
 * @returns An array of comma- or space- separated value items.
 */
export const hthvParse: HthvParser = (/*#__PURE__*/ newHthvParser());

/**
 * Parses HTTP header value that may contain date/time.
 *
 * Splits the value onto {@link HthvItem items}.
 *
 * Parser is configured with default config except {@link HthvParserConfig.dateTime date/time parsing enabled}.
 *
 * Does not recognize comments.
 *
 * Handles date/time values in [IMF-fixdate] format only.
 *
 * Treats illegal characters as ASCII letters.
 *
 * [IMF-fixdate]: https://tools.ietf.org/html/rfc7231#section-7.1.1.1
 *
 * @param value - HTTP header value to parse.
 *
 * @returns An array of comma- or space- separated value items.
 */
export const hthvParseDT: HthvParser = (/*#__PURE__*/ newHthvParser({ dateTime: true }));
