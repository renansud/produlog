import { describe, expect, it, vi } from "vitest";
import { paginateSyntheticProductivity, productivityPageInputFromQuery, productivityPageQuerySchema } from "@/modules/productivity/domain/productivity-page";
import { readProductivityPage, type ProductivityPageDependencies } from "@/modules/productivity/application/read-productivity-page";
import { handleProductivityPageRequest } from "@/modules/productivity/presentation/productivity-page-http";
import { operationA, operationB, scopedBaseline, supervisorB, syntheticUserId } from "../fixtures/scoped-productivity";

function dependencies(allowed = [operationA, operationB]) {
  return {
    access: { getCurrentAccess: vi.fn(async (): Promise<unknown> => ({ userId: syntheticUserId, role: "USER", active: true, operationIds: allowed })) },
    repository: {
      findSupervisorIds: vi.fn(async (ids: readonly string[], requested: readonly string[]): Promise<unknown> => [...new Set(scopedBaseline.filter((row) => ids.includes(row.operationId) && requested.includes(row.supervisorId)).map((row) => row.supervisorId))]),
      findPage: vi.fn(async (ids: readonly string[], query: unknown): Promise<unknown> => paginateSyntheticProductivity(scopedBaseline.filter((row) => ids.includes(row.operationId)), query)),
    },
  };
}
const request = (query = "") => new Request(`http://127.0.0.1:3000/api/v1/productivity?${query}`);
const pageRequest = (deps: ProductivityPageDependencies, query = "") => handleProductivityPageRequest(request(query), deps);

describe("Entrada, pesquisa, ordenação e paginação puras", () => {
  it("padrões e parâmetros repetidos de filtros preservam o contrato", () => {
    const query = productivityPageQuerySchema.parse(productivityPageInputFromQuery(new URLSearchParams("months=2026-06&months=2026-07&search=TEC-01")));
    expect(query).toMatchObject({ months: ["2026-06", "2026-07"], search: "TEC-01", page: 1, pageSize: 50, sort: "month", direction: "desc" });
  });
  it.each(["page=0", "page=-1", "page=1.5", "page=1e2", "page=1000001", "pageSize=101", "pageSize=0", "sort=operation", "direction=up", "role=ADMIN", "page=1&page=2", "search=a&search=b", `search=${"x".repeat(121)}`, "months=2026-13", "operations=inválido"])("rejeita entrada fora do contrato: %s", (query) => {
    expect(productivityPageQuerySchema.safeParse(productivityPageInputFromQuery(new URLSearchParams(query))).success).toBe(false);
  });
  it("filtra e pesquisa antes de contar/paginar; preserva zeros do contrato", () => {
    const result = paginateSyntheticProductivity(scopedBaseline, { months: ["2026-07"], operations: [operationA], search: "tec-0", sort: "technician", direction: "desc", pageSize: 2 });
    expect(result.total).toBe(4);
    expect(result.rows.map((row) => row.technician)).toEqual(["TEC-04", "TEC-03"]);
    expect(result.rows.map((row) => row.contract)).toEqual(["00004", "00003"]);
  });
  it("pesquisa pt-BR ignora caixa/acentos e inclui mês, meta e produção decimal", () => {
    expect(paginateSyntheticProductivity([{ ...scopedBaseline[0], technician: "Técnico Sintético" }], { search: "tecnico sintetico" }).total).toBe(1);
    expect(paginateSyntheticProductivity(scopedBaseline, { search: "julho" }).total).toBe(8);
    expect(paginateSyntheticProductivity(scopedBaseline, { search: "não" }).total).toBe(9);
    expect(paginateSyntheticProductivity([{ ...scopedBaseline[0], production: "0.1" }], { search: "0,10" }).total).toBe(1);
  });
  it("produção é ordenada exatamente, incluindo valores negativos e valores próximos grandes", () => {
    const values = ["100", "9.50", "-2.10", "999999999999.99", "999999999999.98"];
    const rows = values.map((production, index) => ({ ...scopedBaseline[index], production }));
    expect(paginateSyntheticProductivity(rows, { sort: "production", direction: "asc" }).rows.map((row) => row.production)).toEqual(["-2.10", "9.50", "100", "999999999999.98", "999999999999.99"]);
  });
  it("ordena mês com ano e preserva todos os registros em páginas estáveis", () => {
    const rows = [...scopedBaseline].reverse();
    const before = JSON.stringify(rows);
    const first = paginateSyntheticProductivity(rows, { pageSize: 8 });
    const second = paginateSyntheticProductivity(rows, { pageSize: 8, page: 2 });
    expect(first.rows.every((row) => row.month === "2026-07")).toBe(true);
    expect(second.rows.every((row) => row.month === "2026-06")).toBe(true);
    expect(new Set([...first.rows, ...second.rows].map((row) => row.sourceRowKey)).size).toBe(15);
    expect(JSON.stringify(rows)).toBe(before);
    expect(paginateSyntheticProductivity(rows, { sort: "month", direction: "asc" }).rows[0].month).toBe("2026-06");
  });
  it.each(["asc", "desc"])("metas indeterminadas ficam no fim em %s", (direction) => {
    const rows = [null, true, false].map((goalMet, index) => ({ ...scopedBaseline[index], goalMet }));
    expect(paginateSyntheticProductivity(rows, { sort: "goalMet", direction }).rows.map((row) => row.goalMet)).toEqual(direction === "asc" ? [false, true, null] : [true, false, null]);
  });
  it("não deduplica linhas de produção e rejeita identificador interno repetido", () => {
    const duplicate = { ...scopedBaseline[0], sourceRowKey: "outra-linha" };
    expect(paginateSyntheticProductivity([...scopedBaseline, duplicate], {}).total).toBe(16);
    expect(() => paginateSyntheticProductivity([...scopedBaseline, scopedBaseline[0]], {})).toThrow();
  });
});

