import { describe, expect, it, vi } from "vitest";
import { selectProductivityRows } from "@/modules/productivity/domain/productivity-filters";
import { readProductivityDashboard, type ProductivityDependencies } from "@/modules/productivity/application/read-productivity-dashboard";
import { operationA, operationB, scopedBaseline, supervisorA, supervisorB, syntheticUserId } from "../fixtures/scoped-productivity";

function dependencies(context: unknown = { userId: syntheticUserId, active: true, role: "USER", operationIds: [operationA, operationB] }) {
  return {
    access: { getCurrentAccess: vi.fn(async () => context) },
    repository: { findByOperations: vi.fn(async (ids: readonly string[]) => scopedBaseline.filter((row) => ids.includes(row.operationId))) },
  } satisfies ProductivityDependencies;
}

describe("Filtros puros de produtividade", () => {
  it("seleção vazia preserva todas as linhas fornecidas", () => {
    const result = selectProductivityRows(scopedBaseline, {});
    expect(result.filteredRows).toHaveLength(15);
    expect(result.timelineRows).toHaveLength(15);
    expect(result.filters).toEqual({ months: [], operations: [], supervisors: [] });
  });

  it("Mês só restringe o conjunto dos cards e detalhes", () => {
    const result = selectProductivityRows(scopedBaseline, { months: ["2026-07"] });
    expect(result.filteredRows).toHaveLength(8);
    expect(result.timelineRows).toHaveLength(15);
  });

  it("combina AND entre campos e OR dentro das seleções", () => {
    const result = selectProductivityRows(scopedBaseline, { months: ["2026-06", "2026-07"], operations: [operationA, operationB], supervisors: [supervisorA] });
    expect(result.filteredRows).toHaveLength(8);
    expect(result.filteredRows.every((row) => row.supervisorId === supervisorA)).toBe(true);
    expect(selectProductivityRows(scopedBaseline, { months: ["2026-07"], operations: [operationA], supervisors: [supervisorA] }).filteredRows).toHaveLength(4);
  });

  it("remove supervisor incompatível após trocar a operação", () => {
    const result = selectProductivityRows(scopedBaseline, { operations: [operationB], supervisors: [supervisorA, supervisorB] });
    expect(result.filters.supervisors).toEqual([supervisorB]);
    expect(result.discardedSupervisorIds).toEqual([supervisorA]);
    expect(result.options.supervisors.map((option) => option.id)).toEqual([supervisorB]);
    expect(result.options.operations.map((option) => option.id)).toEqual([operationA, operationB]);
    expect(selectProductivityRows(scopedBaseline, { operations: [operationB], supervisors: [supervisorA] }).filteredRows).toHaveLength(7);
  });

  it("mês sem dados não apaga o histórico e supervisores são independentes de mês", () => {
    const result = selectProductivityRows(scopedBaseline, { months: ["2027-01"], operations: [operationA] });
    expect(result.filteredRows).toHaveLength(0);
    expect(result.timelineRows).toHaveLength(8);
    expect(result.options.months).toEqual(["2026-06", "2026-07"]);
    expect(result.options.supervisors).toHaveLength(1);
  });

  it.each([{ months: ["Jul"] }, { months: ["2026-13"] }, { operations: ["nome"] }, { role: "ADMIN" }, { operationIds: [operationB] }, { months: "2026-07" }])("rejeita filtro inválido ou permissão no payload: %j", (filters) => {
    expect(() => selectProductivityRows(scopedBaseline, filters)).toThrow();
  });

  it("não modifica os dados e normaliza repetições nos parâmetros", () => {
    const before = JSON.stringify(scopedBaseline);
    expect(selectProductivityRows(scopedBaseline, { operations: [operationA, operationA] }).filters.operations).toEqual([operationA]);
    expect(JSON.stringify(scopedBaseline)).toBe(before);
  });
});

