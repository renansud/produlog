import { describe, expect, it } from "vitest";
import { handleDashboardRequest } from "@/modules/productivity/presentation/dashboard-http";
import type { ProductivityDependencies } from "@/modules/productivity/application/read-productivity-dashboard";
import { chartParityCases } from "../fixtures/chart-parity";
import { conflictingGoals, differentYears, duplicateTrue, unknownGoals, type FixtureRow } from "../fixtures/productivity";
import { operationA, operationB, scopedBaseline, supervisorA, supervisorB, syntheticUserId } from "../fixtures/scoped-productivity";

const scope = (rows: FixtureRow[]) => rows.map((row) => ({ ...row, operationId: row.operation === "Operação Exemplo A" ? operationA : operationB, supervisorId: row.supervisor === "Equipe Exemplo A" ? supervisorA : supervisorB }));
async function responses(query = "", rows: readonly unknown[] = scopedBaseline) {
  const dependencies: ProductivityDependencies = {
    access: { getCurrentAccess: async () => ({ userId: syntheticUserId, active: true, role: "USER", operationIds: [operationA, operationB] }) },
    repository: { findByOperations: async () => rows },
  };
  const result = await Promise.all(["monthly", "supervisors", "summary"].map(async (kind) => {
    const response = await handleDashboardRequest(new Request(`http://127.0.0.1:3000/api/v1/dashboard/${kind}?${query}`), kind, dependencies);
    expect(response.status).toBe(200);
    return response.json();
  }));
  return { monthly: result[0], supervisors: result[1], summary: result[2] };
}

describe("Paridade conjunta — oráculo independente das funções do produto", () => {
  it("a ordem das linhas não altera métricas ou ordenação das séries", async () => {
    const forward = await responses();
    const reversed = await responses("", [...scopedBaseline].reverse());
    expect(reversed).toEqual(forward);
  });

  it("duplicar todas as linhas dobra produção sem duplicar conquistas ou técnicos", async () => {
    const duplicated = [...scopedBaseline, ...scopedBaseline.map((row) => ({ ...row, sourceRowKey: `copy-${row.sourceRowKey}` }))];
    const result = await responses("", duplicated);
    expect(result.summary).toMatchObject({ technicians: 8, rowCount: 30, totalProduction: "3000.00", averageProduction: "100.00", evolution: { differencePercentagePoints: -5.36 } });
    expect(result.monthly.series).toMatchObject([
      { technicians: 7, goalsMet: 3, rate: 42.86 },
      { technicians: 8, goalsMet: 3, rate: 37.5 },
    ]);
    expect(result.supervisors.series).toMatchObject([
      { technicianMonths: 8, goalsMet: 4, rate: 50 },
      { technicianMonths: 7, goalsMet: 2, rate: 28.57 },
    ]);
  });

  it("cancelamento decimal exato zera produção sem afetar as metas", async () => {
    const rows = scopedBaseline.flatMap((row) => [
      { ...row, production: "0.10" },
      { ...row, sourceRowKey: `negative-${row.sourceRowKey}`, production: "-0.10" },
    ]);
    const result = await responses("", rows);
    expect(result.summary).toMatchObject({ totalProduction: "0.00", averageProduction: "0.00", rowCount: 30, technicians: 8, evolution: { differencePercentagePoints: -5.36 } });
    expect(result.monthly.series.map((point: { rate: number }) => point.rate)).toEqual([42.86, 37.5]);
    expect(result.supervisors.series.map((point: { rate: number }) => point.rate)).toEqual([50, 28.57]);
  });

  it.each(chartParityCases)("filtros, API e evolução: $name", async (reference) => {
    const result = await responses(reference.query);
    expect(result.monthly.series.map((point: { rate: number }) => point.rate)).toEqual(reference.monthly);
    expect(result.supervisors.series.map((point: { rate: number }) => point.rate)).toEqual(reference.supervisors);
    expect(result.supervisors.series.map((point: { supervisor: string }) => point.supervisor)).toEqual(reference.teams);
    expect(result.summary).toMatchObject({ totalProduction: reference.total, evolution: { differencePercentagePoints: reference.evolution } });
  });

  it.each([
    { name: "duplicidade positiva", rows: duplicateTrue, production: "725.50", warning: null },
    { name: "conflito de meta", rows: conflictingGoals, production: "710.25", warning: "CONFLICTING_GOALS" },
  ])("preserva produção e deduplica ambas as séries: $name", async ({ rows, production, warning }) => {
    const result = await responses("", scope(rows));
    expect(result.monthly.series[0]).toMatchObject({ technicians: 7, goalsMet: 3, rate: 42.86, coverage: 100 });
    expect(result.supervisors.series).toMatchObject([{ technicianMonths: 4, goalsMet: 2, rate: 50 }, { technicianMonths: 3, goalsMet: 1, rate: 33.33 }]);
    expect(result.summary).toMatchObject({ totalProduction: production, rowCount: 8, evolution: null });
    if (warning) {
      expect(result.monthly.quality.warnings).toContainEqual(expect.objectContaining({ code: warning }));
      expect(result.supervisors.quality.warnings).toContainEqual(expect.objectContaining({ code: warning }));
    }
  });

  it("indeterminados mantêm denominadores e cobertura zero nos dois contratos", async () => {
    const result = await responses("", scope(unknownGoals));
    expect(result.monthly.series[0]).toMatchObject({ technicians: 7, goalsMet: 0, unknownGoals: 7, rate: 0, coverage: 0 });
    expect(result.supervisors.series).toMatchObject([{ technicianMonths: 4, unknownGoals: 4, rate: 0, coverage: 0 }, { technicianMonths: 3, unknownGoals: 3, rate: 0, coverage: 0 }]);
    expect(result.monthly.quality.warnings.some((warning: { code: string }) => warning.code === "UNKNOWN_GOAL")).toBe(true);
    expect(result.supervisors.quality.warnings.some((warning: { code: string }) => warning.code === "UNKNOWN_GOAL")).toBe(true);
  });

  it("anos separados no histórico e contagem ponderada de técnicos-mês", async () => {
    const result = await responses("", scope([...differentYears].reverse()));
    expect(result.monthly.series.map((point: { month: string; rate: number }) => [point.month, point.rate])).toEqual([["2025-01", 100], ["2026-01", 0]]);
    expect(result.supervisors.series[0]).toMatchObject({ technicianMonths: 2, goalsMet: 1, rate: 50 });
    expect(result.summary.evolution).toMatchObject({ previousMonth: "2025-01", currentMonth: "2026-01", differencePercentagePoints: -100 });
  });

  it("evolução usa razões exatas na cadeia completa, sem subtrair rótulos arredondados", async () => {
    const previous = Array.from({ length: 6 }, (_, index) => ({ ...scopedBaseline[0], technician: `Exemplo ${index}`, sourceRowKey: `p-${index}`, goalMet: index === 0 }));
    const current = previous.slice(0, 3).map((row) => ({ ...row, month: "2026-07", sourceRowKey: `c-${row.sourceRowKey}` }));
    const result = await responses("", [...previous, ...current]);
    expect(result.monthly.series.map((point: { rate: number }) => point.rate)).toEqual([16.67, 33.33]);
    expect(result.summary.evolution).toMatchObject({ differencePercentagePoints: 16.67, exactDifference: { numerator: "50", denominator: "3" } });
    expect(result.supervisors.series[0]).toMatchObject({ technicianMonths: 9, goalsMet: 2, rate: 22.22 });
  });
});
