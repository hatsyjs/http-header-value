import { Delimiter, DelimiterKind, detectDelimiterKind } from './delimiters';
import { ParserInput } from './parser-input';

const itemDelimiters: { [c: string]: DelimiterKind } = {
  '=': Delimiter.Eq,
  '"': Delimiter.Quote,
};

/**
 * @internal
 */
export function nextInItem(input: ParserInput): string {

  const c = input.s[input.i];

  input.d = itemDelimiters[c] || detectDelimiterKind(c);

  return c;
}
