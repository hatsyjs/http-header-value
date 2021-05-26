import { describe, expect, it } from '@jest/globals';
import { HttpForwardTrust, HttpForwardTrustMask } from './http-forward-trust';

describe('HttpForwardTrust', () => {
  describe('by', () => {
    it('always returns `DontTrust` by default', () => {
      expect((HttpForwardTrust.by() as any)()).toBe(HttpForwardTrustMask.DontTrust);
    });
  });
});
