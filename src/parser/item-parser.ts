import { HthvDelimiter } from '../hthv-delimiter';
import type { HthvExtraItem, HthvItem, HthvItemType } from '../hthv-item';
import { hthvItem } from '../impl';
import { angleBracketsParser } from './angle-brackets-parser';
import { dateTimeParser } from './date-time-parser';
import { nextInItem } from './next-in-item';
import { parseNone } from './parse-none';
import type { ParserConfig } from './parser-config';
import type { ParserInput } from './parser-input';
import { quotedStringParser } from './quoted-string-parser';

/**
 * @internal
 */
export interface ItemParserConfig {
  named?: boolean | undefined;
  tagged?: boolean | undefined;
  extra?: boolean | undefined;
  next?: ((this: void, input: ParserInput) => string) | undefined;
}

/**
 * @internal
 */
export function itemParser(
    config: ParserConfig,
    {
      named = true,
      tagged = true,
      extra = true,
      next = nextInItem(config),
    }: ItemParserConfig = {},
): (input: ParserInput, out: (param: HthvItem<any, any, any>) => void) => boolean {

  const parseAngleBrackets = angleBracketsParser(config);
  const parseDateTime = dateTimeParser(config);
  const parseQuotedString = quotedStringParser(config);
  const parseExtra = extra ? itemParser(config, { next, tagged: false, named: false, extra: false }) : parseNone;

  return (input, out) => {

    let name = '';
    let type: HthvItemType = 'raw';
    let tag: string | undefined;
    let value: string | undefined;

    while (input.i < input.s.length) {

      const c = next(input);

      if (input.d) {
        if (input.d & (HthvDelimiter.Item | HthvDelimiter.Parameter)) {
          break;
        }
        if (value == null) {
          if (input.d & HthvDelimiter.Assignment) {
            value = name ? '' : c;
            ++input.i;

            continue;
          }
          if (input.d & HthvDelimiter.Quote) {
            if (tagged || !name) {
              parseQuotedString(input, v => {
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
          if (!name && parseAngleBrackets(input, v => {
            type = 'angle-bracketed-string';

            value = v;
          })) {
            break;
          }
          value = name;
          name = '';
        } else if (input.d & HthvDelimiter.Quote) {
          if (tagged || !value) {
            parseQuotedString(input, v => {
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
        } else if (!value && parseAngleBrackets(input, v => {
          type = 'angle-bracketed-string';

          value = v;
        })) {
          break;
        }
      }

      if (value == null) {
        if (!name && parseDateTime(input, v => value = v)) {
          type = 'date-time';

          break;
        }
        if (named) {
          name += c;
        } else {
          value = c;
        }
      } else if (!value && parseDateTime(input, v => value = v)) {
        type = 'date-time';

        break;
      } else {
        value += c;
      }

      ++input.i;
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

    // noinspection StatementWithEmptyBodyJS
    while (parseExtra(input, extraItem => item.x.push(extraItem as HthvExtraItem))); // eslint-disable-line curly

    out(item);

    return true;
  };
}
