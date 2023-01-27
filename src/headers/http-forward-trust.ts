import type { HthvItem } from '../hthv-item';

/**
 * A trust policy to HTTP proxy forwarding records.
 *
 * Defines how to treat proxy forwarding information contained in request headers.
 */
export interface HttpForwardTrust {
  /**
   * Whether the forwarding records in HTTP request headers are trusted.
   *
   * When this information is trusted the host and protocol in request header is used as a request ones.
   *
   * This can be one of:
   * - `false` to never trust any proxies,
   * - `true` to trust all proxies,
   * - a {@link HttpForwardTrust.Checker trust checker function},
   * - a {@link HttpForwardTrust.Params trusted parameters map}.
   *
   * @defaultValue `false` which means the `Forwarded` and `X-Forwarded-...` headers won't be parsed.
   */
  readonly trusted?: boolean | HttpForwardTrust.Checker | HttpForwardTrust.Params;

  /**
   * Whether to consider `X-Forwarded-...` headers if `Forwarded` is absent.
   *
   * An {@link @hatsy/http-header-value!HthvItem}s corresponding to `Forwarded` records are constructed by these record
   * values.
   *
   * @default `true` which means these headers are processed.
   */
  readonly xForwarded?: boolean | undefined;
}

export namespace HttpForwardTrust {
  /**
   * Signature of function that checks whether the forwarding record value can be trusted.
   *
   * This function is called for each forwarding record in reverse order. The very last record is always trusted
   * as it contains local address info.
   *
   * @param item - An item of the `Forwarded` header value containing a record to check.
   * @param index - Reverse `item` index. I.e. the last one has `0` index.
   *
   * @returns Bitwise {@link HttpForwardTrustMask mask} of the trust.
   */
  export type Checker = (this: void, item: HthvItem, index: number) => HttpForwardTrustMask;

  /**
   * A map of trusted parameters.
   *
   * The proxy forwarding record is trusted if it contains parameter present in this map, and its value present among
   * corresponding {@link Values trusted values}.
   */
  export interface Params {
    readonly by?: Values | undefined;
    readonly for?: Values | undefined;

    /**
     * Maps forwarding record parameter name to trusted values.
     */
    readonly [name: string]: Values | undefined;
  }

  /**
   * A map of trusted parameter values.
   */
  export interface Values {
    /**
     * Maps forwarding record parameter value to {@link Mask bitwise mask of the trust}.
     */
    readonly [value: string]: HttpForwardTrustMask | undefined;
  }
}

/**
 * Bitwise mask of the trust to proxy forwarding information.
 */
export const enum HttpForwardTrustMask {
  /**
   * Do not trust mask.
   */
  DontTrust = 0,

  /**
   * Trust the checked record flag.
   */
  TrustCurrent = 1,

  /**
   * Trust a record preceding to checked one flag.
   */
  TrustPrevious = 2,

  /**
   * Always trust mask.
   */
  AlwaysTrust = TrustCurrent | TrustPrevious,
}

export const HttpForwardTrust = {
  /**
   * Builds HTTP request forwarding trust checker function by forwarding info trust policy.
   *
   * @param trust - A trust policy to proxy forwarding records.
   *
   * @returns Constructed trust predicate function.
   */
  by(this: void, trust: HttpForwardTrust = {}): HttpForwardTrust.Checker {
    const { trusted = false } = trust;

    if (typeof trusted === 'function') {
      return trusted; // Already a function.
    }
    if (typeof trusted === 'boolean') {
      const mask = trusted ? HttpForwardTrustMask.AlwaysTrust : HttpForwardTrustMask.DontTrust;

      return () => mask;
    }

    const params: HttpForwardTrust.Params = trusted;

    return item => {
      let result = itemTrustMask(item);

      for (const p of item.pl) {
        result |= itemTrustMask(p);
      }

      return result;
    };

    function itemTrustMask({ n, v }: HthvItem<any, any, any>): HttpForwardTrustMask {
      return (n && params[n]?.[v]) || HttpForwardTrustMask.DontTrust;
    }
  },
};
