import { HthvParamItem } from '../hthv-item';
import { ItemParserOpts, parseItem } from './parse-item';
import { parseSpace } from './parse-space';
import { ParserInput } from './parser-input';

/**
 * @internal
 */
export function parseParam(
    input: ParserInput,
    out: (param: HthvParamItem) => void,
    opts: ItemParserOpts = {},
): boolean {
  if (input.s[input.i] !== ';') {
    return false;
  }

  ++input.i;
  // noinspection StatementWithEmptyBodyJS
  while (parseSpace(input)); // tslint:disable-line:curly

  return parseItem(input, out, { ...opts, tagged: false });
}
