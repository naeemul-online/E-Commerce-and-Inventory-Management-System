import { Request } from "express";
import { Prisma } from "@prisma/client";

type QueryInput = Request["query"];
type SortOption = "latest" | "oldest" | "price_high_low" | "price_low_high";
export type AllowedLimit = 16 | 20 | 24 | 36;

export type PaginationMeta = {
  page: number;
  limit: AllowedLimit;
  skip: number;
  take: number;
};

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

export const getAllowedLimit = (value: unknown): AllowedLimit => {
  const parsed = toNumber(value);
  if (parsed === 20 || parsed === 24 || parsed === 36) return parsed;
  return 16;
};

export const buildPagination = (query: QueryInput): PaginationMeta => {
  const page = Math.max(toNumber(query.page) ?? 1, 1);
  const limit = getAllowedLimit(query.limit);
  const skip = (page - 1) * limit;
  return { page, limit, skip, take: limit };
};

export const resolveSortOption = <T extends string>(
  sort: unknown,
  allowedOptions: readonly T[],
  defaultOption: T,
): T => {
  if (typeof sort !== "string") return defaultOption;
  return allowedOptions.includes(sort as T) ? (sort as T) : defaultOption;
};

const resolveProductSort = (
  sort?: unknown,
): Prisma.ProductOrderByWithRelationInput => {
  const option = resolveSortOption<SortOption>(
    sort,
    ["latest", "oldest", "price_high_low", "price_low_high"] as const,
    "latest",
  );

  switch (option) {
    case "oldest":
      return { createdAt: "asc" };
    case "price_high_low":
      return { regularPrice: "desc" };
    case "price_low_high":
      return { regularPrice: "asc" };
    case "latest":
    default:
      return { createdAt: "desc" };
  }
};

export const buildProductQuery = (query: QueryInput) => {
  const pagination = buildPagination(query);
  const minPrice = toNumber(query.minPrice);
  const maxPrice = toNumber(query.maxPrice);
  const isNew = toBoolean(query.isNew);
  const isOffered = toBoolean(query.isOffered);
  const categorySlug = toTrimmedString(query.category);
  const brandSlug = toTrimmedString(query.brand);

  const where: Prisma.ProductWhereInput = {};

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.regularPrice = {};

    if (minPrice !== undefined) {
      where.regularPrice.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.regularPrice.lte = maxPrice;
    }
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (brandSlug) {
    where.brand = { slug: brandSlug };
  }

  if (isNew !== undefined) {
    where.isNew = isNew;
  }

  if (isOffered !== undefined) {
    where.isOffered = isOffered;
  }

  return {
    where,
    orderBy: resolveProductSort(query.sort),
    ...pagination,
  };
};
