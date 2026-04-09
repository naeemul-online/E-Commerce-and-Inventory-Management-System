import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";

// এটি একটি স্ট্রিং স্কিমা যা ডাটাকে ভ্যালিডেট এবং ট্রান্সফর্ম করবে
export const phoneNumberSchema = z
  .string("Phone number is required")
  .trim()
  .min(10, "Phone number is too short")
  .transform((val, ctx) => {
    const cleaned = val.replace(/[^\d+]/g, "");
    let phone = parsePhoneNumberFromString(cleaned);

    // Fallback for Bangladesh
    if (!phone) {
      phone = parsePhoneNumberFromString(cleaned, "BD");
    }

    if (!phone || !phone.isValid()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid phone number format",
      });
      return z.NEVER;
    }

    return phone.number; // ✅ Always E.164 format
  });

export const AuthValidation = {
  login: z.object({
    body: z.object({
      phone: phoneNumberSchema,
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

  register: z.object({
    body: z.object({
      phone: phoneNumberSchema,
      fullName: z
        .string("Full name is required")
        .trim()
        .min(3, "Full name must be at least 3 characters")
        .max(50, "Full name cannot exceed 50 characters"),
      password: z.coerce
        .string("Password is required")
        .min(6, "Password must be at least 6 characters")
        .max(8, "Password cannot exceed 8 characters"),
    }),
  }),
};
