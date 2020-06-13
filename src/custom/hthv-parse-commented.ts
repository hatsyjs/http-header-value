/**
 * @packageDocumentation
 * @module @hatsy/http-header-value
 */
import { HthvParser, newHthvParser } from '../hthv-parser';

/**
 * Parses HTTP header value that may contain comments.
 *
 * This is particularly useful when parsing headers such as:
 * - `User-Agent`
 * - `Server`
 */
export const hthvParseCommented: HthvParser = (/*#__PURE__*/ newHthvParser({ comments: true }));
