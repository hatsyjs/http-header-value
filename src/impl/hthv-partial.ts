import type { HthvItem } from '../hthv-item';

/**
 * @internal
 */
export interface HthvPartial<TItem extends HthvItem<any, any, any> = HthvItem> {
  $?: TItem['$'];
  n?: TItem['n'];
  t?: TItem['t'];
  v: TItem['v'];
  x?: TItem['x'];
  p?: TItem['p'];
  pl?: TItem['pl'];
}
