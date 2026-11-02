import "server-only";
import { z } from "zod";
import { productivityFiltersSchema, scopedProductivityRowSchema, selectProductivityRows } from "../domain/productivity-filters";
import { calculateEvolution, calculateKpis, calculateMonthlyPerformance } from "../domain/productivity-metrics";
import { calculateSupervisorPerformance } from "../domain/supervisor-performance";
import { ProductivityAccessError, requireProductivityAccess } from "./productivity-access";
export { ProductivityAccessError } from "./productivity-access";

export type ProductivityDependencies = {
  /** Implementar com sessão validada e perfil/permissões atuais, nunca payload do browser. */
  access: { getCurrentAccess(): Promise<unknown> };
  repository: {
    /** O adaptador deve aplicar operationId IN (...) no banco; conjunto sempre não vazio. */
    findByOperations(operationIds: readonly [string, ...string[]]): Promise<readonly unknown[]>;
  };
};

export class ProductivityInputError extends Error {
  readonly code = "BAD_REQUEST";
  readonly status = 400;
  constructor() { super("Filtros inválidos."); this.name = "ProductivityInputError"; }
}

/** Exclusivo do servidor: recebe acesso por dependência e não cria sessões. */
export async function readProductivityDashboard(dependencies: ProductivityDependencies, input: unknown) {
  const access = await requireProductivityAccess(dependencies.access);
  const parsedFilters = productivityFiltersSchema.safeParse(input);
  if (!parsedFilters.success) throw new ProductivityInputError();
  const filters = parsedFilters.data;
  const allowed = new Set(access.operationIds);
  if (filters.operations.some((id) => !allowed.has(id))) throw new ProductivityAccessError("FORBIDDEN");

  const [firstOperation, ...otherOperations] = access.operationIds;
  let rows: z.infer<typeof scopedProductivityRowSchema>[] = [];
  // Nunca passar lista vazia ao repositório: adaptadores não podem interpretá-la como acesso global.
  if (firstOperation !== undefined) {
    const rawRows = await dependencies.repository.findByOperations([firstOperation, ...otherOperations]);
    rows = z.array(scopedProductivityRowSchema).parse(rawRows);
    // Defesa adicional; não substitui o predicado obrigatório no banco.
    if (rows.some((row) => !allowed.has(row.operationId))) throw new ProductivityAccessError("FORBIDDEN");
  }

  const selection = selectProductivityRows(rows, filters);
  const kpis = calculateKpis(selection.filteredRows);
  const evolution = calculateEvolution(selection.timelineRows);
  return {
    summary: { ...kpis, evolution: evolution.evolution, evolutionWarnings: evolution.warnings },
    monthly: calculateMonthlyPerformance(selection.timelineRows),
    supervisors: calculateSupervisorPerformance(selection.filteredRows),
    rows: selection.filteredRows,
    filters: selection.filters,
    options: selection.options,
    discardedSupervisorIds: selection.discardedSupervisorIds,
  };
}
