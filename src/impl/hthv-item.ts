import { HthvItem } from '../hthv-item';
import { HthvPartial } from './hthv-partial';

/**
 * @internal
 */
export function hthvItem<I extends HthvItem<any, any, any>>(
    {
      $ = 'raw',
      n,
      t,
      v,
      x = [],
      p = {},
      pl = [],
    }: HthvPartial<I>,
): I {
  if (n) {
    (p as any)[n] = { $, n, v, x: [], p: {}, pl: [] };
  }
  return {
    $,
    n,
    t,
    v,
    x,
    p,
    pl,
  } as I;
}
