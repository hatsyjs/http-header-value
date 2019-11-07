import { items } from '../spec/items';
import { hthvParseURLs } from './hthv-parse-urls';

describe('hthv-parse-urls', () => {
  it('recognizes URL with comma, semicolon and equality sign', () => {

    const url = 'http://localhost/some/path?param=1;2,3';

    expect(hthvParseURLs(url)).toEqual(items(
        { $: 'raw', v: url },
    ));
  });
  it('recognizes multiple URLs', () => {

    const url1 = 'http://localhost:8080/1';
    const url2 = '//localhost/2';
    const url3 = '/3';

    expect(hthvParseURLs(` ${url1} \t ${url2} ${url3} \t`)).toEqual(items(
        { $: 'raw', v: url1 },
        { $: 'raw', v: url2 },
        { $: 'raw', v: url3 },
    ));
  });
});
