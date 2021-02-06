import { HthvDelimiter } from '../hthv-delimiter';
import { HthvParser, newHthvParser } from '../hthv-parser';

/**
 * Parses semicolon-separated HTTP header value items.
 *
 * Treats ';' just like ','.
 *
 * This is particularly useful when parsing a `Cookies` header.
 *
 * The parsed items won't have any parameters.
 */
export const hthvParseSemiSep: HthvParser<'has-name' | 'no-name', 'has-tag' | 'no-tag', 'no-params'> = (
    /*#__PURE__*/ newHthvParser({
      delimit: {
        ';': HthvDelimiter.NonToken | HthvDelimiter.Item,
      },
    }) as HthvParser<'has-name' | 'no-name', 'has-tag' | 'no-tag', 'no-params'>
);
