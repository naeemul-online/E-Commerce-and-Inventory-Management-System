import { z } from "zod";

/**
 * 🇧🇩 Bangladeshi Phone Regex
 */
const bdPhoneRegex = /^(?:\+8801|8801|01)[3-9]\d{8}$/;

/**
 * 🌍 International Phone Regex (E.164 Standard)
 */
const internationalPhoneRegex = /^\+?[1-9]\d{7,14}$/;

/**
 * 📞 Phone Validation Function (Priority Based)
 */
const phoneSchema = z
  .string("Phone number is required")
  .refine((val) => {
    const cleaned = val.replace(/\s+/g, "");

    // Priority 1: Bangladeshi number
    if (bdPhoneRegex.test(cleaned)) return true;

    // Priority 2: International number
    if (internationalPhoneRegex.test(cleaned)) return true;

    return false;
  }, "Invalid phone number format")
  .transform((val) => {
    let cleaned = val.replace(/\s+/g, "");

    // 🇧🇩 Convert to WhatsApp format: +880...
    if (cleaned.startsWith("01") && cleaned.length === 11) {
      return `+880${cleaned.slice(1)}`;
    }

    if (cleaned.startsWith("880")) {
      return `+${cleaned}`;
    }

    // 🌍 Ensure international format starts with +
    return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
  });

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

      phone: phoneSchema,

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
        phone: phoneSchema.optional(),
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
