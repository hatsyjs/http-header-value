import type { HthvItem } from './hthv-item';

/**
 * HTTP header value items collection.
 *
 * Contains a map of named items, as well as their list.
 *
 * This is constructed by {@link hthvFlatten} function.
 *
 * @typeParam TNameMode - Whether items has a {@link n name}.
 * @typeParam TTagMode - Whether items has a {@link t tag}.
 * @typeParam TParamsMode - Whether items has {@link p parameters}.
 */
export interface HthvItems<
    TNameMode extends 'has-name' | 'no-name' = 'has-name' | 'no-name',
    TTagMode extends 'has-tag' | 'no-tag' = 'has-tag' | 'no-tag',
    TParamsMode extends 'has-params' | 'no-params' = 'has-params' | 'no-params'> {

  /**
   * A map of HTTP header value items.
   *
   * When item has no name, then its value is used as a key.
   */
  map: { [name: string]: HthvItem<TNameMode, TTagMode, TParamsMode> };

  /**
   * A list of items and their parameters.
   */
  list: HthvItem<TNameMode, TTagMode, TParamsMode>[];

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
 * @typeParam TNameMode - Whether items has a {@link n name}.
 * @typeParam TTagMode - Whether items has a {@link t tag}.
 * @typeParam TParamsMode - Whether items has {@link p parameters}.
 * @param items Items collection.
 */
export function hthvFlatten<
    TNameMode extends 'has-name' | 'no-name',
    TTagMode extends 'has-tag' | 'no-tag',
    TParamsMode extends 'has-params' | 'no-params'>(
    items: HthvItem<TNameMode, TTagMode, TParamsMode>[],
): HthvItems<TNameMode, TTagMode, TParamsMode> {

  const map: { [name: string]: HthvItem<TNameMode, TTagMode, TParamsMode> } = {};
  const list: HthvItem<TNameMode, TTagMode, TParamsMode>[] = [];
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

    map[key] = item as HthvItem<TNameMode, TTagMode, TParamsMode>;
    depths[key] = depth;
  };

  const add = (item: HthvItem<any, any, any>, depth: number): void => {
    put(item, depth);
    ++depth;
    item.pl.forEach(p => add(p, depth));
  };

  items.forEach(item => add(item, 0));

  return { map, list };
}
