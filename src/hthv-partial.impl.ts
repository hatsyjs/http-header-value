import { HthvItem } from './hthv-item';

/**
 * @internal
 */
export interface HthvPartial<I extends HthvItem<any, any, any> = HthvItem> {
  $: I['$'];
  n?: I['n'];
  t?: I['t'];
  v: I['v'];
  x?: I['x'];
  p?: I['p'];
  pl?: I['pl'];
}

/**
 * @internal
 */
export function hthvItem<I extends HthvItem<any, any, any>>(
    {
      $,
      n,
      t,
      v,
      x = [],
      p = {},
      pl = [],
    }: HthvPartial<I>,
): I {
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
