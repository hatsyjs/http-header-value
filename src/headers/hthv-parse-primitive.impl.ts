/**
 * @internal
 */
export function hthvParseTrivial(value: string): string[] {
  return value.split(',').map(item => item.trim());
}

/**
 * @internal
 */
export function hthvParseFirstTrivial(value: string | undefined): string | undefined {
  return value && value.split(',', 2)[0].trim();
}
