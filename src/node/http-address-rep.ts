/**
 * @packageDocumentation
 * @module @hatsy/http-header-value/node
 */
import type { IncomingHttpHeaders, IncomingMessage } from 'http';
import type { Socket } from 'net';
import type { TLSSocket } from 'tls';
import { URL } from 'url';
import { HttpForwardRep, HttpForwardTrust } from '../headers';

/**
 * HTTP request addressing report.
 *
 * Collected with respect to trusted proxy forwarding information.
 */
export interface HttpAddressRep {

  /**
   * Trusted proxy forwarding report.
   */
  readonly forward: HttpForwardRep;

  /**
   * Request URL.
   */
  readonly url: URL;

  /**
   * Remote address.
   */
  readonly ip: string;

}

export const HttpAddressRep = {

  /**
   * Collects {@link HttpForwardRep.Defaults proxy forwarding defaults} from HTTP request.
   *
   * This information does not rely on proxy forwarding information.
   *
   * @param request  HTTP request to collect information from.
   *
   * @returns Collected proxy forwarding defaults.
   */
  defaults(this: void, request: IncomingMessage): HttpForwardRep.Defaults {

    const {
      connection,
      headers,
    }: {
      connection: TLSSocket | Socket;
      headers: IncomingHttpHeaders;
    } = request;

    return {
      by: connection.localAddress,
      for: connection.remoteAddress || 'unknown',
      host: headers.host || (`${connection.localAddress}:${connection.localPort}`),
      proto: ((connection as TLSSocket).encrypted ? 'https' : 'http'),
    };
  },

  /**
   * Builds addressing report by HTTP request.
   *
   * Uses {@link HttpForwardRep.by} to collect trusted proxy forwarding information.
   *
   * @param request  HTTP request to collect information from.
   * @param trust  A trust policy to proxy forwarding records.
   *
   * @returns  Collected HTTP request info.
   */
  by(this: void, request: IncomingMessage, trust?: HttpForwardTrust): HttpAddressRep {

    const forwarded = HttpForwardRep.by(
        request.headers,
        HttpAddressRep.defaults(request),
        trust,
    );

    let requestURL: URL | undefined;

    return {
      forward: forwarded,
      ip: forwarded.for,
      get url(): URL {
        return requestURL || (requestURL = new URL(
            request.url || '',
            `${forwarded.proto}://${forwarded.host}`,
        ));
      },
    };
  },

};
