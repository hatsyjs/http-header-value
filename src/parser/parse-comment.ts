import { HthvItem } from '../hthv-item';
import { hthvItem } from '../hthv-partial.impl';
import { addParam } from './add-param';
import { nextInComment } from './next-in-comment';
import { ItemParserOpts, parseItem } from './parse-item';
import { parseParam } from './parse-param';
import { parseSpace } from './parse-space';
import { ParserInput } from './parser-input';

const commentParserOpts: ItemParserOpts = {
  next: nextInComment,
};

/**
 * @internal
 */
export function parseComment(input: ParserInput, out: (item: HthvItem) => void): boolean {
  if (input.s[input.i] !== '(') {
    return false;
  }

  ++input.i;

  let result: HthvItem | undefined;

  // noinspection StatementWithEmptyBodyJS
  while (
      parseSpace(input)
      || parseParam(
          input,
          param => {
            if (!result) {
              result = hthvItem({ $: 'raw', v: ''});
            }
            addParam(result, param);
          },
          commentParserOpts,
      )
      || parseItem(input, item => result = item, commentParserOpts)
      ); /* tslint:disable-line:curly */

  ++input.i; // closing parent
  out(result || hthvItem({ $: 'raw', v: ''}));

  return true;
}
