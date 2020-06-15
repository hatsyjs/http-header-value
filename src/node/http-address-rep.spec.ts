import { IncomingHttpHeaders, IncomingMessage } from 'http';
import { URL } from 'url';
import { HttpForwardTrust } from '../headers';
import { HttpAddressRep } from './http-address-rep';

describe('HthvAddressRep', () => {

  let url: string | undefined;
  let request: IncomingMessage;
  let headers: IncomingHttpHeaders;
  let connection: { encrypted?: boolean, localAddress: string, localPort: number, remoteAddress?: string };

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

  describe('requestURL', () => {
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

      const info = HttpAddressRep.collect(request, { trusted: true });

      expect(info.requestURL).toBe(info.requestURL);
    });

    function requestURL(trust?: HttpForwardTrust): URL {
      return HttpAddressRep.collect(request, trust).requestURL;
    }
  });

  describe('remoteAddress', () => {
    it('is `unknown` if not present in request and proxy forwarding info', () => {
      expect(remoteAddress()).toBe('unknown');
    });
    it('is remote address of the request', () => {
      connection.remoteAddress = '192.168.2.100';
      expect(remoteAddress()).toBe('192.168.2.100');
    });
    it('is extracted from trusted forwarding info', () => {
      headers = { forwarded: 'by=proxy;for=192.168.2.200;host=test-host:8443;proto=https' };
      connection.remoteAddress = '192.168.2.100';
      expect(remoteAddress({ trusted: true })).toBe('192.168.2.200');
    });

    function remoteAddress(trust?: HttpForwardTrust): string {
      return HttpAddressRep.collect(request, trust).remoteAddress;
    }
  });
});
