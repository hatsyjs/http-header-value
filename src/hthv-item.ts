/**
 * @packageDocumentation
 * @module http-header-value
 */
/**
 * Item value type.
 *
 * This is one of:
 * - `quoted-string` - A [quoted-string].
 *   > `ETag:` __`"0815"`__
 *
 *   Item {@link HthvItem.v value} is unquoted and unescaped for this type.
 * - `tagged-string` - A tagged [quoted-string]:
 *    > `ETag:` __`W/"0815"`__
 *
 *   Here `W/` is a {@link HthvItem.t tag}, while `0815` is {@link HthvItem.v unquoted value}.
 * - `angle-bracketed-string` - A string in angle brackets. This is typically used for URLs:
 *    > `Link:` __`<https://example.com/index.html?mode=preconnect>; rel="preconnect"`__
 *
 *   Item {@link HthvItem.v value} is a string with angle brackets removed. Escape sequences are not supported inside
 *   angle brackets.
 * - `date-time` - A [date-time] value in [IMF-fixdate] format.
 *    > `Date:` __`Sun, 06 Nov 1994 08:49:37 GMT`__
 *
 * - `raw` - This type is used unless there is a more specific representation.
 *
 * [quoted-string]: https://tools.ietf.org/html/rfc7230#section-3.2.6
 * [IMF-fixdate]: https://tools.ietf.org/html/rfc7231#section-7.1.1.1
 * [date-time]: https://tools.ietf.org/html/rfc7231#section-7.1.1.1
 */
export type HthvItemType =
    | 'raw'
    | 'quoted-string'
    | 'tagged-string'
    | 'angle-bracketed-string'
    | 'date-time';

/**
 * Parsed HTTP header value item.
 *
 * HTTP header value may consist of multiple such items, either comma- or space- separated.
 *
 * Some items may be nested inside another ones. E.g. as item parameters, or as nested comments.
 *
 * Item may represent a `<name>=<value>` pair used as top level item or its parameter, or a `<name>:<value>` pair within
 * comment.
 *
 * @typeparam N  Whether this item has a {@link n name}.
 * @typeparam T  Whether this item has a {@link t tag}.
 * @typeparam P  Whether this item has {@link p parameters}.
 */
export interface HthvItem<
    N extends 'has-name' | 'no-name' = 'has-name' | 'no-name',
    T extends 'has-tag' | 'no-tag' = 'has-tag' | 'no-tag',
    P extends 'has-params' | 'no-params' = 'has-params' | 'no-params'> {

  /**
   * Item value type.
   */
  $: 'has-tag' extends T ? HthvItemType : Exclude<HthvItemType, 'tagged-string'>;

  /**
   * A name of name/value item.
   *
   * This is always a [token].
   *
   * [token]: https://tools.ietf.org/html/rfc7230#section-3.2.6
   */
  n: 'has-name' extends N ? ('no-name' extends N ? string | undefined : string) : undefined;

  /**
   * A tag of tagged string.
   *
   * This is only set for `tagged-string` item type.
   */
  t: 'has-tag' extends T ? ('no-tag' extends T ? string | undefined : string) : undefined;

  /**
   * Item value.
   */
  v: string;

  /**
   * Any extra items immediately following item value and preceding its parameters. Typically empty.
   */
  x: HthvExtraItem[];

  /**
   * A map of item parameters.
   */
  p: 'has-params' extends P ? HthvParamMap : { [name: string]: never };

  /**
   * A list of all item parameters.
   */
  pl: 'has-params' extends P ? HthvParamItem[] : [];

}

/**
 * An extra item following a value of another one and preceding its parameters.
 *
 * Extra items typically not present within standard headers, but may present in custom ones:
 * > `Calculate`: __`"foo"+"bar";foo=2;bar=3`__
 *
 * Here `"a"` is a quoted string item, `+` and `"b"` - its extra items, while `foo=2` and `bar=3` its parameters.
 */
export type HthvExtraItem = HthvItem<'no-name', 'no-tag', 'no-params'>;

/**
 * A map of parameters of HTTP header value item.
 *
 * Parameters are semicolon-separated items following parameterized item's value.
 *
 * This is an object literal with parameter names as keys and corresponding parameter items as values.
 *
 * When parameter has no name, then its value is used as a key.
 *
 * When multiple parameters have the same key, the first one is preferred, and the one with the name is always
 * preferred over the one without it.
 */
export interface HthvParamMap {
  [name: string]: HthvParamItem;
}

/**
 * A parameter of HTTP header item.
 *
 * Parameters are semicolon-separated items following main item value. This is typically either a
 * name/value pair, or just a value. But technically can be a quoted string too. But ever a tagged string.
 *
 * > `Set-Cookie:` __`id=a3fWa; Secure; Domain=example.com; Max-Age=2592000`__
 */
export type HthvParamItem = HthvItem<'has-name' | 'no-name', 'no-tag', 'no-params'>;
