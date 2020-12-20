/**
 * @packageDocumentation
 * @module @hatsy/http-header-value/headers
 */
import { httpContentNegotiator, HttpContentNegotiator } from './http-content-negotiator';

/**
 * Builds requested content encoding negotiator.
 *
 * This is used to process [Accept-Encoding] request header.
 *
 * [Accept-Encoding]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding
 *
 * @typeParam T - A type of the matching values.
 * @param map - A map of values corresponding to content encodings or wildcard.
 *
 * @returns New requested content encoding negotiator function.
 */
export function httpEncodingNegotiator<T>(map: HttpContentNegotiator.Map<T>): HttpContentNegotiator<T> {
  return httpContentNegotiator(httpEncodingNegotiationWildcards, map);
}

/**
 * @internal
 */
const httpEncodingWildcard = '*';

/**
 * @internal
 */
const httpEncodingWildcards = [httpEncodingWildcard] as const;

/**
 * @internal
 */
function httpEncodingNegotiationWildcards(key: string): readonly [string, ...string[]] {
  return key === httpEncodingWildcard ? httpEncodingWildcards : [key, httpEncodingWildcard];
}
