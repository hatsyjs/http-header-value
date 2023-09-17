import { describe, expect, it } from '@jest/globals';
import { items, paramItem } from '../spec/items.js';
import { hthvParseCommented } from './hthv-parse-commented.js';

describe('hthvParseCommented', () => {
  it('recognizes empty comment', () => {
    expect(hthvParseCommented('()')).toEqual(items({ $: 'raw', v: '' }));
  });
  it('recognizes raw comment', () => {
    expect(hthvParseCommented('(comment)')).toEqual(items({ $: 'raw', v: 'comment' }));
  });
  it('recognizes incomplete raw comment', () => {
    expect(hthvParseCommented('(comment')).toEqual(items({ $: 'raw', v: 'comment' }));
  });
  it('recognizes parameter comment', () => {
    expect(hthvParseCommented('(comment:param)')).toEqual(
      items({ $: 'raw', n: 'comment', v: 'param' }),
    );
  });
  it('recognizes quoted comment', () => {
    expect(hthvParseCommented('("comment")')).toEqual(items({ $: 'quoted-string', v: 'comment' }));
  });
  it('recognizes tagged comment', () => {
    expect(hthvParseCommented('(tag"comment")')).toEqual(
      items({ $: 'tagged-string', t: 'tag', v: 'comment' }),
    );
  });
  it('unescapes colon', () => {
    expect(hthvParseCommented('(comment\\:param)')).toEqual(
      items({ $: 'raw', v: 'comment:param' }),
    );
  });
  it('unescapes closing parent', () => {
    expect(hthvParseCommented('(comment\\)param)')).toEqual(
      items({ $: 'raw', v: 'comment)param' }),
    );
  });
  it('unescapes arbitrary symbol', () => {
    expect(hthvParseCommented('(com\\ment)')).toEqual(items({ $: 'raw', v: 'comment' }));
  });
  it('does not unescape last backslash', () => {
    expect(hthvParseCommented('(comment\\')).toEqual(items({ $: 'raw', v: 'comment\\' }));
  });
  it('accepts spaces an colons', () => {
    expect(hthvParseCommented('(some comment, for test)')).toEqual(
      items({ $: 'raw', v: 'some comment, for test' }),
    );
  });
  it('recognizes comment parameters', () => {
    const p1 = paramItem({
      $: 'raw',
      n: 'p1',
      v: 'value, with space and colon',
    });
    const p2 = paramItem({
      $: 'quoted-string',
      n: 'p2',
      v: 'value in quotes',
    });

    expect(
      hthvParseCommented('(comment; p1:value, with space and colon; p2:"value in quotes")'),
    ).toEqual(items({ $: 'raw', v: 'comment', p: { p1, p2 }, pl: [p1, p2] }));
  });
  it('recognizes headless comment parameter', () => {
    const param = paramItem({
      $: 'raw',
      v: 'test param',
    });

    expect(hthvParseCommented('(;test param)')).toEqual(
      items({ $: 'raw', v: '', p: { 'test param': param }, pl: [param] }),
    );
  });
  it('recognizes User-Agent string', () => {
    const linux = paramItem({
      $: 'raw',
      v: 'Linux x86_64',
    });
    const rv = paramItem({
      $: 'raw',
      n: 'rv',
      v: '70.0',
    });

    expect(
      hthvParseCommented('Mozilla/5.0 (X11; Linux x86_64; rv:70.0) Gecko/20100101 Firefox/70.0'),
    ).toEqual(
      items(
        { $: 'raw', v: 'Mozilla/5.0' },
        { $: 'raw', v: 'X11', p: { 'Linux x86_64': linux, rv }, pl: [linux, rv] },
        { $: 'raw', v: 'Gecko/20100101' },
        { $: 'raw', v: 'Firefox/70.0' },
      ),
    );
  });
});
