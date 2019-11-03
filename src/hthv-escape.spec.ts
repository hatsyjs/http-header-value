import { hthvEscape } from './hthv-escape';

describe('hthvEscape', () => {
  it('does not alter safe string', () => {
    expect(hthvEscape('abc')).toBe('abc');
  });
  it('does not alter empty string', () => {
    expect(hthvEscape('')).toBe('');
  });
  it('escapes backslash', () => {
    expect(hthvEscape('ab\\cd')).toBe('ab\\\\cd');
    expect(hthvEscape('\\abcd')).toBe('\\\\abcd');
    expect(hthvEscape('abcd\\')).toBe('abcd\\\\');
    expect(hthvEscape('\\')).toBe('\\\\');
  });
  it('escapes quote', () => {
    expect(hthvEscape('ab"cd')).toBe('ab\\"cd');
    expect(hthvEscape('"abcd')).toBe('\\"abcd');
    expect(hthvEscape('abcd"')).toBe('abcd\\"');
    expect(hthvEscape('"')).toBe('\\"');
  });
  it('escapes multiple entries', () => {
    expect(hthvEscape('ab\\cd"ef"')).toBe('ab\\\\cd\\"ef\\"');
  });
});
