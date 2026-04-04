import { normalizePhone } from "../src/helpers/normalizePhoneNumber";

describe("normalizePhone", () => {
  it("should convert BD local number to +880 format", () => {
    const result = normalizePhone("01710192751");

    expect(result).toBe("+8801710192751");
  });

  it("should keep international number unchanged", () => {
    const result = normalizePhone("+123456789");

    expect(result).toBe("+123456789");
  });
});
