import { describe, expect, it } from '@jest/globals';
import { items } from '../spec/items.js';
import { hthvParseSemiSep } from './hthv-parse-semi-sep.js';

describe('hthvParseSemiSep', () => {
  it('recognizes semicolon- and colon- separated items', () => {
    expect(
      hthvParseSemiSep('cookie1=value1; cookie2=value2, cookie3=value3; cookie4=value4'),
    ).toEqual(
      items(
        { $: 'raw', n: 'cookie1', v: 'value1' },
        { $: 'raw', n: 'cookie2', v: 'value2' },
        { $: 'raw', n: 'cookie3', v: 'value3' },
        { $: 'raw', n: 'cookie4', v: 'value4' },
      ),
    );
  });
});
