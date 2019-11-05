/**
 * @module http-header-value
 */
import { DelimiterKind, detectDelimiterKind } from './delimiters.impl';
import { hthvEscapeQ } from './hthv-escape';
import { HthvItem } from './hthv-item';
import { PartialItem } from './partial-item.impl';

// tslint:disable-next-line:max-line-length
const datePattern = /^(Mon|Tue|Wev|Thu|Fri|Sat|Sun), \d\d (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d\d\d\d \d\d:\d\d:\d\d GMT/;

/**
 * Parses HTP header value.
 *
 * Splits the value onto {@link HthvItem items}.
 *
 * Handles date/time in {@link https://tools.ietf.org/html/rfc7231#section-7.1.1.1 INF-fixdate} format only.
 *
 * Treats illegal characters as ASCII letters.
 *
 * @param value  HTTP header value to parse.
 *
 * @returns An array of comma- and space- separated value items.
 */
export function hthvParse(value: string): HthvItem[] {

  const result: HthvItem[] = [];
  let index = 0;

  // noinspection StatementWithEmptyBodyJS
  while (parseItem()); // tslint:disable-line

  return result;

  function addItem({ n, v, p = {} }: PartialItem) {
    result.push({ n, v, p });
  }

  function parseItem(): boolean {
    return index < value.length && (
        parseSpace()
        || parseComma()
        || parseParam()
        || parseDateTime(v => addItem({ v }))
        || parseNameAndValue((v, n) => addItem({ n, v }))
    );
  }

  function parseSpace(): boolean {

    const c = value[index];

    if (c === ' ' || c === '\t') {
      index++;
      return true;
    }

    return false;
  }

  function parseComma(): boolean {
    if (value[index] === ',') {
      index++;
      return true;
    }
    return false;
  }

  function parseParam(): boolean {
    if (value[index] !== ';') {
      return false;
    }

    ++index;
    // noinspection StatementWithEmptyBodyJS
    while (parseSpace()); // tslint:disable-line:curly

    return parseNameAndValue((v, n) => {
      if (!result.length) {
        addItem({ v: '' });
      }

      const { p } = result[result.length - 1];

      if (n) {
        p[n] = v;
      } else {
        p[v] = true;
      }
    });
  }

  function parseDateTime(out: (value: string) => void): boolean {
    value = value.substring(index);
    index = 0;
    if (value.match(datePattern)) {
      out(value.substring(index, index += 29));
      return true;
    }
    return false;
  }

  function parseQuoted(out: (value: string) => void): boolean {
    if (value[index] !== '"') {
      return false;
    }

    let unquoted = '';

    ++index;
    for (; index < value.length; ++index) {

      const c = value[index];

      switch (c) {
        case '\\':

          const next = value[++index];

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

  function parseNameAndValue(out: (v: string, n?: string) => void): boolean {

    let isName = true;
    let name = '';
    let val = '';
    let eq = false;
    let quotes = false;
    let unquoted = false;

    while (index < value.length) {

      const c = value[index];
      const delimiterKind = detectDelimiterKind(c);

      if (delimiterKind) {
        if (delimiterKind === DelimiterKind.Item) { // item end
          break;
        }
        if (isName) {
          isName = false;
          if (parseQuoted(v => {
            val = v;
            unquoted = true;
          })) {
            quotes = true;
            continue;
          }
          if (c === '=') { // name/value pair
            if (name) {
              eq = true;
            } else {
              val = c;
            }
            ++index;
            continue;
          }
          // not a valid token
          val = name;
          name = '';
        } else if (parseQuoted(v => {
          if (!val) {
            val = v;
            unquoted = true;
          } else if (!eq && !quotes) {
            name = val;
            val = v;
            unquoted = true;
          } else if (unquoted) {
            if (!eq && name) {
              val = `${name}"${hthvEscapeQ(val)}""${hthvEscapeQ(v)}"`;
              name = '';
            } else {
              val = `"${hthvEscapeQ(val)}""${hthvEscapeQ(v)}"`;
            }
            unquoted = false;
          } else {
            val += `"${hthvEscapeQ(v)}"`;
          }
        })) {
          quotes = true;
          continue;
        }
      }

      if (isName) {
        name += c;
      } else if (!val && parseDateTime(v => {
        val = v;
      })) {
        break;
      } else if (unquoted) {
        if (!eq && name) {
          val = `${name}"${hthvEscapeQ(val)}"${c}`;
          name = '';
        } else {
          val = `"${hthvEscapeQ(val)}"${c}`;
        }
        unquoted = false;
      } else {
        val += c;
      }

      ++index;
    }

    if (isName) {
      out(name);
    } else {
      out(val, name || undefined);
    }

    return true;
  }
}
