/**
 * Shared list/query helpers for HTTP query strings → Prisma (or other stores).
 *
 * - **parse-query** — coerce query params (`toNumber`, `toBoolean`, `searchTerm`)
 * - **pagination** — `page` / `limit` → skip/take (reuse for users, orders, etc.)
 * - **sort** — allow-list sort keys
 * - **prisma-search** — `contains` + `insensitive` OR across string fields
 * - **product-query** — product-specific `buildProductQuery`
 *
 * Add new feature files (e.g. `user-query.ts`) that compose the same primitives.
 */

export type { AllowedLimit, PaginationMeta, QueryInput } from "./types";

export {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  MIN_PAGE_LIMIT,
  buildPagination,
  getAllowedLimit,
} from "./pagination";

export {
  parseSearchTermFromQuery,
  toBoolean,
  toNumber,
  toTrimmedString,
} from "./parse-query";

export { resolveSortOption } from "./sort";

export type { InsensitiveContainsOrClause } from "./prisma-search";
export { buildInsensitiveStringSearchOr, mergeWhereWithSearchOr } from "./prisma-search";

export { buildProductQuery } from "./product-query";
