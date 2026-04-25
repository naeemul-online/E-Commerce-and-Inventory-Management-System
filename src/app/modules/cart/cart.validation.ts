import { z } from "zod";

const cuidSchema = z
  .string({ error: "ID is required" })
  .trim()
  .regex(/^c[^\s]{8,}$/, "Invalid ID format");

const quantitySchema = z
  .number({ error: "Quantity is required" })
  .int("Quantity must be an integer")
  .min(1, "Quantity must be at least 1")
  .max(50, "Quantity cannot exceed 50");

const mergeItemsSchema = z
  .array(
    z.object({
      productId: cuidSchema,
      quantity: quantitySchema,
    }),
  )
  .min(1, "At least one cart item is required")
  .max(100, "Too many cart items")
  .superRefine((items, ctx) => {
    const seen = new Set<string>();

    items.forEach((item, index) => {
      if (seen.has(item.productId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [index, "productId"],
          message: "Duplicate productId detected in merge payload",
        });
        return;
      }

      seen.add(item.productId);
    });
  });

export const CartValidation = {
  getCart: z.object({}),

  addItem: z.object({
    body: z.object({
      productId: cuidSchema,
      quantity: quantitySchema,
    }),
  }),

  updateItemQuantity: z.object({
    params: z.object({
      itemId: cuidSchema,
    }),
    body: z.object({
      quantity: quantitySchema,
    }),
  }),

  removeItem: z.object({
    params: z.object({
      itemId: cuidSchema,
    }),
  }),

  clearCart: z.object({}),

  mergeGuestCart: z.object({
    body: z.object({
      items: mergeItemsSchema,
    }),
  }),
};
