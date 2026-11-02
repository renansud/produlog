import { z } from "zod";
import { productivityFiltersSchema, scopedProductivityRowSchema, type ScopedProductivityRow } from "./productivity-filters";
import { filterInputFromQuery, filterQueryString } from "./filter-query";
import { normalizeIdentityName } from "./goal-normalization";
import { productionCents } from "./productivity-metrics";
import { createRatio, toFixedDecimal } from "./exact-ratio";

const positive = (maximum: number) => z.union([z.number(), z.string().regex(/^[1-9]\d*$/).transform(Number)]).pipe(z.number().int().min(1).max(maximum));
export const productivityPageQuerySchema = productivityFiltersSchema.extend({
  page: positive(1_000_000).default(1), pageSize: positive(100).default(50),
  search: z.string().trim().max(120).default(""),
  sort: z.enum(["month", "supervisor", "technician", "contract", "production", "goalMet"]).default("month"),
  direction: z.enum(["asc", "desc"]).default("desc"),
}).strict();
export type ProductivityPageQuery = z.infer<typeof productivityPageQuerySchema>;

const detailParameters = ["page", "pageSize", "search", "sort", "direction"];

/** Retira somente os controles conhecidos da tabela; parâmetros desconhecidos continuam rejeitados. */
export function dashboardInputFromPageQuery(params: URLSearchParams): Record<string, unknown> {
  const filters = new URLSearchParams(params);
  detailParameters.forEach((key) => filters.delete(key));
  return filterInputFromQuery(filters);
}

export function productivityPageQueryString(input: unknown): string {
  const query = productivityPageQuerySchema.parse(input);
  const params = new URLSearchParams(filterQueryString({ months: query.months, operations: query.operations, supervisors: query.supervisors }));
  params.set("pageSize", String(query.pageSize));
  if (query.page > 1) params.set("page", String(query.page));
  if (query.search) params.set("search", query.search);
  if (query.sort !== "month") params.set("sort", query.sort);
  if (query.direction !== "desc") params.set("direction", query.direction);
  return params.toString();
}

export function productionDecimal(value: string): string {
  return toFixedDecimal(createRatio(productionCents(value), BigInt(100))!);
}

/** Conversão somente; a validação ocorre depois da autenticação. */
export function productivityPageInputFromQuery(params: URLSearchParams): Record<string, unknown> {
  const filters = new URLSearchParams();
  const input: Record<string, unknown> = {};
  for (const key of new Set(params.keys())) {
    const values = params.getAll(key);
    if (["months", "operations", "supervisors"].includes(key)) values.forEach((value) => filters.append(key, value));
    else input[key] = values.length === 1 ? values[0] : values;
  }
  return { ...filterInputFromQuery(filters), ...input };
}

export function matchesProductivityPageRow(row: ScopedProductivityRow, query: ProductivityPageQuery): boolean {
  if (query.operations.length && !query.operations.includes(row.operationId)) return false;
  if (query.supervisors.length && !query.supervisors.includes(row.supervisorId)) return false;
  if (query.months.length && !query.months.includes(row.month)) return false;
  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${row.month}-01T00:00:00.000Z`));
  const production = productionDecimal(row.production);
  const text = [row.month, monthLabel, row.supervisor, row.technician, row.contract, production, production.replace(".", ","), row.goalMet === null ? "—" : row.goalMet ? "Sim" : "Não"].join(" ");
  return normalizeIdentityName(text).includes(normalizeIdentityName(query.search));
}

export function compareProductivityPageRows(a: ScopedProductivityRow, b: ScopedProductivityRow, query: ProductivityPageQuery): number {
  let comparison: number;
  if (query.sort === "goalMet" && (a.goalMet === null || b.goalMet === null)) {
    if (a.goalMet !== b.goalMet) return a.goalMet === null ? 1 : -1; // Indeterminados sempre ao final.
    comparison = 0;
  } else if (query.sort === "production") {
    const difference = productionCents(a.production) - productionCents(b.production);
    comparison = difference < BigInt(0) ? -1 : difference > BigInt(0) ? 1 : 0;
  } else if (query.sort === "goalMet") comparison = Number(a.goalMet) - Number(b.goalMet);
  else comparison = a[query.sort].localeCompare(b[query.sort], "pt-BR", { sensitivity: "base" });
  const primary = query.direction === "desc" ? -comparison : comparison;
  return primary || (a.sourceRowKey < b.sourceRowKey ? -1 : a.sourceRowKey > b.sourceRowKey ? 1 : 0);
}

/** Adaptador sintético: produção deverá filtrar/ordenar/contar/paginar no SQL. */
export function paginateSyntheticProductivity(records: readonly unknown[], input: unknown) {
  const query = productivityPageQuerySchema.parse(input);
  const rows = z.array(scopedProductivityRowSchema).parse(records);
  if (new Set(rows.map((row) => row.sourceRowKey)).size !== rows.length) throw new Error("Identificação de linhas inconsistente.");
  const selected = rows.filter((row) => matchesProductivityPageRow(row, query)).sort((a, b) => compareProductivityPageRows(a, b, query));
  const offset = (query.page - 1) * query.pageSize;
  return { rows: selected.slice(offset, offset + query.pageSize), total: selected.length };
}
