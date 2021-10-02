import { httpContentNegotiator, HttpContentNegotiator } from './http-content-negotiator';

/**
 * Builds requested language negotiator.
 *
 * This is used to process [Accept-Language] request header.
 *
 * [Accept-Language]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
 *
 * @typeParam T - A type of the matching values.
 * @param map - A map of values corresponding to language codes or wildcard.
 *
 * @returns New requested language negotiator function.
 */
export function httpLanguageNegotiator<T>(map: HttpContentNegotiator.Map<T>): HttpContentNegotiator<T> {
  return httpContentNegotiator(httpLanguageNegotiationWildcards, map);
}

/**
 * @internal
 */
const httpLanguageWildcard = '*';

/**
 * @internal
 */
const httpLanguageWildcards = [httpLanguageWildcard] as const;

/**
 * @internal
 */
function httpLanguageNegotiationWildcards(key: string): readonly [string, ...string[]] {
  if (key === httpLanguageWildcard) {
    return httpLanguageWildcards;
  }

  const wildcards: [string, ...string[]] = [key];

  for (;;) {

    const idx = key.lastIndexOf('-');

    if (idx < 0) {
      wildcards.push(key, httpLanguageWildcard);

      break;
    }
    key = key.substr(0, idx);
    wildcards.push(key);
  }

  return wildcards;
}
