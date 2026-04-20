import { Prisma } from "@prisma/client";

import {
  buildInsensitiveStringSearchOr,
  mergeWhereWithSearchOr,
} from "./prisma-search";
import { buildPagination } from "./pagination";
import {
  parseSearchTermFromQuery,
  toBoolean,
  toNumber,
  toTrimmedString,
} from "./parse-query";
import { resolveSortOption } from "./sort";
import type { QueryInput } from "./types";

type ProductSortOption = "latest" | "oldest" | "price_high_low" | "price_low_high";

const resolveProductSort = (
  sort: unknown,
): Prisma.ProductOrderByWithRelationInput => {
  const option = resolveSortOption<ProductSortOption>(
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

/** Product list: filters + pagination + sort + optional `searchTerm` on title, description, slug. */
export const buildProductQuery = (query: QueryInput) => {
  const pagination = buildPagination(query);
  const minPrice = toNumber(query.minPrice);
  const maxPrice = toNumber(query.maxPrice);
  const isNew = toBoolean(query.isNew);
  const isOffered = toBoolean(query.isOffered);
  const categorySlug = toTrimmedString(query.category);
  const brandSlug = toTrimmedString(query.brand);
  const searchTerm = parseSearchTermFromQuery(query);

  const baseWhere: Prisma.ProductWhereInput = {};

  if (minPrice !== undefined || maxPrice !== undefined) {
    baseWhere.regularPrice = {};

    if (minPrice !== undefined) {
      baseWhere.regularPrice.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      baseWhere.regularPrice.lte = maxPrice;
    }
  }

  if (categorySlug) {
    baseWhere.category = { slug: categorySlug };
  }

  if (brandSlug) {
    baseWhere.brand = { slug: brandSlug };
  }

  if (isNew !== undefined) {
    baseWhere.isNew = isNew;
  }

  if (isOffered !== undefined) {
    baseWhere.isOffered = isOffered;
  }

  const searchOr = buildInsensitiveStringSearchOr(
    ["title", "description", "slug"],
    searchTerm,
  );

  const where = mergeWhereWithSearchOr(
    baseWhere,
    searchOr,
  ) as Prisma.ProductWhereInput;

  return {
    where,
    orderBy: resolveProductSort(query.sort),
    ...pagination,
  };
};
