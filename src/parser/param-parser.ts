import { HthvDelimiter } from '../hthv-delimiter.js';
import type { HthvParamItem } from '../hthv-item.js';
import { itemParser, ItemParserConfig } from './item-parser.js';
import type { ParserConfig } from './parser-config.js';
import type { ParserInput } from './parser-input.js';
import { spacesParser } from './spaces-parser.js';

/**
 * @internal
 */
export function paramParser(
  config: ParserConfig,
  opts: ItemParserConfig = {},
): (input: ParserInput, out: (param: HthvParamItem) => void) => boolean {
  const { delimiterOf } = config;
  const skipSpaces = spacesParser(config);
  const parseItem = itemParser(config, { ...opts, tagged: false });

  return (input, out) => {
    if (!(delimiterOf(input.s[input.i]) & HthvDelimiter.Parameter)) {
      return false;
    }

    ++input.i;
    skipSpaces(input);

    return parseItem(input, out);
  };
}
