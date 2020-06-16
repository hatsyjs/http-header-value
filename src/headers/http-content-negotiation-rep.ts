/**
 * @packageDocumentation
 * @module @hatsy/http-header-value/headers
 */
import { HthvItem } from '../hthv-item';
import { hthvParse } from '../hthv-parse';

/**
 * Representation of arbitrary
 * [content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation) HTTP header.
 *
 * @typeparam TEntry  A type of content negotiation entry.
 */
export interface HttpContentNegotiationRep<TEntry> {

  /**
   * Content negotiation entries.
   *
   * These entries are {@link HttpContentNegotiationSpec.order ordered} from most preferred ones to least preferred
   * ones.
   */
  readonly entries: readonly TEntry[];

  /**
   * Searches for matching content negotiation entry.
   *
   * @param query  Content negotiation entry query. Either a {@link HttpContentNegotiationSpec.Weigher weigher
   * function}, or a string {@link HttpContentNegotiationSpec.parseQuery to parse}.
   * @param from  An index of the first entry to start the search from.
   *
   * @returns Either an index of the entry found, `-1` if entry not found, or `null` if entry found, but its usage is
   * explicitly prohibited (i.e. the weigher function returned `0`).
   */
  find(query: string | HttpContentNegotiationSpec.Weigher<TEntry>, from?: number): number | null;

}

export namespace HttpContentNegotiationSpec {

  /**
   * A signature of content negotiation entry weigher.
   *
   * @typeparam  A type of content negotiation entry.
   */
  export type Weigher<TEntry> =
  /**
   * @param entry  The entry to weigh.
   *
   * @returns Either the weight of matching entry, or `false` if entry does not match. Zero value means the entry use is
   * explicitly prohibited. The latter corresponds to zero q-factor.
   */
      (this: void, entry: TEntry) => number | false;

}

/**
 * Content negotiation header specifier.
 *
 * It is used to build such header representation.
 *
 * @typeparam TEntry  A type of content negotiation entry.
 */
export abstract class HttpContentNegotiationSpec<TEntry> {

  /**
   * Evaluates a q-factor of content negotiation entry by its string representation.
   *
   * @param value  Target q-factor value string. May be undefined.
   *
   * @return q-factor value between `0` (prohibited) and `1` (default).
   */
  static qFactor(value: string | undefined): number {
    if (!value) {
      return 1;
    }

    const q = parseFloat(value);

    return isNaN(q) || q > 1 ? 1 : Math.max(q, 0);
  }

  /**
   * Builds a representation of content negotiation header by its value items.
   *
   * @param items  Items of content negotiation header value.
   *
   * @returns Content negotiation header representation.
   */
  build(items: readonly HthvItem[]): HttpContentNegotiationRep<TEntry> {

    const entries = items.map(item => this.buildEntry(item));

    entries.sort(this.order.bind(this));

    return {
      entries,
      find: (query: string | HttpContentNegotiationSpec.Weigher<TEntry>, from = 0): number | null => {
        if (typeof query === 'string') {
          query = this.parseQuery(query);
        }

        for (let i = Math.max(from, 0); i < entries.length; ++i) {

          const weight = query(entries[i]);

          if (weight) {
            return i;
          }
          if (weight === 0) {
            return null;
          }
        }

        return -1;
      },
    };
  }

  /**
   * Builds a representation of content negotiation header by its value.
   *
   * @param value  Content negotiation header value.
   *
   * @returns Content negotiation header representation.
   */
  by(value: string): HttpContentNegotiationRep<TEntry> {
    return this.build(hthvParse(value));
  }

  /**
   * Builds content negotiation entry by header value item.
   *
   * @param item  Header value item to build entry from.
   *
   * @returns Content negotiation entry.
   */
  public abstract buildEntry(item: HthvItem): TEntry;

  /**
   * Parses a query for content negotiation entry.
   *
   * @param query  A query to parse.
   *
   * @returns Content negotiation entry weigher.
   */
  public abstract parseQuery(query: string): HttpContentNegotiationSpec.Weigher<TEntry>;

  /**
   * Orders content negotiation entries.
   *
   * @param first  First entry to order.
   * @param second  Second entry to order.
   *
   * @returns Positive number if the second entry is more preferred than the first one, negative number if the first
   * entry is more preferred then the second one, or zero if their preferences are equal.
   */
  public abstract order(first: TEntry, second: TEntry): number;

}


