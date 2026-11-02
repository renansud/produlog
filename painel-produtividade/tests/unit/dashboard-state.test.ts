import { describe, expect, it } from "vitest";
import { dashboardStateSchema, dashboardStateQueryString, transitionDashboardState, reconcileDashboardState, dashboardCsvQueryString, hasDashboardFilters } from "@/modules/productivity/domain/dashboard-state";
import { productivityPageInputFromQuery, productivityPageQuerySchema } from "@/modules/productivity/domain/productivity-page";
import { operationA, operationB, supervisorB } from "../fixtures/scoped-productivity";

const state = () => dashboardStateSchema.parse({ months: ["2026-07"], operations: [operationA], search: "TEC-01", sort: "technician", direction: "asc", page: 3, pageSize: 5 });
describe("Estado aplicado do painel", () => {
  it("troca filtros preservando busca, ordem e tamanho e reiniciando a página", () => {
    const next = transitionDashboardState(state(), { type: "filters", filters: { months: ["2026-06"], operations: [operationB], supervisors: [supervisorB] } });
    expect(next).toMatchObject({ months: ["2026-06"], operations: [operationB], supervisors: [supervisorB], search: "TEC-01", sort: "technician", direction: "asc", pageSize: 5, page: 1 });
  });
  it("limpar remove dimensões e pesquisa, preservando ordem/tamanho", () => {
    expect(transitionDashboardState(state(), { type: "clear" })).toEqual({ months: [], operations: [], supervisors: [], search: "", sort: "technician", direction: "asc", pageSize: 5, page: 1 });
    expect(hasDashboardFilters(dashboardStateSchema.parse({ search: "TEC" }))).toBe(true);
    expect(hasDashboardFilters(dashboardStateSchema.parse({ page: 2 }))).toBe(false);
  });
  it("busca, coluna e tamanho reiniciam página; paginação não altera o recorte", () => {
    expect(transitionDashboardState(state(), { type: "search", search: " TEC-02 " })).toMatchObject({ search: "TEC-02", page: 1, sort: "technician", pageSize: 5 });
    expect(transitionDashboardState(state(), { type: "sort", field: "technician" })).toMatchObject({ direction: "desc", page: 1 });
    expect(transitionDashboardState(state(), { type: "pageSize", pageSize: 25 })).toMatchObject({ pageSize: 25, page: 1, search: "TEC-01" });
    expect(transitionDashboardState(state(), { type: "page", page: 2 })).toEqual({ ...state(), page: 2 });
  });
  it("não muta o estado e rejeita ações que produziriam parâmetros inválidos", () => {
    const original = state(); const before = JSON.stringify(original);
    transitionDashboardState(original, { type: "clear" });
    expect(JSON.stringify(original)).toBe(before);
    expect(() => transitionDashboardState(original, { type: "pageSize", pageSize: 101 })).toThrow();
  });
  it("serialização canônica preserva a URL limpa padrão e os valores aplicados", () => {
    expect(dashboardStateQueryString(dashboardStateSchema.parse({}))).toBe("");
    expect(dashboardStateSchema.parse(productivityPageInputFromQuery(new URLSearchParams(dashboardStateQueryString(state()))))).toEqual(state());
    expect(productivityPageQuerySchema.parse({}).pageSize).toBe(50);
    expect(dashboardStateSchema.parse({}).pageSize).toBe(10);
  });
  it("saneamento de supervisor preserva pesquisa/ordem/tamanho e volta à primeira página", () => {
    const params = new URLSearchParams(`operations=${operationA}&supervisors=${supervisorB}&search=TEC-01&sort=technician&direction=asc&pageSize=5&page=9`);
    const result = new URLSearchParams(reconcileDashboardState(params, { months: [], operations: [operationA], supervisors: [] }));
    expect(dashboardStateSchema.parse(productivityPageInputFromQuery(result))).toMatchObject({ search: "TEC-01", sort: "technician", direction: "asc", pageSize: 5, page: 1, supervisors: [] });
  });
  it("não elimina parâmetros inválidos ou desconhecidos ao reconciliar filtros", () => {
    const params = new URLSearchParams(`operations=${operationA}&sort=inválido&role=ADMIN`);
    const result = new URLSearchParams(reconcileDashboardState(params, { months: [], operations: [operationA], supervisors: [] }));
    expect(result.get("role")).toBe("ADMIN");
    expect(result.get("sort")).toBe("inválido");
  });
  it("CSV conserva seleção aplicada e independe de página/tamanho", () => {
    const first = state(); const second = { ...first, page: 99, pageSize: 100 };
    expect(dashboardCsvQueryString(first)).toBe(dashboardCsvQueryString(second));
    expect(productivityPageQuerySchema.parse(productivityPageInputFromQuery(new URLSearchParams(dashboardCsvQueryString(first))))).toMatchObject({ search: "TEC-01", operations: [operationA], sort: "technician", direction: "asc", page: 1, pageSize: 100 });
  });
});
