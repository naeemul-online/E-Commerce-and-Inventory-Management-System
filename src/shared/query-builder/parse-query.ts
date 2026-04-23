import type { QueryInput } from "./types";

export const toNumber = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const toBoolean = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  return undefined;
};

export const toTrimmedString = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
};

/** Reads `searchTerm` from the query string (lists, admin search, etc.). */
export const parseSearchTermFromQuery = (query: QueryInput) =>
  toTrimmedString(query.searchTerm);
