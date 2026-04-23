/**
 * Validates `sort` against an allow-list; safe default when missing or unknown.
 * Use for any resource: `resolveSortOption(req.query.sort, ['name_asc', 'name_desc'], 'name_asc')`.
 */
export const resolveSortOption = <T extends string>(
  sort: unknown,
  allowedOptions: readonly T[],
  defaultOption: T,
): T => {
  if (typeof sort !== "string") return defaultOption;
  return allowedOptions.includes(sort as T) ? (sort as T) : defaultOption;
};
