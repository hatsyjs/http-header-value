import { HthvForwarded } from './hthv-forwarded';

describe('HthvForwarded', () => {

  let headers: HthvForwarded.Headers;
  let defaults: HthvForwarded.Defaults;

  beforeEach(() => {
    headers = {};
    defaults = { by: 'local-address', for: 'remote-address', host: 'localhost', proto: 'http' };
  });

  it('does not extract absent forwarding info', () => {
    expect(HthvForwarded.parse(headers, defaults, { trusted: true })).toEqual(defaults);
  });
  it('does not trust forwarding info by default', () => {
    headers = { forwarded: 'host=test' };
    expect(HthvForwarded.parse(headers, defaults)).toEqual(defaults);
  });
  it('extracts first record when trust all', () => {
    headers = { forwarded: 'host=test1;proto=http,host=test2;proto=https' };
    expect(HthvForwarded.parse(headers, defaults, { trusted: true })).toEqual({
      ...defaults,
      host: 'test1',
      proto: 'http',
    });
  });
  it('extracts trusted source record', () => {
    headers = {
      forwarded: 'host=test;proto=http,'
          + 'by=proxy1;host=test1;proto=http,'
          + 'by=proxy2;host=test2;proto=https',
    };
    expect(HthvForwarded.parse(headers, defaults, { trusted: 'proxy2' })).toEqual({
      ...defaults,
      by: 'proxy2',
      host: 'test2',
      proto: 'https',
    });
  });
  it('extracts record trusted by next one', () => {
    headers = {
      forwarded: 'host=test;proto=http,'
          + 'by=proxy1;host=test1;proto=http,'
          + 'by=proxy2;host=test2;proto=https',
    };
    expect(HthvForwarded.parse(headers, defaults, { trusted: defaults.for })).toEqual({
      ...defaults,
      by: 'proxy2',
      host: 'test2',
      proto: 'https',
    });
  });
  it('extracts record trusted by predicate', () => {
    headers = {
      forwarded: 'host=test;proto=http,'
          + 'by=proxy1;host=test1;proto=http,'
          + 'by=proxy2;host=test2;proto=https',
    };
    expect(HthvForwarded.parse(
        headers,
        defaults,
        {
          trusted(_, index) {
            return index <= 2;
          },
        },
    )).toEqual({
      ...defaults,
      by: 'proxy1',
      host: 'test1',
      proto: 'http',
    });
  });
  it('extracts first of the trusted source records', () => {
    headers = {
      forwarded: 'host=test;proto=http,'
          + 'by=proxy1;host=test1;proto=http,'
          + 'by=proxy2;host=test2;proto=https',
    };
    expect(HthvForwarded.parse(headers, defaults, { trusted: ['proxy1', 'proxy2'] })).toEqual({
      ...defaults,
      by: 'proxy1',
      host: 'test1',
      proto: 'http',
    });
  });
  it('extracts first trusted record with requested key', () => {
    headers = { forwarded: 'by=proxy1;host=test1;proto=http,by=proxy2;host=test2;proto=https;secret=some' };
    expect(HthvForwarded.parse(headers, defaults, { trusted: [['secret', 'some']] })).toEqual({
      ...defaults,
      by: 'proxy2',
      host: 'test2',
      proto: 'https',
      secret: 'some',
    });
  });
  it('does not extract untrusted records', () => {
    headers = { forwarded: 'by=proxy1;host=test1;proto=http,by=proxy2;host=test2;proto=https;secret=some' };
    expect(HthvForwarded.parse(headers, defaults, { trusted: [['secret', 'other']] })).toEqual(defaults);
  });
  it('extracts first trusted record after trust chain broken', () => {
    headers = {
      forwarded: 'by=proxy1;host=test1;proto=http;secret=some,'
          + 'by=proxy2;host=test2;proto=https,'
          + 'by=proxy3;host=test3;proto=https;secret=some',
    };
    expect(HthvForwarded.parse(headers, defaults, { trusted: [['secret', 'some']] })).toEqual({
      ...defaults,
      by: 'proxy3',
      host: 'test3',
      proto: 'https',
      secret: 'some',
    });
  });
  it('handles items without names', () => {
    headers = { forwarded: 'by=proxy1;host=test1;proto=http,wrong;host=test2;proto=https;secret=some' };
    expect(HthvForwarded.parse(headers, defaults, { trusted: [['secret', 'some']] })).toEqual({
      ...defaults,
      host: 'test2',
      proto: 'https',
      secret: 'some',
    });
  });
  it('handles parameters without names', () => {
    headers = { forwarded: 'by=proxy1;host=test1;proto=http,by=proxy2;wrong;host=test2;proto=https;secret=some' };
    expect(HthvForwarded.parse(headers, defaults, { trusted: [['secret', 'some']] })).toEqual({
      ...defaults,
      by: 'proxy2',
      host: 'test2',
      proto: 'https',
      secret: 'some',
    });
  });
});
