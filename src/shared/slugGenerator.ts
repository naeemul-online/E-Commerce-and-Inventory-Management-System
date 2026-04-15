import slugify from "slugify";
import prisma from "./prisma";

type SlugModel = "product" | "category" | "brand";

export const toBaseSlug = (value: string) =>
  slugify(value, { lower: true, strict: true, trim: true });

export const generateUniqueSlug = async (title: string, model: SlugModel) => {
  const baseSlug = toBaseSlug(title);
  const delegate = prisma[model] as any;

  const existingSlugs = await delegate.findMany({
    where: { slug: { startsWith: baseSlug } },
    select: { slug: true },
  });

  const slugSet = new Set(existingSlugs.map((s: { slug: string }) => s.slug));

  if (!slugSet.has(baseSlug)) return baseSlug;

  let count = 1;
  let candidate = `${baseSlug}-${count}`;

  while (slugSet.has(candidate)) {
    count++;
    candidate = `${baseSlug}-${count}`;
  }

  return candidate;
};
