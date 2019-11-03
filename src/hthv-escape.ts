/**
 * @module http-header-value
 */
/**
 * Escapes HTTP header value.
 *
 * Replaces `\` with `\\`, and `"` with `\"`.
 *
 * @param value  A value to escape.
 *
 * @returns Escaped `value`.
 */
export function hthvEscape(value: string): string {

  let escaped: undefined | string;

  for (let i = 0; i < value.length; ++i) {

    const c = value[i];

    if (c === '\\' || c === '\"') {
      if (!escaped) {
        escaped = value.substring(0, i);
      }
      escaped += '\\' + c;
    } else if (escaped) {
      escaped += c;
    }
  }

  return escaped != null ? escaped : value;
}
