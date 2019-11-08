import { HthvDelimiter } from '../hthv-delimiter';
import { ParserConfig } from './parser-config';
import { ParserInput } from './parser-input';

/**
 * @internal
 */
export function angleBracketsParser(
    config: ParserConfig,
): (input: ParserInput, out: (v: string) => void) => boolean {
  return (input, out) => {
     if (!(config.delimiterOf(input.s[input.i]) & HthvDelimiter.AngleBracketStart)) {
       return false;
     }

     let result = '';

     ++input.i;
     while (input.i < input.s.length) {

       const c = input.s[input.i++];

       if (config.delimiterOf(c) & HthvDelimiter.AngleBracketEnd) {
         break;
       }
       result += c;
     }

     out(result);

     return true;
  };
}
