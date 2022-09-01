import { describe, expect, it } from '@jest/globals';
import { httpLanguageNegotiator } from './http-language-negotiator';

describe('httpLanguageNegotiator', () => {
  describe('*', () => {
    const negotiator = httpLanguageNegotiator({ '*': 'any' });

    it('does not match arbitrary request', () => {
      expect(negotiator('en-US')).toBeUndefined();
    });
    it('matches `*` request', () => {
      expect(negotiator('*')).toBe('any');
    });
    it('returns `0` for wildcard-prohibiting request', () => {
      expect(negotiator('en-US,*;q=0')).toBe(0);
    });
  });

  describe('en', () => {
    const negotiator = httpLanguageNegotiator({
      en: 'hello',
    });

    it('does not match more precise request', () => {
      expect(negotiator('en-US')).toBeUndefined();
    });
    it('matches `en` request', () => {
      expect(negotiator('en')).toBe('hello');
    });
    it('matches `*` request', () => {
      expect(negotiator('*')).toBe('hello');
    });
    it('returns `0` for wildcard-prohibiting request', () => {
      expect(negotiator('en-US,*;q=0')).toBe(0);
    });
    it('returns `0` for language-prohibiting request', () => {
      expect(negotiator('en-US,en;q=0')).toBe(0);
    });
  });

  describe('en-US', () => {
    const negotiator = httpLanguageNegotiator({
      'en-US': 'hi',
    });

    it('matches exact request', () => {
      expect(negotiator('en-US')).toBe('hi');
    });
    it('does not match more precise request', () => {
      expect(negotiator('en-US-some')).toBeUndefined();
    });
    it('matches `en` request', () => {
      expect(negotiator('en')).toBe('hi');
    });
    it('does not match different language request', () => {
      expect(negotiator('fr')).toBeUndefined();
    });
    it('matches `*` request', () => {
      expect(negotiator('*')).toBe('hi');
    });
    it('returns `0` for wildcard-prohibiting request', () => {
      expect(negotiator('en-GB,*;q=0')).toBe(0);
    });
    it('returns `0` for language-prohibiting request', () => {
      expect(negotiator('en-GB,en;q=0')).toBe(0);
    });
    it('returns `0` for explicitly prohibiting request', () => {
      expect(negotiator('en-GB,en-US;q=0')).toBe(0);
    });
  });
});