describe("Aplicação do escopo no servidor", () => {
  it("separa KPIs filtrados do histórico mensal e evolução", async () => {
    const deps = dependencies();
    const result = await readProductivityDashboard(deps, { months: ["2026-07"] });
    expect(result.summary).toMatchObject({ technicians: 8, totalProduction: "800.00", rowCount: 8, evolution: { differencePercentagePoints: "-5.36" } });
    expect(result.monthly.series.map((item) => item.month)).toEqual(["2026-06", "2026-07"]);
    expect(result.rows).toHaveLength(8);
    expect(deps.repository.findByOperations).toHaveBeenCalledWith([operationA, operationB]);
  });

  it.each([operationA, operationB])("operação restringe cards, mensal e evolução: %s", async (operation) => {
    const result = await readProductivityDashboard(dependencies(), { operations: [operation] });
    expect(result.summary.evolution?.differencePercentagePoints).toBe(operation === operationA ? "0.00" : "-8.33");
    expect(result.summary.totalProduction).toBe(operation === operationA ? "800.00" : "700.00");
  });

  it.each(["ADMIN", "USER"])("consulta somente as operações fornecidas pelo servidor para %s", async (role) => {
    const deps = dependencies({ userId: syntheticUserId, active: true, role, operationIds: [operationA] });
    const result = await readProductivityDashboard(deps, {});
    expect(deps.repository.findByOperations).toHaveBeenCalledWith([operationA]);
    expect(result.rows.every((row) => row.operationId === operationA)).toBe(true);
    expect(result.options.operations.map((option) => option.id)).toEqual([operationA]);
    expect(result.options.supervisors.map((option) => option.id)).toEqual([supervisorA]);
    expect(result.monthly.series.map((item) => item.rate)).toEqual(["50.00", "50.00"]);
  });

  it("pedido de operação não autorizada falha antes de consultar dados", async () => {
    const deps = dependencies({ userId: syntheticUserId, active: true, role: "USER", operationIds: [operationA] });
    await expect(readProductivityDashboard(deps, { operations: [operationA, operationB] })).rejects.toMatchObject({ status: 403, code: "FORBIDDEN" });
    expect(deps.repository.findByOperations).not.toHaveBeenCalled();
  });

  it("sem identidade retorna 401 e desativado retorna 403 sem consulta", async () => {
    const absent = dependencies(null);
    await expect(readProductivityDashboard(absent, {})).rejects.toMatchObject({ status: 401, code: "UNAUTHORIZED" });
    expect(absent.repository.findByOperations).not.toHaveBeenCalled();
    const inactive = dependencies({ userId: syntheticUserId, active: false, role: "ADMIN", operationIds: [operationA] });
    await expect(readProductivityDashboard(inactive, {})).rejects.toMatchObject({ status: 403 });
    expect(inactive.repository.findByOperations).not.toHaveBeenCalled();
  });

  it("escopo vazio não vira acesso global e não consulta o repositório", async () => {
    const deps = dependencies({ userId: syntheticUserId, active: true, role: "USER", operationIds: [] });
    const result = await readProductivityDashboard(deps, {});
    expect(result.rows).toEqual([]);
    expect(result.monthly.series).toEqual([]);
    expect(result.summary.totalProduction).toBe("0.00");
    expect(deps.repository.findByOperations).not.toHaveBeenCalled();
  });

  it("revalida permissões a cada chamada e bloqueia revogação", async () => {
    const deps = dependencies();
    await readProductivityDashboard(deps, {});
    deps.access.getCurrentAccess.mockResolvedValueOnce({ userId: syntheticUserId, active: false, role: "USER", operationIds: [] });
    await expect(readProductivityDashboard(deps, {})).rejects.toMatchObject({ status: 403 });
    expect(deps.access.getCurrentAccess).toHaveBeenCalledTimes(2);
    expect(deps.repository.findByOperations).toHaveBeenCalledTimes(1);
  });

  it("falha sem devolver resultado parcial se o repositório viola o escopo", async () => {
    const deps = dependencies({ userId: syntheticUserId, active: true, role: "USER", operationIds: [operationA] });
    deps.repository.findByOperations.mockResolvedValueOnce(scopedBaseline);
    await expect(readProductivityDashboard(deps, {})).rejects.toMatchObject({ status: 403 });
  });

  it.each([{ role: "SUPERADMIN" }, { active: "true" }, { operationIds: ["*"] }, { operationIds: undefined }])("contexto de servidor inválido não amplia acesso: %j", async (override) => {
    const deps = dependencies({ userId: syntheticUserId, active: true, role: "ADMIN", operationIds: [operationA], ...override });
    await expect(readProductivityDashboard(deps, {})).rejects.toMatchObject({ status: 403 });
    expect(deps.repository.findByOperations).not.toHaveBeenCalled();
  });
});
