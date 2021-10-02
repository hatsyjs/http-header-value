/**
 * @internal
 */
export function hthvParseTrivial(value: string | Iterable<string>): string[] {
  if (typeof value === 'string') {
    return value.split(',').map(item => item.trim());
  }

  const result: string[] = [];

  for (const val of value) {
    result.push(...hthvParseTrivial(val));
  }

  return result;
}

/**
 * @internal
 */
export function hthvParseFirstTrivial(value: string | Iterable<string> | undefined): string | undefined {
  if (!value) {
    return value;
  }
  if (typeof value === 'string') {

    const commaIdx = value.indexOf(',');

    return (commaIdx >= 0 ? value.substr(0, commaIdx) : value).trim();
  }

  return hthvParseFirstTrivial(value[Symbol.iterator]().next().value);
}
