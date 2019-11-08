import { HthvDelimiter } from '../hthv-delimiter';
import { HthvParamItem } from '../hthv-item';
import { itemParser, ItemParserOpts } from './item-parser';
import { ParserConfig } from './parser-config';
import { ParserInput } from './parser-input';
import { skipSpaces } from './skip-spaces';

/**
 * @internal
 */
export function paramParser(
    config: ParserConfig,
    opts: ItemParserOpts = {},
): (input: ParserInput, out: (param: HthvParamItem) => void) => boolean {

  const parseItem = itemParser(config, { ...opts, tagged: false });

  return (input, out) => {
    if (!(config.delimiterOf(input.s[input.i]) & HthvDelimiter.Parameter)) {
      return false;
    }

    ++input.i;
    skipSpaces(input);

    return parseItem(input, out);
  };
}
