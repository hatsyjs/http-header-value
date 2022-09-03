import { HthvDelimiter } from '../hthv-delimiter';
import { HthvParser, newHthvParser } from '../hthv-parser';

/**
 * Parses HTTP header value containing URI(s) without parameters.
 *
 * `,`, `;`, '(', ')', and `=` symbols can be part of URI. This function returns multiple items only if URIs are
 * space-separated.
 *
 * This is particularly useful when parsing headers such as:
 * - `Content-Location`
 * - `Location`
 * - `Referef`
 *
 * @param value - HTTP header value to parse.
 *
 * @returns An array of space-separated value items without parameters.
 */
export const hthvParseURIs: HthvParser<'no-name', 'no-tag', 'no-params'> =
  /*#__PURE__*/ newHthvParser({
    delimit: {
      ',': HthvDelimiter.NonToken,
      ';': HthvDelimiter.NonToken,
      '=': HthvDelimiter.NonToken,
    },
  }) as HthvParser<'no-name', 'no-tag', 'no-params'>;
