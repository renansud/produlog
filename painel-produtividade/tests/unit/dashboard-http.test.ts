import { describe, expect, it, vi } from "vitest";
import { calculateSupervisorPerformance } from "@/modules/productivity/domain/supervisor-performance";
import { handleDashboardRequest } from "@/modules/productivity/presentation/dashboard-http";
import { handleDemoDashboard } from "@/modules/productivity/infrastructure/demo-dashboard";
import { operationA, operationB, scopedBaseline, supervisorA, supervisorB, syntheticUserId } from "../fixtures/scoped-productivity";

function dependencies(active = true, allowed = [operationA, operationB]) {
  return {
    access: { getCurrentAccess: async (): Promise<unknown> => ({ userId: syntheticUserId, role: "USER", active, operationIds: allowed }) },
    repository: { findByOperations: vi.fn(async (ids: readonly string[]) => scopedBaseline.filter((row) => ids.includes(row.operationId))) },
  };
}
const request = (query = "") => new Request(`http://127.0.0.1:3000/api/v1/dashboard/summary${query}`);

describe("Agregação por supervisão", () => {
  it("soma técnicos-mês sem calcular média simples das taxas mensais", () => {
    expect(calculateSupervisorPerformance(scopedBaseline).series).toMatchObject([
      { supervisorId: supervisorA, technicianMonths: 8, goalsMet: 4, rate: "50.00" },
      { supervisorId: supervisorB, technicianMonths: 7, goalsMet: 2, rate: "28.57" },
    ]);
  });
  it("preserva denominador deduplicado com linhas repetidas e informa ausência de meta", () => {
    const rows = scopedBaseline.filter((row) => row.month === "2026-06");
    const result = calculateSupervisorPerformance([...rows, { ...rows[0], sourceRowKey: "extra" }]);
    expect(result.series[0]).toMatchObject({ technicianMonths: 4, goalsMet: 2, rate: "50.00" });
    expect(calculateSupervisorPerformance(rows.map((row) => ({ ...row, goalMet: null }))).series.every((item) => item.unknownGoals === item.technicianMonths && item.coverage === "0.00")).toBe(true);
    expect(calculateSupervisorPerformance([])).toEqual({ series: [], warnings: [] });
  });
  it("desempata alfabeticamente e mantém a mesma saída ao inverter as linhas", () => {
    const rows = scopedBaseline.map((row) => ({ ...row, goalMet: true }));
    const result = calculateSupervisorPerformance(rows);
    expect(result.series.map((item) => item.supervisorId)).toEqual([supervisorA, supervisorB]);
    expect(calculateSupervisorPerformance([...rows].reverse())).toEqual(result);
  });
});

describe("Contratos HTTP", () => {
  it("summary projeta o DTO sem linhas ou chaves internas", async () => {
    const response = await handleDashboardRequest(request("?months=2026-07"), "summary", dependencies());
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    const body = await response.json();
    expect(body).toMatchObject({ technicians: 8, totalProduction: "800.00", averageProduction: "100.00", evolution: { previousPercent: 42.86, currentPercent: 37.5, differencePercentagePoints: -5.36 } });
    expect(body).not.toHaveProperty("rows");
    expect(JSON.stringify(body)).not.toContain("TEC-01");
  });
  it("aceita listas separadas por vírgula e parâmetros repetidos", async () => {
    const response = await handleDashboardRequest(request(`?months=2026-06&months=2026-07&operations=${operationA},${operationB}`), "monthly", dependencies());
    expect((await response.json()).series.map((item: { rate: number }) => item.rate)).toEqual([42.86, 37.5]);
  });
  it("supervisors aplica Mês, enquanto monthly ignora somente Mês", async () => {
    const req = request("?months=2026-07");
    const supervisors = await (await handleDashboardRequest(req, "supervisors", dependencies())).json();
    expect(supervisors.series.map((item: { rate: number }) => item.rate)).toEqual([50, 25]);
    const monthly = await (await handleDashboardRequest(req, "monthly", dependencies())).json();
    expect(monthly.series).toHaveLength(2);
  });
  it("filters retorna somente opções autorizadas e seleções efetivas", async () => {
    const response = await handleDashboardRequest(request(`?operations=${operationA}&supervisors=${supervisorB}`), "filters", dependencies(true, [operationA]));
    const body = await response.json();
    expect(body.operations.map((item: { id: string }) => item.id)).toEqual([operationA]);
    expect(body.supervisors.map((item: { id: string }) => item.id)).toEqual([supervisorA]);
    expect(body.selected.supervisors).toEqual([]);
    expect(body.discardedSupervisorIds).toEqual([supervisorB]);
    expect(JSON.stringify(body)).not.toContain("Equipe Exemplo B");
  });
  it.each(["?role=ADMIN", "?months=2026-13", "?operations=inválido", `?operations=${operationA},,${operationB}`])("rejeita parâmetros sem ecoar o conteúdo: %s", async (query) => {
    const response = await handleDashboardRequest(request(query), "summary", dependencies());
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: { code: "BAD_REQUEST", message: "Filtros inválidos." } });
  });
  it("autentica antes de informar falhas nos filtros e bloqueia operação não autorizada", async () => {
    const absent = dependencies();
    absent.access.getCurrentAccess = async () => null;
    expect((await handleDashboardRequest(request("?role=ADMIN"), "summary", absent)).status).toBe(401);
    expect((await handleDashboardRequest(request(`?operations=${operationB}`), "summary", dependencies(true, [operationA]))).status).toBe(403);
    expect((await handleDashboardRequest(request(), "summary", dependencies(false))).status).toBe(403);
  });
  it("sanitiza erro interno, inclusive retorno inválido do repositório", async () => {
    const deps = dependencies();
    deps.repository.findByOperations.mockRejectedValueOnce(new Error("segredo fictício que não deve sair"));
    const response = await handleDashboardRequest(request(), "summary", deps);
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: { code: "INTERNAL_ERROR", message: "Não foi possível consultar os indicadores." } });
    const broken = { ...deps, repository: { findByOperations: async () => [{ production: "inválida" }] } };
    expect((await handleDashboardRequest(request(), "summary", broken)).status).toBe(500);
  });
  it("tipo de endpoint desconhecido retorna 404", async () => {
    expect((await handleDashboardRequest(request(), "unknown", dependencies())).status).toBe(404);
  });
});

describe("Fronteira da demonstração local", () => {
  it("não permite demo em produção ou teste", async () => {
    expect((await handleDemoDashboard(request(), "summary")).status).toBe(404);
  });
  it("em desenvolvimento rejeita host e origem externos, sem permitir privilégios via URL", async () => {
    vi.stubEnv("NODE_ENV", "development");
    try {
      expect((await handleDemoDashboard(new Request("https://externo.example/api/demo/dashboard/summary"), "summary")).status).toBe(403);
      expect((await handleDemoDashboard(new Request(request(), { headers: { origin: "https://externo.example" } }), "summary")).status).toBe(403);
      expect((await handleDemoDashboard(new Request(request(), { headers: { "sec-fetch-site": "cross-site" } }), "summary")).status).toBe(403);
      expect((await handleDemoDashboard(request("?role=ADMIN"), "summary")).status).toBe(400);
      const response = await handleDemoDashboard(request(), "summary");
      expect(response.headers.get("x-servlog-demo")).toBe("synthetic");
      expect(await response.json()).toMatchObject({ demo: true, totalProduction: "1500.00" });
    } finally { vi.unstubAllEnvs(); }
  });
});
