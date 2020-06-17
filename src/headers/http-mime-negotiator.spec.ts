import { hthvParse } from '../hthv-parse';
import { httpMimeNegotiator } from './http-mime-negotiator';

describe('httpMimeNegotiator', () => {
  describe('*/*', () => {

    const negotiator = httpMimeNegotiator({
      '*/*': 'any',
    });

    it('does not match arbitrary request', () => {
      expect(negotiator('text/html')).toBeUndefined();
      expect(negotiator(hthvParse('text/html'))).toBeUndefined();
    });
    it('matches `*/*` request', () => {
      expect(negotiator('*/*')).toBe('any');
      expect(negotiator(hthvParse('*/*'))).toBe('any');
    });
    it('returns `0` for wildcard-prohibiting request', () => {
      expect(negotiator('text/html,*/*;q=0')).toBe(0);
      expect(negotiator(hthvParse('text/html,*/*;q=0'))).toBe(0);
    });
  });

  describe('text/*', () => {

    const negotiator = httpMimeNegotiator({
      'text/*': 'text',
    });
    const shorthand = httpMimeNegotiator({
      text: 'text',
    });

    it('does not match more precise request', () => {
      expect(negotiator('text/html')).toBeUndefined();
      expect(shorthand('text/html')).toBeUndefined();
    });
    it('matches `text/*` request', () => {
      expect(negotiator('text/*')).toBe('text');
      expect(shorthand('text/*')).toBe('text');
    });
    it('matches `*/*` request', () => {
      expect(negotiator('*/*')).toBe('text');
      expect(shorthand('*/*')).toBe('text');
    });
    it('returns `0` for wildcard-prohibiting request', () => {
      expect(negotiator('text/html,*/*;q=0')).toBe(0);
      expect(shorthand('text/html,*/*;q=0')).toBe(0);
    });
    it('returns `0` for type wildcard-prohibiting request', () => {
      expect(negotiator('text/html,text/*;q=0')).toBe(0);
      expect(shorthand('text/html,text/*;q=0')).toBe(0);
    });
  });

  describe('text/html', () => {

    const negotiator = httpMimeNegotiator({
      'text/html': 'html',
    });

    it('matches exact request', () => {
      expect(negotiator('text/html')).toBe('html');
    });
    it('does not match exact request', () => {
      expect(negotiator('text/plain')).toBeUndefined();
    });
    it('matches `text/*` request', () => {
      expect(negotiator('text/*')).toBe('html');
    });
    it('matches `*/*` request', () => {
      expect(negotiator('*/*')).toBe('html');
    });
    it('returns `0` for wildcard-prohibiting request', () => {
      expect(negotiator('text/plain,*/*;q=0')).toBe(0);
    });
    it('returns `0` for type wildcard-prohibiting request', () => {
      expect(negotiator('text/plain,text/*;q=0')).toBe(0);
    });
    it('returns `0` for explicitly prohibiting request', () => {
      expect(negotiator('text/plain,text/html;q=0')).toBe(0);
    });
  });

  describe('Q-factor', () => {
    it('prefers request with higher Q-factor', () => {

      const negotiator = httpMimeNegotiator({ 'text/html': 'html', 'text/plain': 'text' });

      expect(negotiator('text/html;q=0.8,text/plain')).toBe('text');
      expect(negotiator('text/plain,text/html;q=0.8')).toBe('text');
    });
    it('prefers wildcard request with higher Q-factor', () => {

      const negotiator = httpMimeNegotiator({ 'text/html': 'html', 'text/*': 'text' });

      expect(negotiator('text/html;q=0.8,text/*')).toBe('text');
      expect(negotiator('text/*,text/html;q=0.8')).toBe('text');
    });
    it('prefers exact match over wildcard with the same Q-factor', () => {

      const negotiator = httpMimeNegotiator({ 'text/html': 'html', 'text/*': 'text' });

      expect(negotiator('text/html,text/*')).toBe('html');
      expect(negotiator('text/*,text/html')).toBe('html');
    });
    it('treats too big Q-factor as `1`', () => {

      const negotiator = httpMimeNegotiator({ 'text/html': 'html', 'text/plain': 'text' });

      expect(negotiator('text/html;q=99,text/plain')).toBe('html');
      expect(negotiator('text/plain,text/html;q=99')).toBe('text');
    });
    it('treats negative Q-factor as `0`', () => {

      const negotiator = httpMimeNegotiator({ 'text/html': 'html', 'text/plain': 'text' });

      expect(negotiator('text/html;q=-99,text/plain')).toBe('text');
      expect(negotiator('text/plain,text/html;q=-99')).toBe('text');
      expect(negotiator('text/html;q=-99')).toBe(0);
    });
  });
});
