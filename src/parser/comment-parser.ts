import { HthvDelimiter } from '../hthv-delimiter';
import { HthvItem } from '../hthv-item';
import { hthvItem } from '../hthv-partial.impl';
import { addParam } from './add-param';
import { itemParser, ItemParserOpts } from './item-parser';
import { nextInComment } from './next-in-comment';
import { paramParser } from './param-parser';
import { spacesParser } from './spaces-parser';
import { ParserConfig } from './parser-config';
import { ParserInput } from './parser-input';

/**
 * @internal
 */
export function commentParser(config: ParserConfig): (input: ParserInput, out: (item: HthvItem) => void) => boolean {

  const skipSpaces = spacesParser(config);
  const commentParserOpts: ItemParserOpts = {
    next: nextInComment(config),
  };
  const parseItem = itemParser(config, commentParserOpts);
  const parseParam = paramParser(config, commentParserOpts);

  return (input, out) => {
    if (!(config.delimiterOf(input.s[input.i]) & HthvDelimiter.Comment)) {
      return false;
    }

    ++input.i;

    let result: HthvItem | undefined;

    // noinspection StatementWithEmptyBodyJS
    while (
        skipSpaces(input)
        || parseParam(
            input,
            param => {
              if (!result) {
                result = hthvItem({ $: 'raw', v: '' });
              }
              addParam(result, param);
            },
        )
        || parseItem(input, item => result = item)
        ) ; /* tslint:disable-line:curly */

    ++input.i; // closing parent
    out(result || hthvItem({ $: 'raw', v: '' }));

    return true;
  };
}
