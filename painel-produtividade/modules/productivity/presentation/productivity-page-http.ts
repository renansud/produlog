import "server-only";
import { ProductivityAccessError } from "../application/productivity-access";
import { ProductivityInputError } from "../application/read-productivity-dashboard";
import { readProductivityPage, type ProductivityPageDependencies } from "../application/read-productivity-page";
import { productivityPageInputFromQuery } from "../domain/productivity-page";
import { dashboardError } from "./dashboard-http";

export async function handleProductivityPageRequest(request: Request, dependencies: ProductivityPageDependencies, demo = false) {
  try {
    const body = await readProductivityPage(dependencies, productivityPageInputFromQuery(new URL(request.url).searchParams));
    return Response.json(demo ? { ...body, demo: true } : body, { headers: { "Cache-Control": "private, no-store", Vary: "Cookie", "X-Content-Type-Options": "nosniff", ...(demo ? { "X-Servlog-Demo": "synthetic" } : {}) } });
  } catch (error) {
    if (error instanceof ProductivityAccessError || error instanceof ProductivityInputError) return dashboardError(error.code, error.message, error.status);
    return dashboardError("INTERNAL_ERROR", "Não foi possível consultar o detalhamento.", 500);
  }
}
