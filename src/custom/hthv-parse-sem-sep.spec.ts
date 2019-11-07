import { items } from '../spec/items';
import { hthvParseSemSep } from './hthv-parse-sem-sep';

describe('hthvParseSemSep', () => {
  it('recognizes semicolon- and colon- separated items', () => {
    expect(hthvParseSemSep('cookie1=value1; cookie2=value2, cookie3=value3; cookie4=value4')).toEqual(items(
      { $: 'raw', n: 'cookie1', v: 'value1' },
      { $: 'raw', n: 'cookie2', v: 'value2' },
      { $: 'raw', n: 'cookie3', v: 'value3' },
      { $: 'raw', n: 'cookie4', v: 'value4' },
    ));
    console.log(hthvParseSemSep('id=a3fWa; SESSIONID=fdkafretercvx')
        .reduce((map, { n, v }) => ({ ...map, [n!]: v }), {}));
  });
});
