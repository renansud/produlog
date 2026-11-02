import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { buildDashboardMonthly, dashboardMonthlySchema } from "@/modules/productivity/application/dashboard-monthly-contract";
import { calculateMonthlyPerformance } from "@/modules/productivity/domain/productivity-metrics";
import { MonthlyPerformancePanel } from "@/modules/productivity/presentation/monthly-performance-panel";
import { baseline, differentYears, unknownGoals } from "../fixtures/productivity";

// Layout SVG e interação são verificados no Chromium; jsdom testa o resumo sem layout.
vi.mock("@/components/dashboard/monthly-chart", () => ({ MonthlyChart: () => <div>Gráfico mensal</div> }));
const monthly = (rows: readonly unknown[] = baseline) => buildDashboardMonthly(calculateMonthlyPerformance(rows));

describe("Contrato mensal compartilhado", () => {
  it("projeta somente agregados, mantendo taxas e razões do domínio", () => {
    const result = monthly();
    expect(result.series.map(({ month, rate }) => [month, rate])).toEqual([["2026-06", 42.86], ["2026-07", 37.5]]);
    expect(result.series[0]).toMatchObject({ goalsMet: 3, technicians: 7, coverage: 100, rateExact: { numerator: "300", denominator: "7" } });
    expect(JSON.stringify(result)).not.toMatch(/TEC-01|sourceRowKey|technicianKey/);
  });
  it.each([{ rate: Infinity }, { rate: 42.857 }, { technicians: 0 }, { goalsMet: 8 }, { unknownGoals: 7 }, { coverage: 99 }, { rateExact: { numerator: "1", denominator: "0" } }, { rate: 42.85 }])("rejeita série inconsistente: %j", (override) => {
    const result = monthly();
    expect(dashboardMonthlySchema.safeParse({ ...result, series: [{ ...result.series[0], ...override }] }).success).toBe(false);
  });
  it("rejeita meses repetidos ou fora de ordem e campos internos", () => {
    const result = monthly();
    expect(dashboardMonthlySchema.safeParse({ ...result, series: [...result.series].reverse() }).success).toBe(false);
    expect(dashboardMonthlySchema.safeParse({ ...result, series: [result.series[0], result.series[0]] }).success).toBe(false);
    expect(dashboardMonthlySchema.safeParse({ ...result, rows: baseline }).success).toBe(false);
  });
});

describe("Apresentação mensal", () => {
  it("oferece tabela textual com taxas, contagens, cobertura e referência do filtro", () => {
    render(<MonthlyPerformancePanel monthly={monthly()} />);
    const region = screen.getByRole("region", { name: "Performance Mensal" });
    expect(region).toHaveTextContent("Mês não altera este histórico");
    fireEvent.click(screen.getByText("Consultar dados da Performance Mensal"));
    const rows = within(region).getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Junho de 2026");
    expect(rows[1]).toHaveTextContent("42,86%");
    expect(rows[2]).toHaveTextContent("37,50%");
  });
  it("preserva ano e cronologia sem inventar meses intermediários", () => {
    render(<MonthlyPerformancePanel monthly={monthly(differentYears)} />);
    fireEvent.click(screen.getByText("Consultar dados da Performance Mensal"));
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3);
    expect(rows[1]).toHaveTextContent("Janeiro de 2025");
    expect(rows[2]).toHaveTextContent("Janeiro de 2026");
  });
  it("sem histórico mostra estado vazio, sem gráfico ou taxa inventada", () => {
    render(<MonthlyPerformancePanel monthly={monthly([])} />);
    expect(screen.getByRole("status", { name: "Sem histórico mensal" })).toBeVisible();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText("Gráfico mensal")).not.toBeInTheDocument();
  });
  it("informa indeterminados no denominador e cobertura zero", () => {
    render(<MonthlyPerformancePanel monthly={monthly(unknownGoals)} />);
    fireEvent.click(screen.getByText("Consultar dados da Performance Mensal"));
    expect(screen.getByRole("status", { name: "Ressalvas do histórico mensal" })).toHaveTextContent("indeterminadas permanecem no denominador");
    const cells = screen.getAllByRole("cell");
    expect(cells.map((cell) => cell.textContent)).toEqual(["7", "0", "7", "0,00%", "0,00%"]);
  });
});
