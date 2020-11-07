/**
 * @packageDocumentation
 * @module @hatsy/http-header-value/headers
 */
import type { HthvItem } from '../hthv-item';
import { hthvParse } from '../hthv-parse';

/**
 * HTTP content negotiator signature.
 *
 * Extracts a value matching the given HTTP content negotiation request.
 *
 * This is used to process request headers like [Accept], [Accept-Encoding], [Accept-Language], etc.
 *
 * The content negotiator can be constructed by {@link httpContentNegotiator} function.
 *
 * [Accept]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept
 * [Accept-Encoding]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding
 * [Accept-Language]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
 *
 * @typeParam T  A type of the matching value.
 */
export type HttpContentNegotiator<T> =
/**
 * @param request  Content negotiation request. This an `Accept...` header value, either {@link hthvParse parsed}, or
 * as a raw string.
 *
 * @returns The best matching value, `undefined` if there is no matching value, or `0` is the matching
 * value is explicitly prohibited (i.e. `;q=0` is used in matching request item).
 */
    (this: void, request: string | Iterable<HthvItem>) => T | undefined | 0;

export namespace HttpContentNegotiator {

  /**
   * A signature of function that extracts all wildcards the given content negotiation key matches.
   */
  export type Wildcards =
  /**
   * @param key  Source key.
   *
   * @returns All wildcards the `key` matches, starting from the most specific one (the key itself) and ending with the
   * most generic one (i.e. a match-all wildcard).
   */
      (this: void, key: string) => readonly [string, ...string[]];

  /**
   * A map of values corresponding to content negotiation keys.
   *
   * @typeParam T  A type of content.
   */
  export interface Map<T> {

    /**
     * Contains a value corresponding to content negotiation key used as property name.
     */
    readonly [key: string]: T;

  }

}

/**
 * Builds HTTP content negotiator.
 *
 * @typeParam T  A type of the matching values.
 * @param wildcards  A function extracting all possible wildcards the content negotiation key matches.
 * @param map  A map of values corresponding to content negotiation keys.
 *
 * @returns New HTTP content negotiator function.
 */
export function httpContentNegotiator<T>(
    this: void,
    wildcards: HttpContentNegotiator.Wildcards,
    map: HttpContentNegotiator.Map<T>,
): HttpContentNegotiator<T> {

  const negotiationMap = httpContentNegotiationMap(wildcards, map);

  return request => httpContentNegotiation(
      negotiationMap,
      typeof request === 'string' ? hthvParse(request) : request,
  );
}

/**
 * @internal
 */
type HttpContentNegotiationEntry<T> = readonly [T, readonly [string, ...string[]]];

/**
 * @internal
 */
type HttpContentNegotiationMap<T> = Map<string, HttpContentNegotiationEntry<T>>;

/**
 * @internal
 */
function httpContentNegotiationMap<T>(
    wildcards: HttpContentNegotiator.Wildcards,
    map: HttpContentNegotiator.Map<T>,
): HttpContentNegotiationMap<T> {

  const result: HttpContentNegotiationMap<T> = new Map();

  for (const [key, value] of Object.entries(map)) {

    const keyWildcards = wildcards(key);

    for (const wildcard of keyWildcards) {

      const prevEntry = result.get(wildcard);

      if (!prevEntry || keyWildcards.length < prevEntry[1].length) {
        result.set(wildcard, [value, keyWildcards]);
      }
    }
  }

  return result;
}

/**
 * @internal
 */
function httpContentNegotiation<T>(
    map: HttpContentNegotiationMap<T>,
    request: Iterable<HthvItem>,
): T | undefined | 0 {

  const candidates: HttpContentNegotiationEntry<T>[] = [];
  const qFactor = httpContentNegotiationCandidates(map, request, candidates);

  if (!candidates.length) {
    return;
  }
  if (!qFactor) {
    return 0;
  }

  let bestCandidate = candidates[0];

  for (let i = 1; i < candidates.length; ++i) {

    const candidate = candidates[i];

    if (candidate[1].length > bestCandidate[1].length) {
      bestCandidate = candidate;
    }
  }

  return bestCandidate[0];
}

/**
 * @internal
 */
function httpContentNegotiationCandidates<T>(
    map: HttpContentNegotiationMap<T>,
    request: Iterable<HthvItem>,
    candidates: HttpContentNegotiationEntry<T>[],
): number {

  let qFactor = 0;

  for (const item of request) {

    const candidate = map.get(item.v);

    if (!candidate) {
      continue;
    }

    const q = httpContentNegotiationQFactor(item);

    if (q < qFactor) {
      continue;
    }
    if (q > qFactor) {
      candidates.length = 0;
      qFactor = q;
    }
    candidates.push(candidate);
  }

  return qFactor;
}

/**
 * @internal
 */
function httpContentNegotiationQFactor({ p: { q } }: HthvItem): number {

  const str = q && q.v;

  if (!str) {
    return 1;
  }

  const value = parseFloat(str);

  return isNaN(value) || value > 1 ? 1 : Math.max(value, 0);
}
