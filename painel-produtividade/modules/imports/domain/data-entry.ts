import { z } from "zod";
import { normalizeGoalMet, normalizeIdentityName } from "@/modules/productivity/domain/goal-normalization";

export const MAX_ROWS = 1000;
export const MAX_FILE_BYTES = 1024 * 1024;
export const ENTRY_HEADERS = ["Mês", "Operação", "Supervisor", "Técnico", "Contrato", "Produção", "Meta batida", "Controlador", "Status"];
const text = z.string().trim().min(1, "Informe este campo.").max(200, "Use até 200 caracteres.").refine((value) => !/^[=+@\-]/.test(value), "Fórmulas não são aceitas neste campo.");
const optionalText = text.or(z.literal(""));
const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const fullMonths = ["JANEIRO", "FEVEREIRO", "MARCO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];

function monthValue(value: unknown, year?: string) {
  if (typeof value !== "string") return value;
  const token = value.trim();
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(token)) return token;
  const normalized = normalizeIdentityName(token);
  const index = months.includes(normalized) ? months.indexOf(normalized) : fullMonths.indexOf(normalized);
  return index >= 0 && /^[1-9]\d{3}$/.test(year ?? "") ? `${year}-${String(index + 1).padStart(2, "0")}` : token;
}

/** No Number/parseFloat: keep Decimal(14,2) precision end to end. */
export function normalizeProduction(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  let token = value.trim();
  if (/^-?(?:\d{1,3}(?:\.\d{3})+|\d+),\d{1,2}$/.test(token)) token = token.replaceAll(".", "").replace(",", ".");
  if (!/^-?\d{1,12}(?:\.\d{1,2})?$/.test(token)) return undefined;
  // A lone dot with three following digits is deliberately rejected as ambiguous.
  const [integer, fraction = ""] = token.split(".");
  const cents = BigInt(integer) * BigInt(100) + BigInt(fraction.padEnd(2, "0")) * (integer.startsWith("-") ? BigInt(-1) : BigInt(1));
  return decimalFromCents(cents);
}
function decimalFromCents(cents: bigint) {
  const abs = cents < BigInt(0) ? -cents : cents;
  return `${cents < BigInt(0) ? "-" : ""}${abs / BigInt(100)}.${String(abs % BigInt(100)).padStart(2, "0")}`;
}
function centsFromDecimal(value: string) {
  return BigInt(value.replace(".", ""));
}
export const entrySchema = z.object({
  month: z.string().regex(/^[1-9]\d{3}-(0[1-9]|1[0-2])$/, "Informe mês e ano (AAAA-MM)."),
  operation: text, supervisor: text, technician: text, contract: text,
  production: z.string().transform(normalizeProduction).pipe(z.string({ error: "Informe produção válida com até duas casas decimais." })),
  goalMet: z.string().max(200).transform((value, ctx) => {
    const normalized = normalizeGoalMet(value);
    if (normalized.ok) return normalized.value;
    ctx.addIssue({ code: "custom", message: "Use Sim, Não ou deixe a meta vazia." });
    return z.NEVER;
  }),
  controller: optionalText, status: optionalText,
}).strict();
export type EntryRecord = z.output<typeof entrySchema>;
export type EntryError = { line: number; field: string; message: string };
export type EntryPreview = {
  records: EntryRecord[]; errors: EntryError[]; received: number;
  duplicateRows: number; unknownGoals: number; negativeRows: number; totalProduction: string;
};
const keys = ["month", "operation", "supervisor", "technician", "contract", "production", "goalMet", "controller", "status"] as const;

export function previewRows(rows: unknown[][], year?: string): EntryPreview {
  if (rows.length < 2 || rows.length > MAX_ROWS + 1) throw new Error(`Inclua entre 1 e ${MAX_ROWS} linhas de dados.`);
  if (!rows[0]?.length || rows[0].length > 20) throw new Error("Cabeçalho inválido. Use o modelo disponível.");
  const headers = rows[0].map((value) => typeof value === "string" ? normalizeIdentityName(value) : "");
  const expected = ENTRY_HEADERS.map(normalizeIdentityName);
  if (new Set(headers).size !== headers.length || expected.slice(0, 7).some((name) => !headers.includes(name)) || headers.some((name) => !expected.includes(name))) {
    throw new Error("Colunas ausentes, repetidas ou desconhecidas. Use o modelo disponível.");
  }
  const result: EntryPreview = { records: [], errors: [], received: rows.length - 1, duplicateRows: 0, unknownGoals: 0, negativeRows: 0, totalProduction: "0.00" };
  const seen = new Set<string>();
  let total = BigInt(0);
  for (const [index, row] of rows.slice(1).entries()) {
    if (row.length !== headers.length || row.some((cell) => cell !== null && cell !== undefined && (typeof cell !== "string" || cell.length > 200))) {
      // Excel numbers are read as text by the adapter, except contracts (whose zeros may be lost).
      const contractIndex = headers.indexOf("CONTRATO");
      result.errors.push({ line: index + 2, field: typeof row[contractIndex] === "number" ? "Contrato" : "Linha", message: "Confira o número de colunas e use texto de até 200 caracteres nas células. Contrato deve ser texto, preservando zeros." });
      continue;
    }
    const input: Record<string, unknown> = Object.fromEntries(keys.map((key, position) => [key, row[headers.indexOf(expected[position])] ?? ""]));
    input.month = monthValue(input.month, year);
    const parsed = entrySchema.safeParse(input);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) result.errors.push({ line: index + 2, field: ENTRY_HEADERS[keys.indexOf(issue.path[0] as typeof keys[number])] ?? "Linha", message: issue.message });
      continue;
    }
    const record = parsed.data;
    const identity = JSON.stringify(record);
    if (seen.has(identity)) result.duplicateRows++;
    seen.add(identity);
    result.records.push(record);
    if (record.goalMet === null) result.unknownGoals++;
    const cents = centsFromDecimal(record.production);
    if (cents < BigInt(0)) result.negativeRows++;
    total += cents;
  }
  result.totalProduction = decimalFromCents(total);
  return result;
}

/** Strict bounded RFC-style CSV; no evaluation or silent repair of broken quotes. */
export function parseCsv(input: string): string[][] {
  if (input.length > MAX_FILE_BYTES) throw new Error("Arquivo maior que 1 MiB.");
  const source = input.replace(/^\uFEFF/, "");
  const firstLine = source.split(/\r?\n/, 1)[0];
  const delimiter = firstLine.includes(";") ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [], field = "", quoted = false, closed = false;
  const pushField = () => { row.push(field); field = ""; closed = false; if (row.length > 20) throw new Error("Limite de 20 colunas excedido."); };
  const pushRow = () => { pushField(); rows.push(row); row = []; if (rows.length > MAX_ROWS + 1) throw new Error(`Limite de ${MAX_ROWS} linhas excedido.`); };
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') { field += '"'; i++; } else { quoted = false; closed = true; }
      } else field += char;
    } else if (char === '"') {
      if (field || closed) throw new Error("Aspas inválidas no CSV.");
      quoted = true;
    } else if (char === delimiter) pushField();
    else if (char === "\n" || char === "\r") { if (char === "\r" && source[i + 1] === "\n") i++; pushRow(); }
    else { if (closed) throw new Error("Conteúdo inválido após aspas no CSV."); field += char; }
    if (field.length > 200) throw new Error("Célula maior que 200 caracteres.");
  }
  if (quoted) throw new Error("Aspas não fechadas no CSV.");
  if (field || row.length || closed) pushRow();
  return rows;
}
