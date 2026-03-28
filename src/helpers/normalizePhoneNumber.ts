export const normalizePhone = (input: string): string => {
  let cleaned = input.replace(/\s+/g, "");

  // 🇧🇩 Local format → +880
  if (cleaned.startsWith("01") && cleaned.length === 11) {
    return `+880${cleaned.slice(1)}`;
  }

  // 880 format → +880
  if (cleaned.startsWith("880")) {
    return `+${cleaned}`;
  }

  // Already international
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // Fallback (international guess)
  return `+${cleaned}`;
};
