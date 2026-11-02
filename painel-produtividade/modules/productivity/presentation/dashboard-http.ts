import "server-only";
import { ProductivityAccessError, ProductivityInputError, readProductivityDashboard, type ProductivityDependencies } from "../application/read-productivity-dashboard";
import { filterInputFromQuery } from "../domain/filter-query";
import { buildDashboardSummary } from "../application/dashboard-summary-contract";
import { buildDashboardMonthly } from "../application/dashboard-monthly-contract";
import { buildDashboardSupervisors } from "../application/dashboard-supervisors-contract";

export type DashboardEndpoint = "summary" | "monthly" | "supervisors" | "filters";
const endpoints: readonly string[] = ["summary", "monthly", "supervisors", "filters"];
const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", Vary: "Cookie" };

export function dashboardError(code: string, message: string, status: number) {
  return Response.json({ error: { code, message } }, { status, headers });
}

export async function handleDashboardRequest(request: Request, kind: string, dependencies: ProductivityDependencies, demo = false) {
  if (!endpoints.includes(kind)) return dashboardError("NOT_FOUND", "Rota não disponível.", 404);
  try {
    const data = await readProductivityDashboard(dependencies, filterInputFromQuery(new URL(request.url).searchParams));
    let body: Record<string, unknown>;
    switch (kind as DashboardEndpoint) {
      case "summary": {
        body = buildDashboardSummary(data.summary);
        break;
      }
      case "monthly":
        body = buildDashboardMonthly(data.monthly);
        break;
      case "supervisors": {
        body = buildDashboardSupervisors(data.supervisors);
        break;
      }
      case "filters":
        body = { ...data.options, selected: data.filters, discardedSupervisorIds: data.discardedSupervisorIds };
        break;
    }
    return Response.json(demo ? { ...body, demo: true } : body, { headers: { ...headers, ...(demo ? { "X-Servlog-Demo": "synthetic" } : {}) } });
  } catch (error) {
    if (error instanceof ProductivityAccessError || error instanceof ProductivityInputError) return dashboardError(error.code, error.message, error.status);
    return dashboardError("INTERNAL_ERROR", "Não foi possível consultar os indicadores.", 500);
  }
}
