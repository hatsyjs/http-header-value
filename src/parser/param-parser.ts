import { HthvParamItem } from '../hthv-item';
import { itemParser, ItemParserOpts } from './item-parser';
import { skipSpace } from './skip-space';
import { ParserConfig } from './parser-config';
import { ParserInput } from './parser-input';

/**
 * @internal
 */
export function paramParser(
    config: ParserConfig,
    opts: ItemParserOpts = {},
): (input: ParserInput, out: (param: HthvParamItem) => void) => boolean {

  const parseItem = itemParser(config, { ...opts, tagged: false });

  return (input, out) => {
    if (input.s[input.i] !== ';') {
      return false;
    }

    ++input.i;
    // noinspection StatementWithEmptyBodyJS
    while (skipSpace(input)) ; // tslint:disable-line:curly

    return parseItem(input, out);
  };
}
