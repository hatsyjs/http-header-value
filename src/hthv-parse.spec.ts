import { HthvItem } from './hthv-item';
import { hthvParse } from './hthv-parse';
import { PartialItem } from './partial-item.impl';

describe('hthvParse', () => {
  it('recognizes date/time', () => {

    const timestamp = new Date().toUTCString();

    expect(hthvParse(timestamp)).toEqual(items({ v: timestamp }));
  });
  it('recognizes plain value', () => {
    expect(hthvParse('foo/bar:baz')).toEqual(items({ v: 'foo/bar:baz'}));
  });
  it('recognizes plain value with special chars', () => {
    expect(hthvParse('foo\u007fbar=baz')).toEqual(items({ v: 'foo\u007fbar=baz'}));
  });
  it('recognizes name/value pair', () => {
    expect(hthvParse('foo=bar')).toEqual(items({ n: 'foo', v: 'bar'}));
  });
  it('recognizes broken name/value pair', () => {
    expect(hthvParse('=bar')).toEqual(items({ v: '=bar'}));
  });
  it('recognizes quoted string', () => {
    expect(hthvParse('"foo"')).toEqual(items({ v: 'foo' }));
  });
  it('recognizes tagged quoted string', () => {
    expect(hthvParse('tag"value"')).toEqual(items({ n: 'tag', v: 'value' }));
  });
  it('recognizes quoted string with suffix', () => {
    expect(hthvParse('"value"suffix')).toEqual(items({ v: '"value"suffix' }));
  });
  it('recognizes quoted string with prefix and suffix', () => {
    expect(hthvParse('prefix"value"suffix')).toEqual(items({ v: 'prefix"value"suffix' }));
  });
  it('recognizes multi-quote string', () => {
    expect(hthvParse('foo"1""2"bar"3"')).toEqual(items({ v: 'foo"1""2"bar"3"' }));
  });
  it('recognizes etag string', () => {
    expect(hthvParse('/W"etag"')).toEqual(items({ n: '/W', v: 'etag' }));
  });
  it('recognizes incomplete quoted string', () => {
    expect(hthvParse('"foo')).toEqual(items({ v: 'foo' }));
  });
  it('recognizes empty quoted string', () => {
    expect(hthvParse('""')).toEqual(items({ v: '' }));
  });
  it('unescapes quoted string', () => {
    expect(hthvParse('"\\\\some\\\t"')).toEqual(items({ v: '\\some\t' }));
  });
  it('does not unescape last backslash of unclosed quoted string', () => {
    expect(hthvParse('"foo\\')).toEqual(items({ v: 'foo\\' }));
  });
  it('recognized parameter', () => {
    expect(hthvParse('some;foo=bar')).toEqual(items({ v: 'some', p: { foo: 'bar' }}));
  });
  it('recognized parameter without value', () => {
    expect(hthvParse('some;foo')).toEqual(items({ v: 'some', p: { foo: true }}));
  });
  it('recognized parameter of name/value pair', () => {
    expect(hthvParse('foo=bar;param=val')).toEqual(items({ n: 'foo', v: 'bar', p: { param: 'val' }}));
  });
  it('recognized headless parameter', () => {
    expect(hthvParse(';foo=bar')).toEqual(items({ v: '', p: { foo: 'bar' }}));
  });
  it('recognized quoted parameter', () => {
    expect(hthvParse('value;"param"')).toEqual(items({ v: 'value', p: { param: true }}));
  });
  it('recognized tagged parameter', () => {
    expect(hthvParse('value;tag"param"')).toEqual(items({ v: 'value', p: { tag: 'param' }}));
  });
  it('recognized etag parameter', () => {
    expect(hthvParse('value;W/"etag"')).toEqual(items({ v: 'value', p: { 'W/': 'etag' }}));
  });
  it('recognized quoted parameter value', () => {
    expect(hthvParse('value;param="val"')).toEqual(items({ v: 'value', p: { param: 'val' }}));
  });
  it('recognized quoted parameter value with prefix', () => {
    expect(hthvParse('value;param=prefix"val"')).toEqual(items({ v: 'value', p: { param: 'prefix"val"' }}));
  });
  it('recognized quoted parameter value with suffix', () => {
    expect(hthvParse('value;param="val"suffix')).toEqual(items({ v: 'value', p: { param: '"val"suffix' }}));
  });
  it('recognized quoted parameter value with prefix and suffix', () => {
    expect(hthvParse('value;param=prefix"val"suffix')).toEqual(items({ v: 'value', p: { param: 'prefix"val"suffix' }}));
  });
  it('recognized multi-quote parameter value', () => {
    expect(hthvParse('value;param="1""2"bar"3"')).toEqual(items({ v: 'value', p: { param: '"1""2"bar"3"' }}));
  });
  it('recognized quoted parameter with suffix', () => {
    expect(hthvParse('value;"val"suffix')).toEqual(items({ v: 'value', p: { '"val"suffix': true }}));
  });
  it('recognized quoted parameter with prefix and suffix', () => {
    expect(hthvParse('value;prefix"val"suffix')).toEqual(items({ v: 'value', p: { 'prefix"val"suffix': true }}));
  });
  it('recognized multi-quote parameter', () => {
    expect(hthvParse('value;foo"1""2"bar"3"')).toEqual(items({ v: 'value', p: { 'foo"1""2"bar"3"': true }}));
  });
  it('recognizes date/time parameter value', () => {

    const timestamp = new Date().toUTCString();

    expect(hthvParse(`id=fg12dhd; Expires=${timestamp}`))
        .toEqual(items({ n: 'id', v: 'fg12dhd', p: { Expires: timestamp} }));
  });
  it('recognized multiple parameters', () => {
    expect(hthvParse('some;foo;tag"param";bar=baz'))
        .toEqual(items({ v: 'some', p: { foo: true, tag: 'param', bar: 'baz' }}));
  });
  it('recognized parameters with spaces after semicolons', () => {
    expect(hthvParse('some; foo;\t tag"param";\t\tbar=baz'))
        .toEqual(items({ v: 'some', p: { foo: true, tag: 'param', bar: 'baz' }}));
  });
  it('recognizes comma-separated values', () => {
    expect(hthvParse('foo, bar')).toEqual(items({ v: 'foo' }, { v: 'bar' }));
  });
  it('recognizes space-separated values', () => {
    expect(hthvParse('foo\t bar')).toEqual(items({ v: 'foo' }, { v: 'bar' }));
  });
  it('recognizes parameterized values', () => {
    expect(hthvParse('foo; p1=v1, bar; p2 baz; p3')).toEqual(items(
        { v: 'foo', p: { p1: 'v1'} },
        { v: 'bar', p: { p2: true } },
        { v: 'baz', p: { p3: true } },
    ));
  });
});

function items(...list: PartialItem[]): HthvItem[] {
  return list.map(item);
}

function item({ n, v, p = {}, c = [], cp = {} }: PartialItem): HthvItem {
  return { n, v, p, c, cp };
}
