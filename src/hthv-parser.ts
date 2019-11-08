/**
 * @module http-header-value
 */
import { HthvDelimiterChar } from './hthv-delimiter';
import { HthvItem } from './hthv-item';
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
  parseNone,
  ParserInput,
} from './parser';

/**
 * HTTP header value parser signature.
 *
 * Splits the value onto {@link HthvItem items}.
 *
 * @typeparam N  Whether parsed items have {@link HthvItem.n names}.
 * @typeparam T  Whether parsed items have {@link HthvItem.t tags}.
 * @typeparam P  Whether parsed items have {@link HthvItem.p parameters}.
 */
export type HthvParser<
    N extends 'has-name' | 'no-name' = 'has-name' | 'no-name',
    T extends 'has-tag' | 'no-tag' = 'has-tag' | 'no-tag',
    P extends 'has-params' | 'no-params' = 'has-params' | 'no-params'> =
/**
 * @param value  HTTP header value to parse.
 *
 * @returns An array of parsed value items.
 */
    (this: void, value: string) => HthvItem<N, T, P>[];

/**
 * A configuration of HTTP header value parser.
 *
 * This is used to {@link newHthvParser configure new parser}.
 */
export interface HthvParserConfig {

  /**
   * Delimits configuration.
   *
   * An object literal with {@link HthvDelimiterChar supported delimiter characters} as keys
   * and corresponding {@link HthvDelimiter delimiters} as values.
   */
  readonly delimit?: HthvDelimitConfig;

  /**
   * Whether to parse comments.
   *
   * `false` by default.
   */
  readonly comments?: boolean;

}

/**
 * Delimits configuration for HTTP header value parser.
 *
 * This is an object literal with {@link HthvDelimiterChar supported delimiter characters} as keys
 * and corresponding {@link HthvDelimiter delimiters} as values.
 *
 * The default delimiter configuration is used for omitted characters.
 */
export type HthvDelimitConfig = { readonly [char in HthvDelimiterChar]?: number };

/**
 * Creates and configures new HTTP header value parser.
 *
 * @param config  New parser configuration.
 *
 * @returns New HTTP header value parser function.
 */
export function newHthvParser(config?: HthvParserConfig): HthvParser {

  const parserConfig = config ? buildParserConfig(config) : defaultParserConfig;
  const parseItemDelimit = itemDelimitParser(parserConfig);
  const parseParam = paramParser(parserConfig);
  const parseItem = itemParser(parserConfig);
  const parseComment = config?.comments ? commentParser(commentParserConfig) : parseNone;

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
