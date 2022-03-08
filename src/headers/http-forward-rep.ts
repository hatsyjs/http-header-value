import type { HthvItem, HthvParamItem, HthvParamMap } from '../hthv-item';
import { hthvParse } from '../hthv-parse';
import { hthvItem, hthvParseFirstTrivial, hthvParseTrivial } from '../impl';
import { HttpForwardTrust, HttpForwardTrustMask } from './http-forward-trust';

/**
 * HTTP request forwarding report.
 *
 * This information is collected from [Forwarded] and `X-Forwarded-...` request headers.
 *
 * [Forwarded]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Forwarded
 */
export interface HttpForwardRep {

  readonly by: string;
  readonly for: string;
  readonly host: string;
  readonly proto: string;
  readonly [key: string]: string | undefined;

}

export namespace HttpForwardRep {

  /**
   * Request headers representation.
   */
  export interface Headers {

    /**
     * [Forwarded](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Forwarded) header value.
     */
    readonly forwarded?: string | Iterable<string> | undefined;

    /**
     * [X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For) header value.
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    readonly 'x-forwarded-for'?: string | Iterable<string> | undefined;

    /**
     * [X-Forwarded-Host](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Host) header value.
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    readonly 'x-forwarded-host'?: string | Iterable<string> | undefined;

    /**
     * [X-Forwarded-Proto](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Proto) header value.
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    readonly 'x-forwarded-proto'?: string | Iterable<string> | undefined;

    /**
     * Header value with its lower-case name as property name.
     *
     * The value is either a single one or iterable.
     */
    readonly [name: string]: string | Iterable<string> | undefined;

  }

  /**
   * Forwarding info defaults.
   *
   * This is used to construct the last item in the forwarding info list that is always trusted.
   */
  export interface Defaults {

    /**
     * Local address.
     */
    readonly by: string;

    /**
     * Remote address.
     */
    readonly for: string;

    /**
     * Either `Host` header or `${localAddress}:S{localPort}`.
     */
    readonly host: string;

    /**
     * Accepting protocol.
     *
     * E.g. `req.connection.encrypted ? 'https' : 'http'`.
     */
    readonly proto: string;

  }

}

export const HttpForwardRep = {

  /**
   * Builds trusted proxy forwarding report by proxy forwarding records.
   *
   * @param items - `Forwarded` header value items.
   * @param defaults - Forwarding info defaults.
   * @param trust - A trust policy to proxy forwarding records.
   *
   * @returns Trusted proxy forwarding report.
   */
  build(
      this: void,
      items: readonly HthvItem[],
      defaults: HttpForwardRep.Defaults,
      trust: HttpForwardTrust = {},
  ): HttpForwardRep {

    const trustChecker = HttpForwardTrust.by(trust);
    let {
      by: trustedBy,
      for: trustedFor,
      host: trustedHost,
      proto: trustedProto,
    } = defaults;
    const lastHost = hthvItem({ n: 'host', v: trustedHost });
    const lastProto = hthvItem({ n: 'proto', v: trustedProto });
    let trusted = hthvItem({
      n: 'for',
      v: trustedFor,
      p: { host: lastHost, proto: lastProto },
      pl: [lastHost, lastProto],
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    let trustedFlag = trustChecker(trusted, 0); // The last item is always trusted
    let index = 0;

    for (let i = items.length - 1; i >= 0; --i) {

      const item = items[i];

      // Either explicitly trusted or trusted by previous item.
      trustedFlag = trustChecker(item, ++index) | ((trustedFlag & HttpForwardTrustMask.TrustPrevious) >>> 1);

      if (!(trustedFlag & HttpForwardTrustMask.TrustCurrent)) {
        break; // Current record is not trusted even though the previous could be trusted here.
      }

      const { p } = item;

      trustedBy = p.by?.v || trustedBy;
      trustedFor = p.for?.v || trustedFor;
      trustedHost = p.host?.v || trustedHost;
      trustedProto = p.proto?.v || trustedProto;
      trusted = item;
    }

    const result: Record<string, string> = {};

    for (const { n, v } of trusted.pl) {
      if (n) {
        result[n] = v;
      }
    }
    if (trusted.n) {
      result[trusted.n] = trusted.v;
    }

    // Fill the required fields
    result.by = trustedBy;
    result.for = trustedFor;
    result.host = trustedHost;
    result.proto = trustedProto;

    return result as HttpForwardRep;
  },

  /**
   * Builds trusted proxy forwarding report by HTTP request.
   *
   * @param headers - Request headers.
   * @param defaults - Forwarding info defaults.
   * @param trust - A trust policy to proxy forwarding records.
   *
   * @returns Trusted proxy forwarding report.
   */
  by(
      this: void,
      headers: HttpForwardRep.Headers,
      defaults: HttpForwardRep.Defaults,
      trust: HttpForwardTrust = {},
  ): HttpForwardRep {

    const { forwarded } = headers;
    let items: HthvItem[];

    if (forwarded) {
      if (typeof forwarded === 'string') {
        items = hthvParse(forwarded);
      } else {
        items = [];
        for (const fwd of forwarded) {
          items.push(...hthvParse(fwd));
        }
      }
    } else if (trust.xForwarded === false) {
      return { ...defaults };
    } else {
      items = hthvXForwardedItems(headers);
    }

    return HttpForwardRep.build(items, defaults, trust);
  },

};

/**
 * @internal
 */
function hthvXForwardedItems(headers: HttpForwardRep.Headers): HthvItem[] {

  const forwardedForValue = headers['x-forwarded-for'];

  if (!forwardedForValue) {
    return [];
  }

  const forwardedFor = hthvParseTrivial(forwardedForValue);
  const forwardedHost = hthvParseFirstTrivial(headers['x-forwarded-host']);
  const forwardedProto = hthvParseFirstTrivial(headers['x-forwarded-proto']);

  const host = forwardedHost && hthvItem({ n: 'host', v: forwardedHost });
  const proto = forwardedProto && hthvItem({ n: 'proto', v: forwardedProto });

  const items: HthvItem[] = [];

  for (const v of forwardedFor) {

    const p: HthvParamMap = {};
    const pl: HthvParamItem[] = [];

    if (host) {
      p.host = host;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      pl.push(host);
    }
    if (proto) {
      p.proto = proto;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      pl.push(proto);
    }

    items.push(hthvItem({ n: 'for', v, p, pl }));
  }

  return items;
}
