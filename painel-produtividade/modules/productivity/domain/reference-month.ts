import { z } from "zod";

export function formatReferenceMonth(value: string): string {
  z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).parse(value);
  const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}-01T00:00:00.000Z`));
  return label.charAt(0).toUpperCase() + label.slice(1);
}
