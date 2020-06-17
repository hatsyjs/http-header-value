/**
 * @packageDocumentation
 * @module @hatsy/http-header-value/headers
 */
import { httpContentNegotiator, HttpContentNegotiator } from './http-content-negotiator';

/**
 * Builds requested MIME negotiator.
 *
 * This is used to process [Accept] request header.
 *
 * [Accept]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept
 *
 * @typeparam T  A type of the matching values.
 * @param map  A map of values corresponding to MIME types or wildcards.
 *
 * @returns New requested MIME negotiator function.
 */
export function httpMimeNegotiator<T>(map: HttpContentNegotiator.Map<T>): HttpContentNegotiator<T> {
  return httpContentNegotiator(httpMimeNegotiationWildcards, map);
}

/**
 * @internal
 */
const httpMimeWildcard = '*/*';

/**
 * @internal
 */
const httpMimeWildcards = [httpMimeWildcard] as const;

/**
 * @internal
 */
function httpMimeNegotiationWildcards(key: string): readonly [string, ...string[]] {
  if (key.endsWith('/*')) {
    return key === httpMimeWildcard ? httpMimeWildcards : [key, httpMimeWildcard];
  }

  const slashIdx = key.indexOf('/');

  if (slashIdx < 0) {
    return [`${key}/*`, httpMimeWildcard];
  }

  const type = key.substr(0, slashIdx);

  return [key, type + '/*', httpMimeWildcard];
}
