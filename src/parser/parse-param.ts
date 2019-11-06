import { HthvParamItem } from '../hthv-item';
import { parseItem } from './parse-item';
import { parseSpace } from './parse-space';
import { ParserInput } from './parser-input';

/**
 * @internal
 */
export function parseParam(input: ParserInput, out: (param: HthvParamItem) => void): boolean {
  if (input.s[input.i] !== ';') {
    return false;
  }

  ++input.i;
  // noinspection StatementWithEmptyBodyJS
  while (parseSpace(input)); // tslint:disable-line:curly

  return parseItem(input, out, { tagged: false });
}
