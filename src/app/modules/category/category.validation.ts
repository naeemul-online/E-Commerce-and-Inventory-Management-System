import { z } from "zod";

export const CategoryValidation = {
  /* Create Category */
  create: z.object({
    body: z.object({
      name: z
        .string("Name is required")
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters"),
    }),
  }),

  /* Get Single Category */
  getSingle: z.object({
    params: z.object({
      id: z.string("Category ID is required"),
    }),
  }),

  /* Update Category */
  update: z.object({
    params: z.object({
      id: z.string("Category ID is required"),
    }),
    body: z.object({
      name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters")
        .optional(),
    }),
  }),

  /* Delete Category */
  delete: z.object({
    params: z.object({
      id: z.string("Category ID is required"),
    }),
  }),
};
