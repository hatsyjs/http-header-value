/**
 * @packageDocumentation
 * @module @hatsy/http-header-value/headers
 */
import { HthvItem, HthvParamItem, HthvParamMap } from '../hthv-item';
import { hthvParse } from '../hthv-parse';
import { hthvItem } from '../hthv-partial.impl';
import { HthvForwardTrust } from './hthv-forward-trust';
import { hthvParseFirstTrivial, hthvParseTrivial } from './hthv-parse-trivial.impl';

/**
 * Proxy forwarding information.
 *
 * This information is collected from [Forwarded] and `X-Forwarded-...` request headers.
 *
 * [Forwarded]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Forwarded
 */
export interface HthvForwarded {

  readonly by: string;
  readonly for: string;
  readonly host: string;
  readonly proto: string;
  readonly [key: string]: string | undefined;

}

export namespace HthvForwarded {

  /**
   * Request headers representation.
   */
  export interface Headers {

    /**
     * [Forwarded](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Forwarded) header value.
     */
    readonly forwarded?: string | Iterable<string>;

    /**
     * [X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For) header value.
     */
    readonly 'x-forwarded-for'?: string | Iterable<string>;

    /**
     * [X-Forwarded-Host](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Host) header value.
     */
    readonly 'x-forwarded-host'?: string | Iterable<string>;

    /**
     * [X-Forwarded-Proto](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Proto) header value.
     */
    readonly 'x-forwarded-proto'?: string | Iterable<string>;

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

export const HthvForwarded = {

  /**
   * Builds trust checker function by forwarding info trust policy.
   *
   * @param trust  A trust policy to proxy forwarding records.
   *
   * @returns Constructed trust predicate function.
   */
  trust(trust: HthvForwardTrust = {}): HthvForwardTrust.Checker {

    const { trusted = false } = trust;

    if (typeof trusted === 'function') {
      return trusted; // Already a function.
    }
    if (typeof trusted === 'boolean') {

      const mask = trusted ? HthvForwardTrust.Mask.AlwaysTrust : HthvForwardTrust.Mask.DontTrust;

      return () => mask;
    }

    const params: HthvForwardTrust.Params = trusted;
    const checkItem = ({ n, v }: HthvItem<any, any, any>): HthvForwardTrust.Mask => (n && params[n]?.[v])
        || HthvForwardTrust.Mask.DontTrust;

    return item => {

      let result = checkItem(item);

      for (const p of item.pl) {
        result |= checkItem(p);
      }

      return result;
    };
  },

  /**
   * Builds trusted proxy forwarding information.
   *
   * @param items  `Forwarded` header value items.
   * @param defaults  Forwarding info defaults.
   * @param trust  A trust policy to proxy forwarding records.
   *
   * @returns Trusted proxy forwarding information.
   */
  by(
      this: void,
      items: readonly HthvItem[],
      defaults: HthvForwarded.Defaults,
      trust: HthvForwardTrust = {},
  ): HthvForwarded {

    const trustChecker = HthvForwarded.trust(trust);
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
    let trustedFlag = trustChecker(trusted, 0); // The last item is always trusted
    let index = 0;

    for (let i = items.length - 1; i >= 0; --i) {

      const item = items[i];

      // Either explicitly trusted or trusted by previous item.
      trustedFlag = trustChecker(item, ++index) | ((trustedFlag & HthvForwardTrust.Mask.TrustPrevious) >>> 1);

      if (!(trustedFlag & HthvForwardTrust.Mask.TrustCurrent)) {
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

    return result as HthvForwarded;
  },

  /**
   * Parses trusted proxy forwarding information.
   *
   * @param headers  Request headers.
   * @param defaults  Forwarding info defaults.
   * @param trust  A trust policy to proxy forwarding records.
   *
   * @returns Trusted proxy forwarding information.
   */
  parse(
      this: void,
      headers: HthvForwarded.Headers,
      defaults: HthvForwarded.Defaults,
      trust: HthvForwardTrust = {},
  ): HthvForwarded {

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

    return HthvForwarded.by(items, defaults, trust);
  },

};

/**
 * @internal
 */
function hthvXForwardedItems(headers: HthvForwarded.Headers): HthvItem[] {

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
      pl.push(host);
    }
    if (proto) {
      p.proto = proto;
      pl.push(proto);
    }

    items.push(hthvItem({ n: 'for', v, p, pl }));
  }

  return items;
}

