/**
 * @module http-header-value
 */
import { HthvItem } from './hthv-item';
import { HthvParser, HthvParserConfig } from './hthv-parser';
import { hthvItem } from './hthv-partial.impl';
import {
  addParam,
  buildParserConfig,
  commentParser,
  commentParserConfig,
  defaultParserConfig,
  itemDelimitParser,
  itemParser,
  paramParser,
  ParserInput,
} from './parser';

/**
 * Creates and configures new HTTP header value parser.
 *
 * @param config  New parser configuration.
 *
 * @returns New HTTP header value parser function.
 */
export function newHthvParser(config?: HthvParserConfig): HthvParser {

  const parserConfig = config ? buildParserConfig(config.delimit) : defaultParserConfig;
  const parseItemDelimit = itemDelimitParser(parserConfig);
  const parseParam = paramParser(parserConfig);
  const parseItem = itemParser(parserConfig);
  const parseComment = commentParser(commentParserConfig);

  return headerValue => {

    const result: HthvItem[] = [];
    const input: ParserInput = { i: 0, s: headerValue };

    // noinspection StatementWithEmptyBodyJS
    while (parseTopLevelItem()); // tslint:disable-line

    return result;

    function parseTopLevelItem(): boolean {
      return input.i < input.s.length && (
          parseItemDelimit(input)
          || parseParam(
              input,
              param => {
                if (!result.length) {
                  result.push(hthvItem({ $: 'raw', v: '' }));
                }
                addParam(result[result.length - 1], param);
              },
          )
          || parseComment(input, item => result.push(item))
          || parseItem(input, item => result.push(item))
      );
    }
  };
}
