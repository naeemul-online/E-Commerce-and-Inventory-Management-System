import { z } from "zod";
import { phoneNumberSchema } from "../auth/auth.validation";

export const UserValidation = {
  /**
   * Registration Schema
   * Used when a new user joins the platform.
   */
  register: z.object({
    body: z.object({
      fullName: z
        .string("Full name is required")
        .min(2, "Name must be at least 3 characters")
        .max(30, "Name cannot exceed 50 characters"),

      email: z.string().email("Invalid email address").optional(),

      phone: phoneNumberSchema,

      password: z
        .string("Password is required")
        .min(6, "Password must be at least 6 characters")
        .max(8, "Password cannot exceed 8 characters")
        .optional(),

      profilePhoto: z.string("Invalid photo URL").optional(),
    }),
  }),

  /**
   * Update Schema
   * Uses .partial() or explicit optional fields so users can update
   * only what they need (e.g., just the profile photo).
   */
  update: z.object({
    body: z
      .object({
        fullName: z.string().min(3).max(50).optional(),
        email: z.string().email("Invalid email address").optional(),
        phone: phoneNumberSchema.optional(),
        profilePhoto: z.string("Invalid photo URL").optional(),
        // We usually handle password updates in a separate dedicated route/schema
      })
      .strict(), // .strict() prevents users from sending extra fields like 'role'
  }),

  /**
   * Soft Delete / Status Schema
   * Ensures we track why/when a user is being deactivated.
   */
  softDelete: z.object({
    params: z.object({
      id: z.string("User ID is required"),
    }),
  }),
};
