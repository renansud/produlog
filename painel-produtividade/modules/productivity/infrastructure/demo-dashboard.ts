import "server-only";
import type { ProductivityDependencies } from "../application/read-productivity-dashboard";
import { handleDashboardRequest } from "../presentation/dashboard-http";
import { demoRequestError } from "./demo-request";

const operationA = "10000000-0000-4000-8000-000000000001";
const operationB = "10000000-0000-4000-8000-000000000002";

export function createDemoDependencies(): ProductivityDependencies {
  if (process.env.NODE_ENV !== "development") throw new Error("Demonstração indisponível neste ambiente.");
  // Dataset independente dos testes; somente esta função de desenvolvimento o constrói.
  const rows = [7, 8].flatMap((count, monthIndex) => Array.from({ length: count }, (_, index) => ({
    sourceRowKey: `demo-${monthIndex}-${index}`,
    month: monthIndex === 0 ? "2026-06" : "2026-07",
    technician: `TEC-${String(index + 1).padStart(2, "0")}`,
    supervisor: index < 4 ? "Equipe Exemplo A" : "Equipe Exemplo B",
    supervisorId: index < 4 ? "20000000-0000-4000-8000-000000000001" : "20000000-0000-4000-8000-000000000002",
    operation: index < 4 ? "Operação Exemplo A" : "Operação Exemplo B",
    operationId: index < 4 ? operationA : operationB,
    production: "100.00",
    contract: `000${String(index + 1).padStart(2, "0")}`,
    goalMet: [0, 1, 4].includes(index),
  })));
  return {
    access: { getCurrentAccess: async () => ({ userId: "30000000-0000-4000-8000-000000000001", role: "USER", active: true, operationIds: [operationA, operationB] }) },
    repository: { findByOperations: async (ids) => rows.filter((row) => ids.includes(row.operationId)) },
  };
}

export async function handleDemoDashboard(request: Request, kind: string) {
  const denied = demoRequestError(request);
  if (denied) return denied;
  return handleDashboardRequest(request, kind, createDemoDependencies(), true);
}
