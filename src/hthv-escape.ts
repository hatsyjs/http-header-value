/**
 * @module http-header-value
 */
interface EscapedChars {
  [char: string]: 1;
}

const stringEscaped: EscapedChars = {
  '\\': 1,
  '"': 1,
};

/**
 * Escapes HTTP header value or its part.
 *
 * Replaces `\` with `\\`, and `"` with `\"`.
 *
 * @param string  A string to escape.
 *
 * @returns Escaped `string`.
 */
export function hthvEscape(string: string): string {
  return escape(string, stringEscaped);
}

const commentEscaped: EscapedChars = {
  '\\': 1,
  '"': 1,
  '(': 1,
  ')': 1,
};

/**
 * Escapes HTTP header comment or its part.
 *
 * Replaces `\` with `\\`, `"` with `\"`, `(` with `\(`, and `)` with `\)`.
 *
 * @param string  A string to escape.
 *
 * @returns Escaped `string`.
 */
export function hthvEscapeComment(string: string): string {
  return escape(string, commentEscaped);
}

function escape(string: string, escapedChars: { [char: string]: 1 }): string {

  let escaped: undefined | string;

  for (let i = 0; i < string.length; ++i) {

    const c = string[i];

    if (escapedChars[c]) {
      if (!escaped) {
        escaped = string.substring(0, i);
      }
      escaped += '\\' + c;
    } else if (escaped) {
      escaped += c;
    }
  }

  return escaped || string;
}
