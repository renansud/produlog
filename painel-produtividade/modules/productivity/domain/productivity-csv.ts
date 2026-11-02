import { productionDecimal } from "./productivity-page";
import { formatReferenceMonth } from "./reference-month";

type CsvRow = { month: string; supervisor: string; technician: string; contract: string; production: string; goalMet: boolean | null };
const controls = "\\s\\u0000-\\u001f\\u007f-\\u009f\\u200b-\\u200f\\u202a-\\u202e\\u2060-\\u206f\\ufeff";
const formula = new RegExp(`^[${controls}]*[=+\\-@＝＋－＠]`, "u");
const leadingControl = new RegExp(`^[${controls}]*[\\u0000-\\u001f\\u007f-\\u009f]`, "u");

export function protectCsvText(value: string): string {
  return formula.test(value) || leadingControl.test(value) ? `'${value}` : value;
}
const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
export const csvHeader = `\uFEFF${["Mês", "Supervisor", "Técnico", "Contrato", "Produção", "Meta Batida"].map(quote).join(";")}\r\n`;

export function encodeProductivityCsvRow(row: CsvRow): string {
  const text = [formatReferenceMonth(row.month), row.supervisor, row.technician, row.contract].map((value) => quote(protectCsvText(value)));
  // Somente produção já validada é numérica. Não aplicar prefixo de texto a negativos.
  const production = quote(productionDecimal(row.production).replace(".", ","));
  const goal = quote(row.goalMet === null ? "—" : row.goalMet ? "Sim" : "Não");
  return `${[...text, production, goal].join(";")}\r\n`;
}
