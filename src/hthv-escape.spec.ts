import { hthvEscapeQ, hthvEscapeC } from './hthv-escape';

describe('hthvQEscape', () => {
  it('does not alter safe string', () => {
    expect(hthvEscapeQ('abc')).toBe('abc');
  });
  it('does not alter empty string', () => {
    expect(hthvEscapeQ('')).toBe('');
  });
  it('escapes backslash', () => {
    expect(hthvEscapeQ('ab\\cd')).toBe('ab\\\\cd');
    expect(hthvEscapeQ('\\abcd')).toBe('\\\\abcd');
    expect(hthvEscapeQ('abcd\\')).toBe('abcd\\\\');
    expect(hthvEscapeQ('\\')).toBe('\\\\');
  });
  it('escapes quote', () => {
    expect(hthvEscapeQ('ab"cd')).toBe('ab\\"cd');
    expect(hthvEscapeQ('"abcd')).toBe('\\"abcd');
    expect(hthvEscapeQ('abcd"')).toBe('abcd\\"');
    expect(hthvEscapeQ('"')).toBe('\\"');
  });
  it('escapes multiple entries', () => {
    expect(hthvEscapeQ('ab\\cd"ef"')).toBe('ab\\\\cd\\"ef\\"');
  });
});

describe('hthvCEscape', () => {
  it('does not alter safe string', () => {
    expect(hthvEscapeC('abc')).toBe('abc');
  });
  it('does not alter empty string', () => {
    expect(hthvEscapeC('')).toBe('');
  });
  it('escapes backslash', () => {
    expect(hthvEscapeC('ab\\cd')).toBe('ab\\\\cd');
    expect(hthvEscapeC('\\abcd')).toBe('\\\\abcd');
    expect(hthvEscapeC('abcd\\')).toBe('abcd\\\\');
    expect(hthvEscapeC('\\')).toBe('\\\\');
  });
  it('escapes quote', () => {
    expect(hthvEscapeC('ab"cd')).toBe('ab\\"cd');
    expect(hthvEscapeC('"abcd')).toBe('\\"abcd');
    expect(hthvEscapeC('abcd"')).toBe('abcd\\"');
    expect(hthvEscapeC('"')).toBe('\\"');
  });
  it('escapes multiple entries', () => {
    expect(hthvEscapeC('ab\\cd"ef"')).toBe('ab\\\\cd\\"ef\\"');
  });
  it('escapes closing parent', () => {
    expect(hthvEscapeC('ab(cd')).toBe('ab\\(cd');
    expect(hthvEscapeC('(abcd')).toBe('\\(abcd');
    expect(hthvEscapeC('abcd(')).toBe('abcd\\(');
    expect(hthvEscapeC('(')).toBe('\\(');
  });
  it('escapes opening parent', () => {
    expect(hthvEscapeC('ab)cd')).toBe('ab\\)cd');
    expect(hthvEscapeC(')abcd')).toBe('\\)abcd');
    expect(hthvEscapeC('abcd)')).toBe('abcd\\)');
    expect(hthvEscapeC(')')).toBe('\\)');
  });
});
