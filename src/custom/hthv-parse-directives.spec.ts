import { items, paramItem } from '../spec/items';
import { hthvParseDirectives } from './hthv-parse-directives';

describe('hthvParseDirectives', () => {
  it('recognizes colon-separated directives', () => {

    const p11 = paramItem({ $: 'raw', v: 'anderson/1.3.37' });
    const p12 = paramItem({ $: 'quoted-string', v: 'Response is stale' });

    const p21 = paramItem({ $: 'raw', v: '-' });
    const p22 = paramItem({ $: 'quoted-string', v: 'cache down' });
    const p23 = paramItem({ $: 'quoted-string', v: 'Wed, 21 Oct 2015 07:28:00 GMT' });

    expect(hthvParseDirectives(
        '110 anderson/1.3.37 "Response is stale", 112 - "cache down" "Wed, 21 Oct 2015 07:28:00 GMT"'
    )).toEqual(items(
        { $: 'raw', v: '110', p: { [p11.v]: p11, [p12.v]: p12 }, pl: [p11, p12] },
        { $: 'raw', v: '112', p: { [p21.v]: p21, [p22.v]: p22, [p23.v]: p23 }, pl: [p21, p22, p23] },
    ));
  });
  it('recognizes semicolon-separated directives', () => {

    const p11 = paramItem({ $: 'raw', v: `'self'`});
    const p12 = paramItem({ $: 'raw', v: 'http://example.com' });

    const p21 = paramItem({ $: 'raw', v: `'none'`});

    expect(hthvParseDirectives(
        `default-src 'self' http://example.com; connect-src 'none'`
    )).toEqual(items(
        { $: 'raw', v: 'default-src', p: { [p11.v]: p11, [p12.v]: p12 }, pl: [p11, p12] },
        { $: 'raw', v: 'connect-src', p: { [p21.v]: p21 }, pl: [p21] },
    ));
  });
});
