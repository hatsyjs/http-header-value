import type { HthvExtraItem, HthvItem, HthvParamItem } from '../hthv-item.js';
import { hthvItem } from '../impl/hthv-item.js';
import { HthvPartial } from '../impl/hthv-partial.js';

/**
 * @internal
 */
export function paramItem(item: HthvPartial<HthvParamItem>): HthvParamItem {
  return hthvItem(item);
}

/**
 * @internal
 */
export function items<TItem extends HthvItem>(...list: HthvPartial<TItem>[]): TItem[] {
  return list.map(hthvItem);
}

/**
 * @internal
 */
export function extras(...list: HthvPartial<HthvExtraItem>[]): HthvExtraItem[] {
  return list.map(hthvItem);
}
