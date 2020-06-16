/**
 * @packageDocumentation
 * @module @hatsy/http-header-value/headers
 */
import { HthvItem } from '../hthv-item';
import { HttpContentNegotiationRep, HttpContentNegotiationSpec } from './http-content-negotiation-rep';

/**
 * Representation of [Accept](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept) HTTP header.
 *
 * Contains {@link HttpAcceptRep.MimeType MIME entries} as content negotiation ones.
 */
export type HttpAcceptRep = HttpContentNegotiationRep<HttpAcceptRep.MimeType>;

export namespace HttpAcceptRep {

  /**
   * A MIME type entry of [Accept](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept) HTTP header.
   *
   * This is a tuple consisting of q-factor weighting (between 0 and 1), optional type, and optional subtype.
   *
   * The missing type or subtype corresponds to `*` wildcard matching any value.
   *
   * The entries are ordered by q-factor, then - by type, and then - by subtype. Wildcards are less preferred than other
   * entries with the same q-factor.
   */
  export type MimeType = readonly [number, string?, string?];

}

/**
 * @internal
 */
class HttpAcceptSpec extends HttpContentNegotiationSpec<HttpAcceptRep.MimeType> {

  buildEntry({ v, p: { q } }: HthvItem): HttpAcceptRep.MimeType {

    const [type, subtype] = v.split('/', 2);
    const qFactor = HttpContentNegotiationSpec.qFactor(q?.v);

    return type && type !== '*'
        ? (subtype && subtype !== '*' ? [qFactor, type, subtype] : [qFactor, type])
        : [qFactor];

  }

  parseQuery(query: string): HttpContentNegotiationSpec.Weigher<HttpAcceptRep.MimeType> {

    const [type, subtype = '*'] = query.split('/', 2);

    if (type === '*') {
      return ([q]) => q;
    }
    if (subtype === '*') {
      return ([q, t]) => (!t || t === type) && q;
    }

    return ([q, t, s]) => (!t || t === type) && (!s || subtype === s) && q;
  }

  order([q1, t1, s1]: HttpAcceptRep.MimeType, [q2, t2, s2]: HttpAcceptRep.MimeType): number {

    const diff = q2 - q1;

    if (diff) {
      return diff;
    }
    if (!t1) {
      return !t2 ? 0 : 1;
    }
    if (!t2) {
      return -1;
    }

    const tDiff = t2.localeCompare(t1);

    if (tDiff) {
      return tDiff;
    }
    if (!s1) {
      return !s2 ? 0 : 1;
    }
    if (!s2) {
      return -1;
    }

    return s2.localeCompare(s1);
  }

}

/**
 * Representation of [Accept](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept) HTTP header.
 */
export const HttpAcceptRep: HttpContentNegotiationSpec<HttpAcceptRep.MimeType> = (/*#__PURE__*/ new HttpAcceptSpec());
