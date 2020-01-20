/**
 * @module http-header-value
 */
import { HthvItem } from './hthv-item';

/**
 * HTTP header value items collection.
 *
 * Contains a map of named items, as well as their list.
 *
 * This is constructed by [[hthvFlatten]] function.
 */
export interface HthvItems<
    N extends 'has-name' | 'no-name' = 'has-name' | 'no-name',
    T extends 'has-tag' | 'no-tag' = 'has-tag' | 'no-tag',
    P extends 'has-params' | 'no-params' = 'has-params' | 'no-params'> {

  /**
   * A map of HTTP header value items.
   *
   * When item has no name, then its value is used as a key.
   */
  map: { [name: string]: HthvItem<N, T, P> };

  /**
   * A list of items and their parameters.
   */
  list: HthvItem<N, T, P>[];

}

/**
 * Flattens HTTP header value items by extracting their parameters.
 *
 * The result is an items collection containing original `items`, as well as their parameters.
 *
 * Recursively places `items` and their parameters to result map in their original order, and:
 * - prefers named items over unnamed ones,
 * - prefers original items over their parameters,
 * - prefers items added first.
 *
 * @param items Items collection.
 */
export function hthvFlatten<
    N extends 'has-name' | 'no-name',
    T extends 'has-tag' | 'no-tag',
    P extends 'has-params' | 'no-params'>(
    items: HthvItem<N, T, P>[],
): HthvItems<N, T, P> {

  const map: { [name: string]: HthvItem<N, T, P> } = {};
  const list: HthvItem<N, T, P>[] = [];
  const depths: { [name: string]: number } = {};

  const put = (item: HthvItem<any, any, any>, depth: number): void => {
    list.push(item);

    const key = item.n as string || item.v;
    const prev = map[key];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (prev) {
      if (item.n) {
        if (prev.n && depths[key] <= depth) {
          return;
        }
      } else if (prev.n || depths[key] <= depth) {
        return;
      }
    }

    map[key] = item;
    depths[key] = depth;
  };

  const add = (item: HthvItem<N, T, P>, depth: number): void => {
    put(item, depth);
    ++depth;
    item.pl.forEach(p => add(p as HthvItem<any, any, any>, depth));
  };

  items.forEach(item => add(item, 0));

  return { map, list };
}
