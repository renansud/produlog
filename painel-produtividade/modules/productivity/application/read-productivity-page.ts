import "server-only";
import { z } from "zod";
import { requireProductivityAccess, ProductivityAccessError } from "./productivity-access";
import { ProductivityInputError } from "./read-productivity-dashboard";
import { scopedProductivityRowSchema } from "../domain/productivity-filters";
import { compareProductivityPageRows, matchesProductivityPageRow, productionDecimal, productivityPageQuerySchema, type ProductivityPageQuery } from "../domain/productivity-page";

type OperationScope = readonly [string, ...string[]];
export type ProductivityPageDependencies = {
  access: { getCurrentAccess(): Promise<unknown> };
  repository: {
    /** Consultar somente supervisores solicitados que existam no escopo de operações. */
    findSupervisorIds(operationIds: OperationScope, requestedIds: readonly string[]): Promise<unknown>;
    /** SQL deve aplicar escopo, filtros, busca e ordem antes de LIMIT/OFFSET; total sob o mesmo predicado. */
    findPage(operationIds: OperationScope, query: ProductivityPageQuery): Promise<unknown>;
  };
};

export async function readProductivityPage(dependencies: ProductivityPageDependencies, input: unknown) {
  const access = await requireProductivityAccess(dependencies.access);
  const parsed = productivityPageQuerySchema.safeParse(input);
  if (!parsed.success) throw new ProductivityInputError();
  const query = parsed.data;
  if (query.operations.some((id) => !access.operationIds.includes(id))) throw new ProductivityAccessError("FORBIDDEN");
  const operations = query.operations.length ? query.operations : access.operationIds;
  const [first, ...rest] = operations;
  let discardedSupervisorIds: string[] = [];
  let rows: z.infer<typeof scopedProductivityRowSchema>[] = [];
  let total = 0;
  if (first !== undefined) {
    const scope: OperationScope = [first, ...rest];
    if (query.supervisors.length) {
      const valid = z.array(z.uuid()).parse(await dependencies.repository.findSupervisorIds(scope, query.supervisors));
      if (valid.some((id) => !query.supervisors.includes(id))) throw new ProductivityAccessError("FORBIDDEN");
      discardedSupervisorIds = query.supervisors.filter((id) => !valid.includes(id));
      query.supervisors = query.supervisors.filter((id) => valid.includes(id));
    }
    const result = z.object({ rows: z.array(scopedProductivityRowSchema).max(query.pageSize), total: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER) }).strict().parse(await dependencies.repository.findPage(scope, query));
    rows = result.rows;
    total = result.total;
    if (rows.some((row) => !operations.includes(row.operationId) || !matchesProductivityPageRow(row, query))) throw new ProductivityAccessError("FORBIDDEN");
    if (new Set(rows.map((row) => row.sourceRowKey)).size !== rows.length || rows.length !== Math.min(query.pageSize, Math.max(0, total - (query.page - 1) * query.pageSize))) throw new Error("Página inconsistente.");
    if (rows.some((row, index) => index > 0 && compareProductivityPageRows(rows[index - 1], row, query) > 0)) throw new Error("Ordenação inconsistente.");
  } else {
    discardedSupervisorIds = query.supervisors;
    query.supervisors = [];
  }
  const totalPages = Math.ceil(total / query.pageSize);
  return {
    items: rows.map(({ month, supervisor, technician, contract, production, goalMet }) => ({ month, supervisor, technician, contract, production: productionDecimal(production), goalMet })),
    pagination: { page: query.page, pageSize: query.pageSize, total, totalPages, hasNextPage: query.page < totalPages, hasPreviousPage: query.page > 1 },
    selected: { months: query.months, operations: query.operations, supervisors: query.supervisors, search: query.search, sort: query.sort, direction: query.direction },
    discardedSupervisorIds,
  };
}

export type ProductivityPage = Awaited<ReturnType<typeof readProductivityPage>>;
