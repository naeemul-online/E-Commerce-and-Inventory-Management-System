import { z } from "zod";

/**
 * 📞 Phone Regex
 * - Supports BD numbers (priority)
 * - Supports international fallback
 */
const bdPhoneRegex = /^(?:\+8801|8801|01)[3-9]\d{8}$/;
const internationalPhoneRegex = /^\+?[1-9]\d{7,14}$/;

const phoneSchema = z
  .string("Phone number is required")
  .trim()
  .refine((val) => {
    const cleaned = val.replace(/\s+/g, "");

    if (bdPhoneRegex.test(cleaned)) return true;
    if (internationalPhoneRegex.test(cleaned)) return true;

    return false;
  }, "Invalid phone number format");

/**
 * 🔐 Login Validation Schema
 */

export const AuthValidation = {
  login: z.object({
    body: z.object({
      phone: phoneSchema,
      password: z.coerce
        .string("Password is required")
        .min(6, "Password must be at least 6 characters")
        .max(20, "Password cannot exceed 20 characters")
        .optional(), // 🔥 IMPORTANT (for guest users)
    }),
  }),
  setPassword: z.object({
    body: z.object({
      userId: z.string("UserId is required"),
      password: z.coerce
        .string("Password is required")
        .min(6, "Password must be at least 6 characters")
        .max(20, "Password cannot exceed 20 characters")
        .optional(), // 🔥 IMPORTANT (for guest users)
    }),
  }),
};
