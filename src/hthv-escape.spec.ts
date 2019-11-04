import { hthvEscape, hthvEscapeComment } from './hthv-escape';

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

describe('hthvEscapeComment', () => {
  it('does not alter safe string', () => {
    expect(hthvEscapeComment('abc')).toBe('abc');
  });
  it('does not alter empty string', () => {
    expect(hthvEscapeComment('')).toBe('');
  });
  it('escapes backslash', () => {
    expect(hthvEscapeComment('ab\\cd')).toBe('ab\\\\cd');
    expect(hthvEscapeComment('\\abcd')).toBe('\\\\abcd');
    expect(hthvEscapeComment('abcd\\')).toBe('abcd\\\\');
    expect(hthvEscapeComment('\\')).toBe('\\\\');
  });
  it('escapes quote', () => {
    expect(hthvEscapeComment('ab"cd')).toBe('ab\\"cd');
    expect(hthvEscapeComment('"abcd')).toBe('\\"abcd');
    expect(hthvEscapeComment('abcd"')).toBe('abcd\\"');
    expect(hthvEscapeComment('"')).toBe('\\"');
  });
  it('escapes multiple entries', () => {
    expect(hthvEscapeComment('ab\\cd"ef"')).toBe('ab\\\\cd\\"ef\\"');
  });
  it('escapes closing parent', () => {
    expect(hthvEscapeComment('ab(cd')).toBe('ab\\(cd');
    expect(hthvEscapeComment('(abcd')).toBe('\\(abcd');
    expect(hthvEscapeComment('abcd(')).toBe('abcd\\(');
    expect(hthvEscapeComment('(')).toBe('\\(');
  });
  it('escapes opening parent', () => {
    expect(hthvEscapeComment('ab)cd')).toBe('ab\\)cd');
    expect(hthvEscapeComment(')abcd')).toBe('\\)abcd');
    expect(hthvEscapeComment('abcd)')).toBe('abcd\\)');
    expect(hthvEscapeComment(')')).toBe('\\)');
  });
});
