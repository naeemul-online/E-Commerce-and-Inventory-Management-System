/**
 * Prisma helpers for case-insensitive `contains` search across top-level string fields.
 * For nested fields (e.g. `user: { email: ... }`), build that shape in your feature’s `baseWhere` instead.
 */

export type InsensitiveContainsOrClause = {
  OR: Array<Record<string, { contains: string; mode: "insensitive" }>>;
};

export function buildInsensitiveStringSearchOr(
  fields: readonly string[],
  searchTerm: string | undefined,
): InsensitiveContainsOrClause | undefined {
  const term = searchTerm?.trim();
  if (!term) return undefined;
  return {
    OR: fields.map((field) => ({
      [field]: { contains: term, mode: "insensitive" as const },
    })),
  };
}

/**
 * Merges static filters with optional text search.
 * Empty `baseWhere` + search → search-only clause (valid Prisma where).
 */
export function mergeWhereWithSearchOr<T extends Record<string, unknown>>(
  baseWhere: T,
  searchOr: InsensitiveContainsOrClause | undefined,
): T | { AND: [T, InsensitiveContainsOrClause] } | InsensitiveContainsOrClause {
  if (!searchOr) return baseWhere;
  if (Object.keys(baseWhere).length === 0) return searchOr;
  return { AND: [baseWhere, searchOr] };
}
