import { IncomingHttpHeaders, IncomingMessage } from 'http';
import { HthvForwarded } from '../headers';
import { HthvRequestInfo } from './hthv-request-info';

describe('HthvRequestInfo', () => {

  let url: string | undefined;
  let request: IncomingMessage;
  let headers: IncomingHttpHeaders;
  let connection: { encrypted?: boolean, localAddress: string, localPort: number };

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

    function requestURL(trust?: HthvForwarded.Trust): URL {
      return HthvRequestInfo.collect(request, trust).requestURL;
    }
  });
});
