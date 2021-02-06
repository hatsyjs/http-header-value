import type { HthvDelimiterChar } from './hthv-delimiter';
import type { HthvItem } from './hthv-item';
import { hthvItem } from './impl';
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
 * @typeParam TNameMode - Whether parsed items have {@link HthvItem.n names}.
 * @typeParam TTagMode - Whether parsed items have {@link HthvItem.t tags}.
 * @typeParam TParamsMode - Whether parsed items have {@link HthvItem.p parameters}.
 */
export type HthvParser<
    TNameMode extends 'has-name' | 'no-name' = 'has-name' | 'no-name',
    TTagMode extends 'has-tag' | 'no-tag' = 'has-tag' | 'no-tag',
    TParamsMode extends 'has-params' | 'no-params' = 'has-params' | 'no-params'> =
/**
 * @param value - HTTP header value to parse.
 *
 * @returns An array of parsed value items.
 */
    (this: void, value: string) => HthvItem<TNameMode, TTagMode, TParamsMode>[];

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
   * Whether to parse date/time values.
   *
   * @default `false`
   */
  readonly dateTime?: boolean;

  /**
   * Whether to parse comments.
   *
   * @default `false`.
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
 * @param config - New parser configuration.
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
    while (parseTopLevelItem()); // eslint-disable-line curly

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
