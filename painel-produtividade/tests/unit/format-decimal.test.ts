import { expect, it } from "vitest";
import { formatDecimalPtBr } from "@/modules/productivity/presentation/format-decimal";

it.each([
  ["1500.00", "1.500,00"], ["100.00", "100,00"], ["-5.36", "-5,36"],
  ["999999999999999999.99", "999.999.999.999.999.999,99"], ["0.00", "0,00"], [null, "—"],
])("formata %s sem conversão monetária para float", (input, expected) => {
  expect(formatDecimalPtBr(input)).toBe(expected);
});
