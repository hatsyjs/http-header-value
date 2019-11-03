/**
 * @internal
 */
export interface PartialItem {
  n?: string;
  v: string;
  p?: { [name: string]: string | true };
  c?: string[];
  cp?: { [name: string]: string };
}
