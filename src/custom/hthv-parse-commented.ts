import { HthvParser, newHthvParser } from '../hthv-parser';

/**
 *  Parses HTTP header value that may contain comments.
 */
export const hthvParseCommented: HthvParser = /*#__PURE__*/ newHthvParser({ comments: true });
