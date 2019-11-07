/**
 * @module http-header-value
 */
import { HthvDelimiterChar } from './hthv-delimiter';
import { HthvItem } from './hthv-item';

/**
 * HTTP header value parser signature.
 *
 * Splits the value onto {@link HthvItem items}.
 */
export type HthvParser =
/**
 * @param value  HTTP header value to parse.
 *
 * @returns An array of parsed value items.
 */
    (this: void, value: string) => HthvItem[];

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
