import type { HthvItem, HthvParamItem } from '../hthv-item';

/**
 * @internal
 */
export function addParam({ p, pl }: HthvItem, param: HthvParamItem): void {
  const key = param.n || param.v;
  const prev = p[key];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!prev || (!prev.n && param.n)) {
    p[key] = param;
  }
  pl.push(param);
}
