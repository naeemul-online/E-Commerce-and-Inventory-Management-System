import slugify from "slugify";
import prisma from "../shared/prisma";
export const generateSlug = async (
  title: string,
  model: "product" | "category" | "brand",
) => {
  const baseSlug = slugify(title, { lower: true, strict: true });

  // Use 'findMany' with 'startsWith' to get all existing variations in one query
  const delegate = prisma[model] as any;
  const existingSlugs = await delegate.findMany({
    where: { slug: { startsWith: baseSlug } },
    select: { slug: true },
  });

  const slugSet = new Set(existingSlugs.map((s: { slug: string }) => s.slug));

  if (!slugSet.has(baseSlug)) return baseSlug;

  let count = 1;
  let newSlug = `${baseSlug}-${count}`;
  while (slugSet.has(newSlug)) {
    count++;
    newSlug = `${baseSlug}-${count}`;
  }

  return newSlug;
};
