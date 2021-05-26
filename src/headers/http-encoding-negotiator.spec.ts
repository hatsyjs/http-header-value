import { describe, expect, it } from '@jest/globals';
import { httpEncodingNegotiator } from './http-encoding-negotiator';

describe('httpEncodingNegotiator', () => {
  describe('*', () => {

    const negotiator = httpEncodingNegotiator({ '*': 'raw' });

    it('does not match arbitrary request', () => {
      expect(negotiator('identity')).toBeUndefined();
    });
    it('matches `*` request', () => {
      expect(negotiator('*')).toBe('raw');
    });
    it('returns `0` for wildcard-prohibiting request', () => {
      expect(negotiator('gzip,*;q=0')).toBe(0);
    });
  });

  describe('gzip', () => {

    const negotiator = httpEncodingNegotiator({
      gzip: 'zipped',
    });

    it('does not match different encoding request', () => {
      expect(negotiator('deflate')).toBeUndefined();
    });
    it('matches `gzip` request', () => {
      expect(negotiator('gzip')).toBe('zipped');
    });
    it('matches `*` request', () => {
      expect(negotiator('*')).toBe('zipped');
    });
    it('returns `0` for wildcard-prohibiting request', () => {
      expect(negotiator('deflate,*;q=0')).toBe(0);
    });
    it('returns `0` for encoding-prohibiting request', () => {
      expect(negotiator('deflate,gzip;q=0')).toBe(0);
    });
  });
});
