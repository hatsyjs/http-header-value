/**
 * @module http-header-value
 */
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
  return escape(string, '"');
}

/**
 * Escapes HTTP header comment or its part.
 *
 * Replaces `\` with `\\`, and `)` with `\)`.
 *
 * @param string  A string to escape.
 *
 * @returns Escaped `string`.
 */
export function hthvEscapeComment(string: string): string {
  return escape(string, ')');
}

function escape(string: string, special: ')' | '"'): string {

  let escaped: undefined | string;

  for (let i = 0; i < string.length; ++i) {

    const c = string[i];

    if (c === '\\' || c === special) {
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