describe("Caso de uso e fronteira HTTP do detalhamento", () => {
  it("retorna somente seis campos, produção textual e metadados completos", async () => {
    const result = await readProductivityPage(dependencies(), { pageSize: 8 });
    expect(result.pagination).toEqual({ page: 1, pageSize: 8, total: 15, totalPages: 2, hasNextPage: true, hasPreviousPage: false });
    expect(Object.keys(result.items[0]).sort()).toEqual(["contract", "goalMet", "month", "production", "supervisor", "technician"]);
    expect(result.items[0].production).toBe("100.00");
    expect(JSON.stringify(result)).not.toMatch(/sourceRowKey|technicianId|operationId|userId/);
  });
  it("página além do fim permanece vazia com total correto", async () => {
    const result = await readProductivityPage(dependencies(), { page: 9, pageSize: 8 });
    expect(result.items).toEqual([]);
    expect(result.pagination).toMatchObject({ page: 9, total: 15, totalPages: 2, hasNextPage: false, hasPreviousPage: true });
  });
  it("autentica antes de validar query e não chama repositório sem sessão", async () => {
    const deps = dependencies();
    deps.access.getCurrentAccess.mockResolvedValue(null);
    expect((await pageRequest(deps, "role=ADMIN")).status).toBe(401);
    expect(deps.repository.findPage).not.toHaveBeenCalled();
  });
  it("revalida perfil a cada consulta e bloqueia operação não autorizada antes do repositório", async () => {
    const deps = dependencies([operationA]);
    expect((await pageRequest(deps, `operations=${operationB}`)).status).toBe(403);
    expect(deps.repository.findPage).not.toHaveBeenCalled();
    await pageRequest(deps);
    deps.access.getCurrentAccess.mockResolvedValue({ userId: syntheticUserId, role: "ADMIN", active: false, operationIds: [operationA] });
    expect((await pageRequest(deps)).status).toBe(403);
    expect(deps.access.getCurrentAccess).toHaveBeenCalledTimes(3);
  });
  it("escopo vazio não consulta repositório; supervisor incompatível é descartado", async () => {
    const empty = dependencies([]);
    expect((await readProductivityPage(empty, {})).pagination.total).toBe(0);
    expect(empty.repository.findPage).not.toHaveBeenCalled();
    const deps = dependencies([operationA]);
    const result = await readProductivityPage(deps, { operations: [operationA], supervisors: [supervisorB] });
    expect(result.discardedSupervisorIds).toEqual([supervisorB]);
    expect(result.selected.supervisors).toEqual([]);
    expect(deps.repository.findPage).toHaveBeenCalledWith([operationA], expect.objectContaining({ operations: [operationA], supervisors: [] }));
    expect(result.items.every((item) => item.supervisor === "Equipe Exemplo A")).toBe(true);
  });
  it("rejeita linhas fora do escopo devolvidas por adaptador incorreto", async () => {
    const deps = dependencies([operationA]);
    deps.repository.findPage.mockResolvedValue({ rows: [scopedBaseline.find((row) => row.operationId === operationB)], total: 1 });
    expect((await pageRequest(deps)).status).toBe(403);
  });
  it.each([
    { rows: [], total: 15 },
    { rows: [scopedBaseline[0]], total: -1 },
    { rows: [...scopedBaseline].reverse(), total: 15 },
    { rows: [{ ...scopedBaseline[0], production: "inválida" }], total: 1 },
  ])("sanitiza retorno inválido do repositório", async (value) => {
    const deps = dependencies();
    deps.repository.findPage.mockResolvedValue(value);
    const response = await pageRequest(deps);
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: { code: "INTERNAL_ERROR", message: "Não foi possível consultar o detalhamento." } });
  });
  it("erro interno não ecoa conteúdo e entradas inválidas usam 400 sem consulta", async () => {
    const deps = dependencies();
    expect((await pageRequest(deps, "pageSize=101")).status).toBe(400);
    expect(deps.repository.findPage).not.toHaveBeenCalled();
    deps.repository.findPage.mockRejectedValue(new Error("conteúdo fictício restrito"));
    const response = await pageRequest(deps);
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("conteúdo fictício restrito");
  });
  it("marca resposta privada e não permite injetar parâmetros de permissão", async () => {
    const response = await pageRequest(dependencies());
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("vary")).toBe("Cookie");
    expect((await pageRequest(dependencies(), "role=ADMIN")).status).toBe(400);
  });
});
