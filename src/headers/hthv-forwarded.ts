/**
 * @packageDocumentation
 * @module @hatsy/http-header-value
 */
import { HthvItem, HthvParamItem, HthvParamMap } from '../hthv-item';
import { hthvParse } from '../hthv-parse';
import { hthvItem } from '../hthv-partial.impl';
import { hthvParseFirstTrivial, hthvParseTrivial } from './hthv-parse-primitive.impl';

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
    readonly forwarded?: string;

    /**
     * [X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For) header value.
     */
    readonly 'x-forwarded-for'?: string;

    /**
     * [X-Forwarded-Host](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Host) header value.
     */
    readonly 'x-forwarded-host'?: string;

    /**
     * [X-Forwarded-Proto](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Proto) header value.
     */
    readonly 'x-forwarded-proto'?: string;

    /**
     * Header value with its lower-case name as property name.
     */
    readonly [name: string]: string | undefined;

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

  /**
   * Signature of predicate function that checks whether the forwarding record value can be trusted.
   *
   * This predicate is called for each forwarding record in reverse order. The very last record is always trusted
   * as it contains local address info.
   */
  export type IsTrusted =
  /**
   * @param item  An item of the `Forwarded` header value containing a record to check.
   * @param index  Reverse `item` index. I.e. the last one has `0` index.
   *
   * @returns `true` if the record can be trusted, `"prev"` if the preceding record can be trusted,
   * or `false` otherwise.
   */
      (this: void, item: HthvItem, index: number) => boolean | 'prev';

  /**
   * A trust policy to proxy forwarding records.
   *
   * Defines how to treat proxy forwarding information contained in request headers.
   */
  export interface Trust {

    /**
     * Whether the forwarding records in HTTP request headers are trusted.
     *
     * When this information is trusted the host and protocol in request header is used as a request ones.
     *
     * This can be one of:
     * - `false` to never trust any proxies,
     * - `true` to trust all proxies,
     * - {@link IsTrusted trust predicate function},
     * - a string containing a proxy address that can be trusted,
     * - an array of trusted records specifiers;
     *   each item in this array is either a string containing a trusted proxy address, or a tuple consisting of
     *   attribute name and value parameter of trusted record (e.g. `['secret', 'some_secret_hash']`).
     *
     * @default `false` which means the `Forwarded` and `X-Forwarded-...` headers won't be parsed.
     */
    readonly trusted?:
        | IsTrusted
        | boolean
        | string
        | readonly (string | readonly [string, string])[];

    /**
     * Whether to consider `X-Forwarded-...` headers if `Forwarded` is absent.
     *
     * An {@link HthvItem}s corresponding to `Forwarded` records are constructed by these record values.
     *
     * @default `true` which means these headers are processed.
     */
    readonly xForwarded?: boolean;

  }

}

export const HthvForwarded = {

  /**
   * Builds trust predicate function by forwarding info trust policy.
   *
   * @param trust  A trust policy to proxy forwarding records.
   *
   * @returns Constructed trust predicate function.
   */
  isTrusted(trust: HthvForwarded.Trust = {}): HthvForwarded.IsTrusted {

    const { trusted = false } = trust;

    if (typeof trusted === 'function') {
      return trusted; // Already a function.
    }
    if (typeof trusted === 'boolean') {
      return () => trusted; // Never trust.
    }

    const policies: readonly (string | readonly [string, string])[] = typeof trusted === 'string'
        ? [trusted]
        : trusted;

    return item => {
      for (const policy of policies) {
        if (typeof policy === 'string') {
          if (item.p.for?.v === policy) {
            return 'prev';
          } if (item.p.by?.v === policy) {
            return true;
          }
        } else if (item.p[policy[0]]?.v === policy[1]) {
          return true;
        }
      }
      return false;
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
      trust: HthvForwarded.Trust = {},
  ): HthvForwarded {

    const isTrusted = HthvForwarded.isTrusted(trust);
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
    let trustedFlag = isTrusted(trusted, 0) || true; // The last item is always trusted
    let index = 0;

    for (let i = items.length - 1; i >= 0; --i) {

      const item = items[i];

      // Either explicitly trusted or trusted by previous item.
      trustedFlag = isTrusted(item, ++index) || (trustedFlag === 'prev');

      if (!trustedFlag) {
        break;
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
      trust: HthvForwarded.Trust = {},
  ): HthvForwarded {

    const { forwarded } = headers;
    let items: HthvItem[];

    if (forwarded) {
      items = hthvParse(forwarded);
    } else if (!trust.xForwarded) {
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

