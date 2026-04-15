import { z } from "zod";

const cuidSchema = z
  .string({ error: "ID is required" })
  .trim()
  .regex(/^c[^\s]{8,}$/, "Invalid ID format");

const toNumber = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? Number(value) : value;

const toBoolean = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return value;
};

const toStringArray = (value: unknown) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall through and treat as comma-separated list
    }
    return trimmed.split(",").map((item) => item.trim());
  }
  return value;
};

const baseProductBodySchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title cannot exceed 120 characters"),
  description: z
    .string({ error: "Description is required" })
    .trim()
    .min(10, "Description must be at least 10 characters"),
  regularPrice: z.preprocess(
    toNumber,
    z.number({ error: "Regular price is required" }).positive(),
  ),
  discountedPrice: z
    .preprocess(
      toNumber,
      z.number({ error: "Discounted price must be a number" }).positive(),
    )
    .optional(),
  stock: z.preprocess(
    toNumber,
    z.number({ error: "Stock is required" }).int().nonnegative(),
  ),
  isNew: z.preprocess(toBoolean, z.boolean()).optional(),
  isOffered: z.preprocess(toBoolean, z.boolean()).optional(),
  categoryId: cuidSchema,
  brandId: cuidSchema,
  tags: z.preprocess(toStringArray, z.array(z.string().trim().min(1))).optional(),
});

const enforceDiscountRule = (
  data: { regularPrice?: number; discountedPrice?: number },
  ctx: z.RefinementCtx,
) => {
  if (
    data.discountedPrice !== undefined &&
    data.regularPrice !== undefined &&
    data.discountedPrice >= data.regularPrice
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["discountedPrice"],
      message: "Discounted price must be less than regular price",
    });
  }
};

const uploadedImagesSchema = z
  .custom<Express.Multer.File[] | undefined>(
    (files) => files === undefined || Array.isArray(files),
    { message: "Invalid image payload" },
  )
  .superRefine((files, ctx) => {
    if (!files || files.length === 0) return;
    const invalidFile = files.find((file) => !file.mimetype.startsWith("image/"));
    if (invalidFile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only image files are allowed",
      });
    }
  });

const createBodySchema = baseProductBodySchema.superRefine(enforceDiscountRule);
const updateBodySchema = baseProductBodySchema
  .partial()
  .superRefine(enforceDiscountRule);

export const ProductValidation = {
  create: z.object({
    body: createBodySchema,
    files: uploadedImagesSchema.refine((files) => Boolean(files?.length), {
      message: "At least one product image is required",
    }),
  }),

  getSingle: z.object({
    params: z.object({
      id: cuidSchema,
    }),
  }),

  update: z.object({
    params: z.object({
      id: cuidSchema,
    }),
    body: updateBodySchema,
    files: uploadedImagesSchema.optional(),
  }),

  search: z.object({
    query: z.object({
      searchTerm: z
        .string({ error: "searchTerm is required" })
        .trim()
        .min(2, "searchTerm must be at least 2 characters")
        .max(100, "searchTerm cannot exceed 100 characters"),
    }),
  }),

  delete: z.object({
    params: z.object({
      id: cuidSchema,
    }),
  }),
};
