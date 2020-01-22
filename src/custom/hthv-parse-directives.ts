/**
 * @packageDocumentation
 * @module http-header-value
 */
import { HthvDelimiter } from '../hthv-delimiter';
import { HthvParser, newHthvParser } from '../hthv-parser';

/**
 * Parses HTTP header values containing directives.
 *
 * Directives are parameterized items using spaces instead of semicolons to delimit parameters. While semicolons and
 * colons are used to delimit items.
 *
 * This is particularly useful when parsing headers such as:
 * - `Content-Security-Policy`
 * - `Content-Security-Policy-Report-Only`
 * - `Feature-Policy`
 * - `Via`
 * - `Warning`
 *
 * @param value  HTTP header value to parse.
 *
 * @returns An array of comma-separated value items with space-separated parameters.
 */
export const hthvParseDirectives: HthvParser = (/*#__PURE__*/ newHthvParser({
  delimit: {
    ' ': HthvDelimiter.NonToken | HthvDelimiter.Space | HthvDelimiter.Parameter,
    '\t': HthvDelimiter.NonToken | HthvDelimiter.Space | HthvDelimiter.Parameter,
    ';': HthvDelimiter.NonToken | HthvDelimiter.Item,
  },
}));
