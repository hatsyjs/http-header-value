import type { HthvItem } from '../hthv-item';

/**
 * @internal
 */
export interface HthvPartial<TItem extends HthvItem<any, any, any> = HthvItem> {
  $?: TItem['$'] | undefined;
  n?: TItem['n'] | undefined;
  t?: TItem['t'] | undefined;
  v: TItem['v'];
  x?: TItem['x'] | undefined;
  p?: TItem['p'] | undefined;
  pl?: TItem['pl'] | undefined;
}
