/**
 * @module http-header-value
 */
/**
 * Parsed HTTP header value item.
 *
 * HTTP header value may consist of multiple such items, either comma- or space- separated.
 *
 * Each item is either a plain value, or a `<name>=<value>` pair, where the `<name>` is a _token_, i.e. is may not
 * contain separators or special characters.
 *
 * Item value can be followed by semicolon-separated parameters:
 * > `Set-Cookie:` __`id=a3fWa; Secure; Domain=example.com; Max-Age=2592000`__ \
 * > `Content-Type:` __`text/html; charset=UTF-8`__
 *
 * It also can be followed by comment:
 * > `User-Agent:` __`Mozilla/5.0 (X11; Linux x86_64; rv:70.0)`__
 *
 * Such comment is treated as semicolon-separated list of statements (`X11`, `Linux x86_64`), and parameters
 * (`rv:70.0`).
 *
 * Item value itself, as well as parameter values, may be quoted:
 * > `WWW-Authenticate:` __`Basic realm="Access to the staging site"`__
 *
 * This object contains them unquoted and unescaped.
 *
 * The quoted item value may be tagged:
 * > `ETag:` __`W/"0815"`__
 *
 * In this case the tag is used as item name.
 */
export interface HthvItem {

  /**
   * Either a name from the name/value pair, or a tag of the quoted item value.
   */
  n?: string;

  /**
   * Either plain item value, unquoted value, or the one from the name/value pair.
   */
  v: string;

  /**
   * Item parameters.
   *
   * An object literal with properties named after parameters, and containing corresponding parameter values.
   *
   * When parameter has no value (e.g. `...; HttpOnly; ...`), corresponding property value is set to `true`.
   */
  p: { [name: string]: string | true };

  /**
   * Item comment statements.
   */
  c: string[];

  /**
   * Item comment parameters.
   *
   * An object literal with properties named as comment parameters with their values.
   */
  cp: { [name: string]: string };

}
