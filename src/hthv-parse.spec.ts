import { describe, expect, it } from '@jest/globals';
import { hthvParse, hthvParseDT } from './hthv-parse';
import { extras, items, paramItem } from './spec/items';

describe('hthvParse', () => {
  it('does not recognizes date/time', () => {

    const timestamp = new Date().toUTCString();

    expect(hthvParse(timestamp)).not.toEqual(items({ $: 'date-time', v: timestamp }));
  });
  it('recognizes raw value', () => {

    const parsed = hthvParse('foo/bar:baz');

    expect(parsed).toEqual(items({ $: 'raw', v: 'foo/bar:baz' }));
    expect(parsed[0].p).toEqual({});
  });
  it('recognizes raw value with special chars', () => {

    const parsed = hthvParse('foo\u007fbar=baz');

    expect(parsed).toEqual(items({ $: 'raw', v: 'foo\u007fbar=baz' }));
    expect(parsed[0].p).toEqual({});
  });
  it('recognizes name/value pair', () => {

    const parsed = hthvParse('foo=bar');

    expect(parsed).toEqual(items({ $: 'raw', n: 'foo', v: 'bar' }));
    expect(parsed[0].p).toEqual({
      foo: { $: 'raw', n: 'foo', v: 'bar', x: [], p: {}, pl: [] },
    });
  });
  it('recognizes broken name/value pair', () => {

    const parsed = hthvParse('=bar');

    expect(parsed).toEqual(items({ $: 'raw', v: '=bar' }));
    expect(parsed[0].p).toEqual({});
  });
  it('recognizes quoted string', () => {

    const parsed = hthvParse('"foo"');

    expect(parsed).toEqual(items({ $: 'quoted-string', v: 'foo' }));
    expect(parsed[0].p).toEqual({});
  });
  it('recognizes tagged string', () => {

    const parsed = hthvParse('tag"value"');

    expect(parsed).toEqual(items({ $: 'tagged-string', t: 'tag', v: 'value' }));
    expect(parsed[0].p).toEqual({});
  });
  it('recognizes quoted string with suffix', () => {
    expect(hthvParse('"value"suffix')).toEqual(items(
        {
          $: 'quoted-string',
          v: 'value',
          x: extras({ $: 'raw', v: 'suffix' }),
        },
    ));
  });
  it('recognizes tagged string with suffix', () => {
    expect(hthvParse('prefix"value"suffix')).toEqual(items(
        {
          $: 'tagged-string',
          t: 'prefix',
          v: 'value',
          x: extras({ $: 'raw', v: 'suffix' }),
        },
    ));
  });
  it('recognizes multi-quote string', () => {
    expect(hthvParse('foo"1""2"bar"3"')).toEqual(items(
        {
          $: 'tagged-string',
          t: 'foo',
          v: '1',
          x: extras(
              { $: 'quoted-string', v: '2' },
              { $: 'raw', v: 'bar' },
              { $: 'quoted-string', v: '3' },
          ),
        },
    ));
  });
  it('recognizes etag string', () => {
    expect(hthvParse('/W"etag"')).toEqual(items({ $: 'tagged-string', t: '/W', v: 'etag' }));
  });
  it('recognizes incomplete quoted string', () => {
    expect(hthvParse('"foo')).toEqual(items({ $: 'quoted-string', v: 'foo' }));
  });
  it('recognizes empty quoted string', () => {
    expect(hthvParse('""')).toEqual(items({ $: 'quoted-string', v: '' }));
  });
  it('unescapes quoted string', () => {
    expect(hthvParse('"\\\\so me\\\t"')).toEqual(items({ $: 'quoted-string', v: '\\so me\t' }));
  });
  it('does not unescape incomplete escape sequence inside quoted string', () => {
    expect(hthvParse('"incomp\\')).toEqual(items({ $: 'quoted-string', v: 'incomp\\' }));
  });
  it('recognizes angle-bracketed-string', () => {
    expect(hthvParse('<string content>')).toEqual(items(
        { $: 'angle-bracketed-string', v: 'string content' },
    ));
  });
  it('recognizes empty angle-bracketed-string', () => {
    expect(hthvParse('<>')).toEqual(items(
        { $: 'angle-bracketed-string', v: '' },
    ));
  });
  it('recognizes incomplete angle-bracketed-string', () => {
    expect(hthvParse('<incom...')).toEqual(items(
        { $: 'angle-bracketed-string', v: 'incom...' },
    ));
  });
  it('allows opening angle bracket inside angle-bracketed-string', () => {
    expect(hthvParse('<<>')).toEqual(items(
        { $: 'angle-bracketed-string', v: '<' },
    ));
  });
  it('allows backslash inside angle-bracketed-string', () => {
    expect(hthvParse('< \\ >')).toEqual(items(
        { $: 'angle-bracketed-string', v: ' \\ ' },
    ));
  });
  it('allows angle bracket after token', () => {
    expect(hthvParse('a<b')).toEqual(items(
        { $: 'raw', v: 'a<b' },
    ));
  });
  it('allows angle bracket after as part of value', () => {
    expect(hthvParse('a*b<c')).toEqual(items(
        { $: 'raw', v: 'a*b<c' },
    ));
  });
  it('recognizes name/value parameter', () => {

    const param = paramItem({ $: 'raw', n: 'foo', v: 'bar' });
    const parsed = hthvParse('some;foo=bar');

    expect(parsed).toEqual(items(
        {
          $: 'raw',
          v: 'some',
          p: { foo: param },
          pl: [param],
        },
    ));
    expect(parsed[0].p).toEqual({ foo: param });
  });
  it('recognizes raw parameter', () => {

    const param = paramItem({ $: 'raw', v: 'foo' });
    const parsed = hthvParse('some;foo');

    expect(parsed).toEqual(items(
        {
          $: 'raw',
          v: 'some',
          p: { foo: param },
          pl: [param],
        },
    ));
    expect(parsed[0].p).toEqual({ foo: param });
  });
  it('recognizes angle-bracketed-string in name/value', () => {

    const parsed = hthvParse('foo=<bar>');

    expect(parsed).toEqual(items({ $: 'angle-bracketed-string', n: 'foo', v: 'bar' }));
    expect(parsed[0].p).toEqual({
      foo: { $: 'angle-bracketed-string', n: 'foo', v: 'bar', x: [], p: {}, pl: [] },
    });
  });
  it('allows angle brackets as part of value in name/value', () => {

    const parsed = hthvParse('if=a<b');

    expect(parsed).toEqual(items({ $: 'raw', n: 'if', v: 'a<b' }));
    expect(parsed[0].p).toEqual({
      if: { $: 'raw', n: 'if', v: 'a<b', x: [], p: {}, pl: [] },
    });
  });
  it('recognizes parameter of name/value pair', () => {

    const param = paramItem({ $: 'raw', n: 'param', v: 'val' });
    const parsed = hthvParse('foo=bar;param=val');

    expect(parsed).toEqual(items(
        {
          $: 'raw',
          n: 'foo',
          v: 'bar',
          p: { param },
          pl: [param],
        },
    ));
    expect(parsed[0].p).toEqual({
      foo: { $: 'raw', n: 'foo', v: 'bar', x: [], p: {}, pl: [] },
      param,
    });
  });
  it('recognizes headless parameter', () => {

    const param = paramItem({ $: 'raw', n: 'foo', v: 'bar' });
    const parsed = hthvParse(';foo=bar');

    expect(parsed).toEqual(items({ $: 'raw', v: '', p: { foo: param }, pl: [param] }));
    expect(parsed[0].p).toEqual({ foo: param });
  });
  it('recognizes quoted parameter', () => {

    const param = paramItem({ $: 'quoted-string', v: 'param' });
    const parsed = hthvParse('value;"param"');

    expect(parsed).toEqual(items({ $: 'raw', v: 'value', p: { param }, pl: [param] }));
    expect(parsed[0].p).toEqual({ param });
  });
  it('recognizes tagged parameter', () => {

    const param = paramItem({ $: 'raw', v: 'tag', x: extras({ $: 'quoted-string', v: 'param' }) });
    const parsed = hthvParse('value;tag"param"');

    expect(parsed).toEqual(items({ $: 'raw', v: 'value', p: { tag: param }, pl: [param] }));
    expect(parsed[0].p).toEqual({ tag: param });
  });
  it('recognizes etag parameter', () => {

    const param = paramItem({ $: 'raw', v: 'W/', x: extras({ $: 'quoted-string', v: 'etag' }) });
    const parsed = hthvParse('value;W/"etag"');

    expect(parsed).toEqual(items({ $: 'raw', v: 'value', p: { 'W/': param }, pl: [param] }));
    expect(parsed[0].p).toEqual({ 'W/': param });
  });
  it('recognizes quoted parameter value', () => {

    const param = paramItem({ $: 'quoted-string', n: 'param', v: 'val' });
    const parsed = hthvParse('value;param="val"');

    expect(parsed).toEqual(items({ $: 'raw', v: 'value', p: { param }, pl: [param] }));
    expect(parsed[0].p).toEqual({ param });
  });
  it('recognizes tagged parameter value', () => {

    const param = paramItem({
      $: 'raw',
      n: 'param',
      v: 'prefix',
      x: extras(
          { $: 'quoted-string', v: 'val' },
      ),
    });
    const parsed = hthvParse('value;param=prefix"val"');

    expect(parsed).toEqual(items({ $: 'raw', v: 'value', p: { param }, pl: [param] }));
    expect(parsed[0].p).toEqual({ param });
  });
  it('recognizes quoted parameter value with suffix', () => {

    const param = paramItem({
      $: 'quoted-string',
      n: 'param',
      v: 'val',
      x: extras(
          { $: 'raw', v: 'suffix' },
      ),
    });
    const parsed = hthvParse('value;param="val"suffix');

    expect(parsed).toEqual(items({ $: 'raw', v: 'value', p: { param }, pl: [param] }));
    expect(parsed[0].p).toEqual({ param });
  });
  it('recognizes quoted parameter value with prefix and suffix', () => {

    const param = paramItem({
      $: 'raw',
      n: 'param',
      v: 'prefix',
      x: extras(
          { $: 'quoted-string', v: 'val' },
          { $: 'raw', v: 'suffix' },
      ),
    });

    expect(hthvParse('value;param=prefix"val"suffix')).toEqual(items(
        { $: 'raw', v: 'value', p: { param }, pl: [param] },
    ));
  });
  it('recognizes multi-quote parameter value', () => {

    const param = paramItem({
      $: 'quoted-string',
      n: 'param',
      v: '1',
      x: extras(
          { $: 'quoted-string', v: '2' },
          { $: 'raw', v: 'bar' },
          { $: 'quoted-string', v: '3' },
      ),
    });

    expect(hthvParse('value;param="1""2"bar"3"')).toEqual(items(
        { $: 'raw', v: 'value', p: { param }, pl: [param] },
    ));
  });
  it('recognizes quoted parameter with suffix', () => {

    const param = paramItem({
      $: 'quoted-string',
      v: 'val',
      x: extras(
          { $: 'raw', v: 'suffix' },
      ),
    });

    expect(hthvParse('value;"val"suffix')).toEqual(items(
        { $: 'raw', v: 'value', p: { val: param }, pl: [param] },
    ));
  });
  it('recognizes tagged parameter with suffix', () => {

    const param = paramItem({
      $: 'raw',
      v: 'prefix',
      x: extras(
          { $: 'quoted-string', v: 'val' },
          { $: 'raw', v: 'suffix' },
      ),
    });

    expect(hthvParse('value;prefix"val"suffix')).toEqual(items(
        { $: 'raw', v: 'value', p: { prefix: param }, pl: [param] },
    ));
  });
  it('recognizes multi-quote parameter', () => {

    const param = paramItem({
      $: 'raw',
      v: 'foo',
      x: extras(
          { $: 'quoted-string', v: '1' },
          { $: 'quoted-string', v: '2' },
          { $: 'raw', v: 'bar' },
          { $: 'quoted-string', v: '3' },
      ),
    });

    expect(hthvParse('value;foo"1""2"bar"3"')).toEqual(items(
        { $: 'raw', v: 'value', p: { foo: param }, pl: [param] },
    ));
  });
  it('does not recognize date/time parameter value', () => {

    const timestamp = new Date().toUTCString();
    const param = paramItem({
      $: 'date-time',
      n: 'Expires',
      v: timestamp,
    });

    expect(hthvParse(`id=fg12dhd; Expires=${timestamp}`)).not.toEqual(items(
        { $: 'raw', n: 'id', v: 'fg12dhd', p: { Expires: param }, pl: [param] },
    ));
  });
  it('recognizes multiple parameters', () => {

    const p1 = paramItem({
      $: 'raw',
      v: 'foo',
    });
    const p2 = paramItem({
      $: 'raw',
      v: 'tag',
      x: extras(
          { $: 'quoted-string', v: 'param' },
      ),
    });
    const p3 = paramItem({
      $: 'raw',
      n: 'bar',
      v: 'baz',
    });

    expect(hthvParse('some;foo;tag"param";bar=baz')).toEqual(items(
        { $: 'raw', v: 'some', p: { foo: p1, tag: p2, bar: p3 }, pl: [p1, p2, p3] },
    ));
  });
  it('recognizes parameters with spaces after semicolons', () => {

    const p1 = paramItem({
      $: 'raw',
      v: 'foo',
    });
    const p2 = paramItem({
      $: 'raw',
      v: 'tag',
      x: extras(
          { $: 'quoted-string', v: 'param' },
      ),
    });
    const p3 = paramItem({
      $: 'raw',
      n: 'bar',
      v: 'baz',
    });

    expect(hthvParse('some; foo;\t tag"param";\t\tbar=baz')).toEqual(items(
        { $: 'raw', v: 'some', p: { foo: p1, tag: p2, bar: p3 }, pl: [p1, p2, p3] },
    ));
  });
  it('prefers first parameter value', () => {

    const param1 = paramItem({
      $: 'raw',
      n: 'param',
      v: '1',
    });
    const param2 = paramItem({
      $: 'raw',
      n: 'param',
      v: '2',
    });

    expect(hthvParse('some;param=1;param=2')).toEqual(items(
        { $: 'raw', v: 'some', p: { param: param1 }, pl: [param1, param2] },
    ));
  });
  it('prefers named parameter over unnamed one', () => {

    const param1 = paramItem({
      $: 'raw',
      v: 'param',
    });
    const param2 = paramItem({
      $: 'raw',
      n: 'param',
      v: '2',
    });

    expect(hthvParse('some;param;param=2')).toEqual(items(
        { $: 'raw', v: 'some', p: { param: param2 }, pl: [param1, param2] },
    ));
  });
  it('recognizes comma-separated values', () => {
    expect(hthvParse('foo, bar')).toEqual(items(
        { $: 'raw', v: 'foo' },
        { $: 'raw', v: 'bar' },
    ));
  });
  it('recognizes space-separated values', () => {
    expect(hthvParse('foo\t bar')).toEqual(items(
        { $: 'raw', v: 'foo' },
        { $: 'raw', v: 'bar' },
    ));
  });
  it('recognizes parameterized values', () => {

    const p1 = paramItem({ $: 'raw', n: 'p1', v: 'v1' });
    const p2 = paramItem({ $: 'raw', v: 'p2' });
    const p3 = paramItem({ $: 'raw', v: 'p3' });

    expect(hthvParse('foo; p1=v1, bar; p2 baz; p3')).toEqual(items(
        { $: 'raw', v: 'foo', p: { p1 }, pl: [p1] },
        { $: 'raw', v: 'bar', p: { p2 }, pl: [p2] },
        { $: 'raw', v: 'baz', p: { p3 }, pl: [p3] },
    ));
  });
  it('treats comments as values', () => {
    expect(hthvParse('(comment1), (comment2)')).toEqual(items(
        { $: 'raw', v: '(comment1)' },
        { $: 'raw', v: '(comment2)' },
    ));
  });
});

describe('hthvParseDT', () => {
  it('recognizes date/time', () => {

    const timestamp = new Date().toUTCString();

    expect(hthvParseDT(timestamp)).toEqual(items({ $: 'date-time', v: timestamp }));
  });
  it('recognizes date/time parameter value', () => {

    const timestamp = new Date().toUTCString();
    const param = paramItem({
      $: 'date-time',
      n: 'Expires',
      v: timestamp,
    });

    expect(hthvParseDT(`id=fg12dhd; Expires=${timestamp}`)).toEqual(items(
        { $: 'raw', n: 'id', v: 'fg12dhd', p: { Expires: param }, pl: [param] },
    ));
  });
});
