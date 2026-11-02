import "server-only";
import { dashboardError } from "../presentation/dashboard-http";

export function demoRequestError(request: Request): Response | null {
  if (process.env.NODE_ENV !== "development") return dashboardError("NOT_FOUND", "Rota não disponível.", 404);
  const url = new URL(request.url);
  if (!["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) return dashboardError("FORBIDDEN", "Demonstração disponível somente localmente.", 403);
  const origin = request.headers.get("origin");
  if ((origin !== null && origin !== url.origin) || request.headers.get("sec-fetch-site") === "cross-site") return dashboardError("FORBIDDEN", "Origem não autorizada.", 403);
  return null;
}
