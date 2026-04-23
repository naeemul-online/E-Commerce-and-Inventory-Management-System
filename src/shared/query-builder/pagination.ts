import { toNumber } from "./parse-query";
import type { PaginationMeta, QueryInput } from "./types";

export const DEFAULT_PAGE_LIMIT = 5;
export const MIN_PAGE_LIMIT = 1;
export const MAX_PAGE_LIMIT = 100;

export const getAllowedLimit = (value: unknown): number => {
  const parsed = toNumber(value);

  if (!parsed) return DEFAULT_PAGE_LIMIT;

  return Math.min(Math.max(parsed, MIN_PAGE_LIMIT), MAX_PAGE_LIMIT);
};

export const buildPagination = (query: QueryInput): PaginationMeta => {
  const page = Math.max(toNumber(query.page) ?? 1, 1);
  const limit = getAllowedLimit(query.limit);
  const skip = (page - 1) * limit;
  return { page, limit, skip, take: limit };
};
