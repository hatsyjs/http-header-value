import { describe, expect, it } from '@jest/globals';
import { hthvQuote } from './hthv-quote';

describe('hthvQuote', () => {
  it('does not alter safe string', () => {
    expect(hthvQuote('abc')).toBe('abc');
  });
  it('quotes empty string', () => {
    expect(hthvQuote('')).toBe('""');
  });
  it('quotes a string with delimiter', () => {
    expect(hthvQuote('a;b=c')).toBe('"a;b=c"');
  });
  it('quotes a string with DEL char', () => {
    expect(hthvQuote('some\u007f')).toBe('"some\u007f"');
  });
  it('quotes a string with special char', () => {
    expect(hthvQuote('some\u0018')).toBe('"some\u0018"');
  });
  it('escapes backslash', () => {
    expect(hthvQuote('ab\\cd')).toBe('"ab\\\\cd"');
    expect(hthvQuote('\\abcd')).toBe('"\\\\abcd"');
    expect(hthvQuote('abcd\\')).toBe('"abcd\\\\"');
    expect(hthvQuote('\\')).toBe('"\\\\"');
  });
  it('escapes quote', () => {
    expect(hthvQuote('ab"cd')).toBe('"ab\\"cd"');
    expect(hthvQuote('"abcd')).toBe('"\\"abcd"');
    expect(hthvQuote('abcd"')).toBe('"abcd\\""');
    expect(hthvQuote('"')).toBe('"\\""');
  });
  it('escapes multiple entries', () => {
    expect(hthvQuote('ab\\cd"ef"')).toBe('"ab\\\\cd\\"ef\\""');
  });
});
