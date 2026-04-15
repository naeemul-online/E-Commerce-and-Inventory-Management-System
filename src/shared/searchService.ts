import prisma from "./prisma";

type SearchableModel = "product" | "category" | "brand";

type SearchOptions<TSelect extends Record<string, boolean>> = {
  model: SearchableModel;
  fields: string[];
  searchTerm: string;
  select: TSelect;
  take?: number;
};

const searchableModels = {
  product: prisma.product,
  category: prisma.category,
  brand: prisma.brand,
} as const;

export const searchService = {
  search: async <TSelect extends Record<string, boolean>>(
    options: SearchOptions<TSelect>,
  ) => {
    const { model, fields, searchTerm, select, take = 10 } = options;

    const term = searchTerm.trim();
    if (!term) return [];

    const delegate = searchableModels[model] as any;
    const orConditions = fields.map((field) => ({
      [field]: {
        contains: term,
        mode: "insensitive" as const,
      },
    }));

    return delegate.findMany({
      where: { OR: orConditions },
      select,
      take,
    });
  },
};
