/**
 * Constants for various kinds of delimiters.
 *
 * Each value is a bit mask that can be used to check whether the given delimiter kind corresponds to it.
 */
export const enum HthvDelimiter {
  /**
   * Not a delimiter.
   *
   * Corresponds to any non-delimiting character.
   */
  None = 0,

  /**
   * A delimiter that can not be included into toke.
   *
   * Any {@link HthvDelimiterChar delimiter character} considered non-token by default.
   */
  NonToken = 1,

  /**
   * Space character.
   *
   * This is either space (U+0020), or horizontal tab (U+0009) characters.
   */
  Space = 2,

  /**
   * Items delimiter.
   *
   * This is either a {@link Space space character}, or colon (U+002C) by default.
   */
  Item = 4,

  /**
   * Parameters delimiter.
   *
   * This is a `;` sign by default.
   */
  Parameter = 8,

  /**
   * An assignment of value to some name.
   *
   * A delimiter between name token and value.
   *
   * This is a `=` sign by default. Or `:` sign in comments.
   */
  Assignment = 0x10,

  /**
   * A delimiter that should be escaped with a backslash.
   */
  Escaped = 0x20,

  /**
   * A quoted-string delimiter.
   *
   * This is a `"` sign by default.
   */
  Quote = 0x1_0000,

  /**
   * Delimiter starting a comment.
   *
   * This is a '(' sign when comments enabled.
   */
  Comment = 0x2_0000,

  /**
   * Delimiter staring and angle-bracketed-string.
   *
   * This is a `<` sign by default.
   */
  AngleBracketStart = 0x4_0000,

  /**
   * Delimiter staring and angle-bracketed-string.
   *
   * This is a `>` sign by default.
   */
  AngleBracketEnd = 0x80000,
}

/**
 * Supported delimiter character.
 */
export type HthvDelimiterChar =
  | ' '
  | '\t'
  | ','
  | ';'
  | '"'
  | '\\'
  | '('
  | ')'
  | '/'
  | ':'
  | '<'
  | '='
  | '>'
  | '?'
  | '@'
  | '['
  | ']'
  | '{'
  | '}';
