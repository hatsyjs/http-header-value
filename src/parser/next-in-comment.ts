import { Delimiter, DelimiterKind, detectDelimiterKind } from './delimiters';
import { ParserInput } from './parser-input';

const commentDelimiters: { [c: string]: DelimiterKind } = {
  ':': Delimiter.Eq,
  ')': Delimiter.RecordEnd,
  ',': Delimiter.TokenEnd,
  ' ': Delimiter.TokenEnd,
  '"': Delimiter.Quote,
};

/**
 * @internal
 */
export function nextInComment(input: ParserInput): string {

  let c = input.s[input.i];

  if (c !== '\\') {
    input.d = commentDelimiters[c] || detectDelimiterKind(c);
    return c;
  }

  ++input.i;
  if (input.i < input.s.length) {
    c = input.s[input.i];
    input.d = detectDelimiterKind(c) ? Delimiter.TokenEnd : Delimiter.None;
  } else {
    input.d = Delimiter.TokenEnd;
  }

  return c;
}
