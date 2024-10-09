import type { IncomingHttpHeaders, IncomingMessage } from 'node:http';
import type { Socket } from 'node:net';
import type { TLSSocket } from 'node:tls';
import { URL } from 'node:url';
import { HttpForwardRep } from '../headers/http-forward-rep.js';
import { HttpForwardTrust } from '../headers/http-forward-trust.js';

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
   * Collects {@link http-header-value/headers.js!HttpForwardRep.Defaults proxy forwarding defaults} from HTTP
   * request.
   *
   * This information does not rely on proxy forwarding information.
   *
   * @param request - HTTP request to collect information from.
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

    const { localAddress, localPort, remoteAddress = 'unknown' } = connection;

    return {
      by: localAddress || 'unknown',
      for: remoteAddress,
      host:
        headers.host ||
        (localAddress ? (localPort ? `${localAddress}:${localPort}` : localAddress) : 'unknown'),
      proto: (connection as TLSSocket).encrypted ? 'https' : 'http',
    };
  },

  /**
   * Builds addressing report by HTTP request.
   *
   * Uses {@link http-header-value/headers.js!HttpForwardRep#by HttpForwardRep.by()} to collect trusted proxy
   * forwarding information.
   *
   * @param request - HTTP request to collect information from.
   * @param trust - A trust policy to proxy forwarding records.
   *
   * @returns  Collected HTTP request info.
   */
  by(this: void, request: IncomingMessage, trust?: HttpForwardTrust): HttpAddressRep {
    const forwarded = HttpForwardRep.by(request.headers, HttpAddressRep.defaults(request), trust);

    let requestURL: URL | undefined;

    return {
      forward: forwarded,
      ip: forwarded.for,
      get url(): URL {
        return (
          requestURL ||
          (requestURL = new URL(request.url || '', `${forwarded.proto}://${forwarded.host}`))
        );
      },
    };
  },
};
