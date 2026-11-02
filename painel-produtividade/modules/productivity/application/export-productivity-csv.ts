import "server-only";
import { ProductivityAccessError } from "./productivity-access";
import { requirePermission } from "@/modules/auth/application/require-permission";
import { ProductivityInputError } from "./read-productivity-dashboard";
import { readProductivityPage, type ProductivityPageDependencies } from "./read-productivity-page";
import { productivityPageQuerySchema } from "../domain/productivity-page";
import { csvHeader, encodeProductivityCsvRow } from "../domain/productivity-csv";

export const MAX_CSV_ROWS = 10_000;
export const MAX_CSV_BYTES = 5 * 1024 * 1024;
export class ProductivityExportError extends Error {
  constructor(readonly code: "EXPORT_LIMIT" | "EXPORT_CHANGED", readonly status: 413 | 409) {
    super(code === "EXPORT_LIMIT" ? "O resultado excede o limite de exportação. Reduza o recorte." : "Os dados foram alterados durante a exportação. Tente novamente.");
    this.name = "ProductivityExportError";
  }
}

export async function exportProductivityCsv(dependencies: ProductivityPageDependencies, input: unknown, signal?: AbortSignal) {
  const initialAccess = await requirePermission(dependencies.access, "productivity:export");
  const parsed = productivityPageQuerySchema.safeParse(input);
  if (!parsed.success) throw new ProductivityInputError();
  const snapshot = JSON.stringify(initialAccess);
  let firstAccess = true;
  const scoped: ProductivityPageDependencies = { ...dependencies, access: { getCurrentAccess: async () => {
    const current = firstAccess ? initialAccess : await requirePermission(dependencies.access, "productivity:export");
    firstAccess = false;
    if (JSON.stringify(current) !== snapshot) throw new ProductivityAccessError("FORBIDDEN");
    return current;
  } } };
  const query = { ...parsed.data, page: 1, pageSize: 100 };
  const chunks = [csvHeader];
  const encoder = new TextEncoder();
  let bytes = encoder.encode(csvHeader).byteLength;
  let rowCount = 0;
  let expectedTotal: number | undefined;
  let selected: string | undefined;
  for (;;) {
    signal?.throwIfAborted();
    const page = await readProductivityPage(scoped, query);
    if (page.pagination.total > MAX_CSV_ROWS) throw new ProductivityExportError("EXPORT_LIMIT", 413);
    if (expectedTotal !== undefined && (expectedTotal !== page.pagination.total || selected !== JSON.stringify(page.selected))) throw new ProductivityExportError("EXPORT_CHANGED", 409);
    expectedTotal = page.pagination.total;
    selected = JSON.stringify(page.selected);
    for (const row of page.items) {
      const line = encodeProductivityCsvRow(row);
      bytes += encoder.encode(line).byteLength;
      if (bytes > MAX_CSV_BYTES || rowCount >= MAX_CSV_ROWS) throw new ProductivityExportError("EXPORT_LIMIT", 413);
      chunks.push(line);
      rowCount++;
    }
    if (!page.pagination.hasNextPage) break;
    query.page++;
  }
  signal?.throwIfAborted();
  if (rowCount !== expectedTotal) throw new ProductivityExportError("EXPORT_CHANGED", 409);
  return { csv: chunks.join(""), bytes, rowCount };
}
