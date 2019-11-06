/**
 * @module http-header-value
 */
import { HthvItem } from './hthv-item';
import { hthvItem } from './hthv-partial.impl';
import { parseComma, parseItem, parseParam, ParserInput, parseSpace } from './parser';

/**
 * Parses HTP header value.
 *
 * Splits the value onto {@link HthvItem items}.
 *
 * Handles date/time values in [IMF-fixdate] format only.
 *
 * Treats illegal characters as ASCII letters.
 *
 * [IMF-fixdate]: https://tools.ietf.org/html/rfc7231#section-7.1.1.1
 *
 * @param value  HTTP header value to parse.
 *
 * @returns An array of comma- and space- separated value items.
 */
export function hthvParse(value: string): HthvItem[];

export function hthvParse(headerValue: string): HthvItem[] {

  const result: HthvItem[] = [];
  const input: ParserInput = { i: 0, s: headerValue };

  // noinspection StatementWithEmptyBodyJS
  while (parseTopLevelItem()); // tslint:disable-line

  return result;

  function parseTopLevelItem(): boolean {
    return input.i < input.s.length && (
        parseSpace(input)
        || parseComma(input)
        || parseParam(input, param => {
          if (!result.length) {
            result.push(hthvItem({ $: 'raw', v: '' }));
          }

          const key = param.n || param.v;
          const { p, pl } = result[result.length - 1];
          const prev = p[key];

          if (!prev || !prev.n && param.n) {
            p[key] = param;
          }
          pl.push(param);
        })
        || parseItem(input, item => result.push(item))
    );
  }
}
