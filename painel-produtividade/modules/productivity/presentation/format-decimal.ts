import { z } from "zod";

const decimalSchema = z.string().regex(/^-?\d+\.\d{2}$/).nullable();

/** Formata a saída decimal exata sem converter produção para Number. */
export function formatDecimalPtBr(input: string | null): string {
  const value = decimalSchema.parse(input);
  if (value === null) return "—";
  const [integer, fraction] = value.split(".");
  return `${integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${fraction}`;
}

export { formatReferenceMonth } from "../domain/reference-month";
