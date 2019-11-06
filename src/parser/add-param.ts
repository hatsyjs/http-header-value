import { HthvItem, HthvParamItem } from '../hthv-item';

/**
 * @internal
 */
export function addParam({ p, pl }: HthvItem, param: HthvParamItem) {

  const key = param.n || param.v;
  const prev = p[key];

  if (!prev || !prev.n && param.n) {
    p[key] = param;
  }
  pl.push(param);
}
