import type { HthvExtraItem, HthvItem, HthvParamItem } from '../hthv-item';
import { hthvItem, HthvPartial } from '../impl';

/**
 * @internal
 */
export function paramItem(item: HthvPartial<HthvParamItem>): HthvParamItem {
  return hthvItem(item);
}

/**
 * @internal
 */
export function items<I extends HthvItem>(...list: HthvPartial<I>[]): I[] {
  return list.map(hthvItem);
}

/**
 * @internal
 */
export function extras(...list: HthvPartial<HthvExtraItem>[]): HthvExtraItem[] {
  return list.map(hthvItem);
}
