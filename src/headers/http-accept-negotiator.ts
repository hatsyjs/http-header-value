import { httpContentNegotiator, HttpContentNegotiator } from './http-content-negotiator';

/**
 * @packageDocumentation
 * @module @hatsy/http-header-value/headers
 */
export function httpAcceptNegotiator<T>(map: HttpContentNegotiator.Map<T>): HttpContentNegotiator<T> {
  return httpContentNegotiator(httpAcceptNegotiationMatches, map);
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
function httpAcceptNegotiationMatches(key: string): readonly [string, ...string[]] {
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
