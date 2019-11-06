import { DelimiterKind } from './delimiters';

/**
 * @internal
 */
export interface ParserInput {
  i: number;
  s: string;
  d?: DelimiterKind;
}
