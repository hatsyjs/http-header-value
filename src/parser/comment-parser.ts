import { HthvDelimiter } from '../hthv-delimiter.js';
import { HthvItem } from '../hthv-item.js';
import { hthvItem } from '../impl/hthv-item.js';
import { addParam } from './add-param.js';
import { ItemParserConfig, itemParser } from './item-parser.js';
import { nextInComment } from './next-in-comment.js';
import { paramParser } from './param-parser.js';
import { ParserConfig } from './parser-config.js';
import { ParserInput } from './parser-input.js';
import { spacesParser } from './spaces-parser.js';

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
