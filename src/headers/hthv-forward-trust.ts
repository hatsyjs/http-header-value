/**
 * @packageDocumentation
 * @module @hatsy/http-header-value/headers
 */
import { HthvItem } from '../hthv-item';

/**
 * A trust policy to proxy forwarding records.
 *
 * Defines how to treat proxy forwarding information contained in request headers.
 */
export interface HthvForwardTrust {

  /**
   * Whether the forwarding records in HTTP request headers are trusted.
   *
   * When this information is trusted the host and protocol in request header is used as a request ones.
   *
   * This can be one of:
   * - `false` to never trust any proxies,
   * - `true` to trust all proxies,
   * - a {@link HthvForwardTrust.Checker trust checker function},
   * - a {@link HthvForwardTrust.Params trusted parameters map}.
   *
   * @default `false` which means the `Forwarded` and `X-Forwarded-...` headers won't be parsed.
   */
  readonly trusted?:
      | boolean
      | HthvForwardTrust.Checker
      | HthvForwardTrust.Params;

  /**
   * Whether to consider `X-Forwarded-...` headers if `Forwarded` is absent.
   *
   * An {@link HthvItem}s corresponding to `Forwarded` records are constructed by these record values.
   *
   * @default `true` which means these headers are processed.
   */
  readonly xForwarded?: boolean;

}

export namespace HthvForwardTrust {

  /**
   * Signature of function that checks whether the forwarding record value can be trusted.
   *
   * This function is called for each forwarding record in reverse order. The very last record is always trusted
   * as it contains local address info.
   */
  export type Checker =
  /**
   * @param item  An item of the `Forwarded` header value containing a record to check.
   * @param index  Reverse `item` index. I.e. the last one has `0` index.
   *
   * @returns Bitwise {@link Mask mask} of the trust.
   */
      (this: void, item: HthvItem, index: number) => Mask;

  /**
   * Bitwise mask of the trust.
   */
  export const enum Mask {

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

  /**
   * A map of trusted parameters.
   *
   * The proxy forwarding record is trusted if it contains parameter present in this map, and its value present among
   * corresponding {@link Values trusted values}.
   */
  export interface Params {

    readonly by?: Values;
    readonly for?: Values;

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
    readonly [value: string]: Mask | undefined;

  }

}
