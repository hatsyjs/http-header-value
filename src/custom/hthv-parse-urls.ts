/**
 * @module http-header-value
 */
import { HthvDelimiter } from '../hthv-delimiter';
import { HthvItem } from '../hthv-item';
import { newHthvParser } from '../new-hthv-parser';

/**
 * Parses HTTP header value containing URL(s) without parameters.
 *
 * `,`, `;`, and `=` symbols can be part of URL. This function returns multiple items only if URLs are space-separated.
 *
 * This is particularly useful to parse headers, such as:
 * - `Location`,
 * - `Content-Location`.
 *
 * @param value  HTTP header value to parse.
 *
 * @returns An array of space-separated value items without parameters.
 */
export const hthvParseURLs: (this: void, value: string) => HthvItem<'no-name', 'no-tag', 'no-params'>[] =
    /*#__PURE__*/ newHthvParser(
    {
      delimit: {
        ',': HthvDelimiter.NonToken,
        ';': HthvDelimiter.NonToken,
        '=': HthvDelimiter.NonToken,
      },
    }
) as (value: string) => HthvItem<'no-name', 'no-tag', 'no-params'>[];
