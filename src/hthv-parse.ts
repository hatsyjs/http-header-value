/**
 * @module http-header-value
 */
import { Delimiter, DelimiterKind, detectDelimiterKind } from './delimiters.impl';
import { HthvExtraItem, HthvItem, HthvItemType, HthvParamItem } from './hthv-item';
import { hthvItem } from './hthv-partial.impl';

// tslint:disable-next-line:max-line-length
const datePattern = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d\d (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d\d\d\d \d\d:\d\d:\d\d GMT/;

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

export function hthvParse(input: string): HthvItem[] {

  const result: HthvItem[] = [];
  let index = 0;
  let delimiterKind: DelimiterKind;

  // noinspection StatementWithEmptyBodyJS
  while (parseTopLevelItem()); // tslint:disable-line

  return result;

  function parseTopLevelItem(): boolean {
    return index < input.length && (
        parseSpace()
        || parseComma()
        || parseParam(param => {
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
        || parseItem(item => result.push(item))
    );
  }

  function parseSpace(): boolean {

    const c = input[index];

    if (c === ' ' || c === '\t') {
      index++;
      return true;
    }

    return false;
  }

  function parseComma(): boolean {
    if (input[index] === ',') {
      index++;
      return true;
    }
    return false;
  }

  function parseParam(out: (param: HthvParamItem) => void): boolean {
    if (input[index] !== ';') {
      return false;
    }

    ++index;
    // noinspection StatementWithEmptyBodyJS
    while (parseSpace()); // tslint:disable-line:curly

    return parseItem(out as any, { tagged: false });
  }

  function parseItem(
      out: (param: HthvItem<any, any, any>) => void,
      {
        named = true,
        tagged = true,
        extra = true,
        next = nextInItem,
      }: {
        named?: boolean,
        tagged?: boolean,
        extra?: boolean,
        next?: () => string,
      } = {}
  ): boolean {

    let name = '';
    let type: HthvItemType = 'raw';
    let tag: string | undefined;
    let value: string | undefined;

    while (index < input.length) {

      const c = next();

      if (delimiterKind) {
        if (delimiterKind === Delimiter.Record) {
          break;
        }
        if (value == null) {
          if (delimiterKind === Delimiter.Eq) {
            value = name ? '' : c;
            ++index;
            continue;
          }
          if (c === '"') {
            if (tagged || !name) {
              parseQuoted(v => {
                if (name) {
                  type = 'tagged-string';
                  tag = name;
                } else {
                  type = 'quoted-string';
                }
                name = '';
                value = v;
              });
            }
            break;
          }
          value = name;
          name = '';
        } else if (c === '"') {
          if (tagged || !value) {
            parseQuoted(v => {
              if (value) {
                type = 'tagged-string';
                tag = value;
              } else {
                type = 'quoted-string';
              }
              value = v;
            });
          }
          break;
        }
      }

      if (value == null) {
        if (!name && parseDateTime(v => value = v)) {
          type = 'date-time';
          break;
        }
        if (named) {
          name += c;
        } else {
          value = c;
        }
      } else if (!value && parseDateTime(v => value = v)) {
        type = 'date-time';
        break;
      } else {
        value += c;
      }

      ++index;
    }

    let item: HthvItem<any, any>;

    if (value == null) {
      if (!name) {
        return false;
      }
      item = hthvItem({ $: type, v: name });
    } else {
      item = hthvItem({ $: type, n: name || undefined, t: tag, v: value });
    }

    if (extra) {
      // noinspection StatementWithEmptyBodyJS
      while (parseItem(
          extraItem => item.x.push(extraItem as HthvExtraItem),
          { tagged: false, named: false, extra: false }
      )) ; // tslint:disable-line:curly
    }

    out(item);

    return true;
  }

  function parseDateTime(out: (value: string) => void): boolean {
    input = input.substring(index);
    index = 0;
    if (input.match(datePattern)) {
      out(input.substring(index, index += 29));
      return true;
    }
    return false;
  }

  function parseQuoted(out: (value: string) => void): boolean {

    let unquoted = '';

    ++index;
    for (; index < input.length; ++index) {

      const c = input[index];

      switch (c) {
        case '\\':

          const next = input[++index];

          if (next) {
            unquoted += next;
          } else {
            unquoted += c;
          }

          break;
        case '"':
          ++index;
          out(unquoted);
          return true;
        default:
          unquoted += c;
      }
    }

    out(unquoted);

    return true;
  }

  function nextInItem(): string {

    const c = input[index];

    delimiterKind = detectDelimiterKind(c);
    if (delimiterKind) {
      if (c === '=') {
        delimiterKind = Delimiter.Eq;
      }
    }

    return c;
  }

}
