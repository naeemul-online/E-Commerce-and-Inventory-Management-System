import type { Request } from "express";

/** Express query object — use this type in list/builder helpers for consistency. */
export type QueryInput = Request["query"];

export type AllowedLimit = number;

export type PaginationMeta = {
  page: number;
  limit: AllowedLimit;
  skip: number;
  take: number;
};
