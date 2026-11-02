import "server-only";
import type { ProductivityPageDependencies } from "../application/read-productivity-page";
import { ProductivityAccessError } from "../application/productivity-access";
import { ProductivityInputError } from "../application/read-productivity-dashboard";
import { exportProductivityCsv, ProductivityExportError } from "../application/export-productivity-csv";
import { productivityPageInputFromQuery } from "../domain/productivity-page";
import { dashboardError } from "./dashboard-http";

export async function handleProductivityExportRequest(request: Request, dependencies: ProductivityPageDependencies, demo = false) {
  try {
    const result = await exportProductivityCsv(dependencies, productivityPageInputFromQuery(new URL(request.url).searchParams), request.signal);
    return new Response(result.csv, { headers: {
      "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="servlog-produtividade${demo ? "-demo" : ""}.csv"`,
      "Content-Length": String(result.bytes), "Cache-Control": "private, no-store", Vary: "Cookie", "X-Content-Type-Options": "nosniff",
      ...(demo ? { "X-Servlog-Demo": "synthetic" } : {}),
    } });
  } catch (error) {
    if (error instanceof ProductivityAccessError || error instanceof ProductivityInputError || error instanceof ProductivityExportError) return dashboardError(error.code, error.message, error.status);
    return dashboardError("INTERNAL_ERROR", "Não foi possível exportar o detalhamento.", 500);
  }
}
