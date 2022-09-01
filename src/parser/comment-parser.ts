import { HthvDelimiter } from '../hthv-delimiter';
import type { HthvItem } from '../hthv-item';
import { hthvItem } from '../impl';
import { addParam } from './add-param';
import { itemParser, ItemParserConfig } from './item-parser';
import { nextInComment } from './next-in-comment';
import { paramParser } from './param-parser';
import type { ParserConfig } from './parser-config';
import type { ParserInput } from './parser-input';
import { spacesParser } from './spaces-parser';

/**
 * @internal
 */
export function commentParser(
  config: ParserConfig,
): (input: ParserInput, out: (item: HthvItem) => void) => boolean {
  const { delimiterOf } = config;
  const skipSpaces = spacesParser(config);
  const commentParserConfig: ItemParserConfig = {
    next: nextInComment(config),
  };
  const parseItem = itemParser(config, commentParserConfig);
  const parseParam = paramParser(config, commentParserConfig);

  return (input, out) => {
    if (!(delimiterOf(input.s[input.i]) & HthvDelimiter.Comment)) {
      return false;
    }

    ++input.i;

    let result: HthvItem | undefined;

    // noinspection StatementWithEmptyBodyJS
    while (
      skipSpaces(input)
      || parseParam(input, param => {
        if (!result) {
          result = hthvItem({ $: 'raw', v: '' });
        }
        addParam(result, param);
      })
      || parseItem(input, item => (result = item))
    ); // eslint-disable-line curly

    ++input.i; // closing parent
    out(result || hthvItem({ $: 'raw', v: '' }));

    return true;
  };
}
