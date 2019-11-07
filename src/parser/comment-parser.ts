import { HthvItem } from '../hthv-item';
import { hthvItem } from '../hthv-partial.impl';
import { addParam } from './add-param';
import { itemParser, ItemParserOpts } from './item-parser';
import { nextInComment } from './next-in-comment';
import { paramParser } from './param-parser';
import { skipSpace } from './skip-space';
import { ParserConfig } from './parser-config';
import { ParserInput } from './parser-input';

/**
 * @internal
 */
export function commentParser(config: ParserConfig): (input: ParserInput, out: (item: HthvItem) => void) => boolean {

  const commentParserOpts: ItemParserOpts = {
    next: nextInComment(config),
  };
  const parseItem = itemParser(config, commentParserOpts);
  const parseParam = paramParser(config, commentParserOpts);

  return (input, out) => {
    if (input.s[input.i] !== '(') {
      return false;
    }

    ++input.i;

    let result: HthvItem | undefined;

    // noinspection StatementWithEmptyBodyJS
    while (
        skipSpace(input)
        || parseParam(
            input,
            param => {
              if (!result) {
                result = hthvItem({ $: 'raw', v: '' });
              }
              addParam(result, param);
            }
        )
        || parseItem(input, item => result = item)
        ) ; /* tslint:disable-line:curly */

    ++input.i; // closing parent
    out(result || hthvItem({ $: 'raw', v: '' }));

    return true;
  };
}
