import { hthvFlatten } from './hthv-flatten';
import { hthvItem } from './hthv-partial.impl';
import { paramItem } from './spec/items';

describe('hthvFlatten', () => {
  it('adds items in order', () => {

    const item1 = hthvItem({ $: 'raw', v: 'item1' });
    const item2 = hthvItem({ $: 'raw', v: 'item2' });

    expect(hthvFlatten([item1, item2])).toEqual({
      map: { item1, item2 },
      list: [item1, item2],
    });
  });
  it('flattens items', () => {

    const p11 = paramItem({ $: 'raw', v: 'p11' });
    const item1 = hthvItem({ $: 'raw', v: 'item1', pl: [p11] });
    const p21 = paramItem({ $: 'raw', v: 'p21' });
    const item2 = hthvItem({ $: 'raw', v: 'item2', pl: [p21] });

    expect(hthvFlatten([item1, item2])).toEqual({
      map: { item1, p11, item2, p21 },
      list: [item1, p11, item2, p21],
    });
  });
  it('prefers named items added first', () => {

    const p11 = paramItem({ $: 'raw', n: 'item2', v: 'p11' });
    const item1 = hthvItem({ $: 'raw', v: 'item1', pl: [p11] });
    const p21 = paramItem({ $: 'raw', v: 'p21' });
    const item2 = hthvItem({ $: 'raw', v: 'item2', pl: [p21] });

    expect(hthvFlatten([item1, item2])).toEqual({
      map: { item1, item2: p11, p21 },
      list: [item1, p11, item2, p21],
    });
  });
  it('prefers named items added later', () => {

    const p11 = paramItem({ $: 'raw', v: 'p11' });
    const item1 = hthvItem({ $: 'raw', v: 'item1', pl: [p11] });
    const p21 = paramItem({ $: 'raw', n: 'item1', v: 'p21' });
    const item2 = hthvItem({ $: 'raw', v: 'item2', pl: [p21] });

    expect(hthvFlatten([item1, item2])).toEqual({
      map: { item1: p21, p11, item2 },
      list: [item1, p11, item2, p21],
    });
  });
  it('prefers higher level items', () => {

    const p11 = paramItem({ $: 'raw', n: 'item1', v: 'p11' });
    const item1 = hthvItem({ $: 'raw', v: 'item1', pl: [p11] });
    const p21 = paramItem({ $: 'raw', n: 'item1', v: 'p21' });
    const item2 = hthvItem({ $: 'raw', n: 'item1', v: 'item2', pl: [p21] });

    expect(hthvFlatten([item1, item2])).toEqual({
      map: { item1: item2 },
      list: [item1, p11, item2, p21],
    });
  });
  it('prefers higher level nameless items added first', () => {

    const p11 = paramItem({ $: 'raw', v: 'p11' });
    const item1 = hthvItem({ $: 'raw', v: 'item1', pl: [p11] });
    const p21 = paramItem({ $: 'quoted-string', v: 'item1' });
    const item2 = hthvItem({ $: 'raw', v: 'item2', pl: [p21] });

    expect(hthvFlatten([item1, item2])).toEqual({
      map: { item1, p11, item2 },
      list: [item1, p11, item2, p21],
    });
  });
  it('prefers higher level nameless items added later', () => {

    const p11 = paramItem({ $: 'raw', v: 'p11' });
    const item1 = hthvItem({ $: 'raw', v: 'item1', pl: [p11] });
    const p21 = paramItem({ $: 'raw', v: 'p21' });
    const item2 = hthvItem({ $: 'raw', v: 'p11', pl: [p21] });

    expect(hthvFlatten([item1, item2])).toEqual({
      map: { item1, p11: item2, p21 },
      list: [item1, p11, item2, p21],
    });
  });
});
