import { beforeEach, describe, expect, it } from '@jest/globals';
import type { IncomingHttpHeaders, IncomingMessage } from 'http';
import type { URL } from 'url';
import type { HttpForwardTrust } from '../headers';
import { HttpAddressRep } from './http-address-rep';

describe('HthvAddressRep', () => {

  let url: string | undefined;
  let request: IncomingMessage;
  let headers: IncomingHttpHeaders;
  let connection: {
    encrypted?: boolean | undefined;
    localAddress: string | undefined;
    localPort: number;
    remoteAddress?: string | undefined;
  };

  beforeEach(() => {
    headers = {};
    connection = {
      localAddress: '127.0.0.1',
      localPort: 80,
    };
    request = {
      get url() { return url; },
      get connection() { return connection; },
      get headers() { return headers; },
    } as IncomingMessage;
  });

  describe('url', () => {
    it('detects host name by local address by default', () => {
      expect(requestURL().href).toBe('http://127.0.0.1/');
    });
    it('detects port by local port by default', () => {
      connection.localPort = 8080;
      expect(requestURL().href).toBe('http://127.0.0.1:8080/');
    });
    it('detects host by `Host` header when present', () => {
      headers.host = 'test-host';
      expect(requestURL().href).toBe('http://test-host/');
    });
    it('detects protocol by secure connection', () => {
      connection.encrypted = true;
      connection.localPort = 443;
      expect(requestURL().href).toBe('https://127.0.0.1/');
    });
    it('detects path by request URL', () => {
      url = '/path';
      expect(requestURL().href).toBe('http://127.0.0.1/path');
    });
    it('detects host by trusted forwarding info', () => {
      headers = { forwarded: 'by=proxy;host=test-host:8443;proto=https' };
      url = '/path';
      expect(requestURL({ trusted: true }).href).toBe('https://test-host:8443/path');
    });
    it('is cached once evaluated', () => {
      headers = { forwarded: 'by=proxy;host=test-host:8443;proto=https' };
      url = '/path';

      const info = HttpAddressRep.by(request, { trusted: true });

      expect(info.url).toBe(info.url);
    });

    function requestURL(trust?: HttpForwardTrust): URL {
      return HttpAddressRep.by(request, trust).url;
    }
  });

  describe('ip', () => {
    it('is `unknown` if not present in request and proxy forwarding info', () => {
      expect(requestIp()).toBe('unknown');
    });
    it('is remote address of the request', () => {
      connection.remoteAddress = '192.168.2.100';
      expect(requestIp()).toBe('192.168.2.100');
    });
    it('is extracted from trusted forwarding info', () => {
      headers = { forwarded: 'by=proxy;for=192.168.2.200;host=test-host:8443;proto=https' };
      connection.remoteAddress = '192.168.2.100';
      expect(requestIp({ trusted: true })).toBe('192.168.2.200');
    });

    function requestIp(trust?: HttpForwardTrust): string {
      return HttpAddressRep.by(request, trust).ip;
    }
  });
});
