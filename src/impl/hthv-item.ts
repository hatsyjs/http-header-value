import type { HthvItem } from '../hthv-item';
import type { HthvPartial } from './hthv-partial';

/**
 * @internal
 */
export function hthvItem<TItem extends HthvItem<any, any, any>>({
  $ = 'raw',
  n,
  t,
  v,
  x = [],
  p = {},
  pl = [],
}: HthvPartial<TItem>): TItem {
  if (n) {
    (p as Record<string, HthvPartial>)[n as unknown as string] = { $, n, v, x: [], p: {}, pl: [] };
  }

  return {
    $,
    n,
    t,
    v,
    x,
    p,
    pl,
  } as TItem;
}
