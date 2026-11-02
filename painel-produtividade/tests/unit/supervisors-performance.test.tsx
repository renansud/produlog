import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { buildDashboardSupervisors, dashboardSupervisorsSchema } from "@/modules/productivity/application/dashboard-supervisors-contract";
import { calculateSupervisorPerformance } from "@/modules/productivity/domain/supervisor-performance";
import { SupervisorsPerformancePanel } from "@/modules/productivity/presentation/supervisors-performance-panel";
import { scopedBaseline } from "../fixtures/scoped-productivity";

vi.mock("@/components/dashboard/supervisors-chart", () => ({ SupervisorsChart: () => <div>Gráfico de supervisão</div> }));
const supervisors = (rows: readonly unknown[] = scopedBaseline) => buildDashboardSupervisors(calculateSupervisorPerformance(rows));

describe("Contrato de supervisão", () => {
  it("preserva contagens ponderadas e não expõe linhas de técnicos", () => {
    const result = supervisors();
    expect(result.series.map(({ rate }) => rate)).toEqual([50, 28.57]);
    expect(result.series[1]).toMatchObject({ technicianMonths: 7, goalsMet: 2 });
    expect(JSON.stringify(result)).not.toMatch(/TEC-01|sourceRowKey|technicianKey/);
  });
  it.each([{ rate: Infinity }, { rate: 50.001 }, { rate: 49.99 }, { coverage: 90 }, { technicianMonths: 0 }, { goalsMet: 9 }, { unknownGoals: 8 }, { supervisorId: "inválido" }])("rejeita contrato inconsistente: %j", (override) => {
    const result = supervisors();
    expect(dashboardSupervisorsSchema.safeParse({ ...result, series: [{ ...result.series[0], ...override }] }).success).toBe(false);
  });
  it("rejeita ordem crescente, identidades repetidas e campos extras", () => {
    const result = supervisors();
    expect(dashboardSupervisorsSchema.safeParse({ ...result, series: [...result.series].reverse() }).success).toBe(false);
    expect(dashboardSupervisorsSchema.safeParse({ ...result, series: [result.series[0], result.series[0]] }).success).toBe(false);
    expect(dashboardSupervisorsSchema.safeParse({ ...result, rows: scopedBaseline }).success).toBe(false);
  });
  it("desempata taxas iguais alfabeticamente sem depender das linhas de origem", () => {
    const result = supervisors(scopedBaseline.map((row) => ({ ...row, goalMet: true })).reverse());
    expect(result.series.map((point) => point.supervisor)).toEqual(["Equipe Exemplo A", "Equipe Exemplo B"]);
    expect(dashboardSupervisorsSchema.safeParse({ ...result, series: [...result.series].reverse() }).success).toBe(false);
  });
  it("ordena por taxa exata mesmo quando os rótulos arredondados coincidem", () => {
    const original = supervisors();
    const lower = { ...original.series[0], supervisor: "Alfa", technicianMonths: 100000, goalsMet: 50000, rate: 50 };
    const higher = { ...original.series[1], supervisor: "Zeta", technicianMonths: 100000, goalsMet: 50001, rate: 50 };
    expect(dashboardSupervisorsSchema.safeParse({ ...original, series: [higher, lower] }).success).toBe(true);
    expect(dashboardSupervisorsSchema.safeParse({ ...original, series: [lower, higher] }).success).toBe(false);
  });
});

describe("Painel de supervisão", () => {
  it("mostra contagens de técnicos-mês e aplica o período selecionado", () => {
    render(<SupervisorsPerformancePanel supervisors={supervisors()} months={["2026-07"]} />);
    expect(screen.getByRole("region", { name: "Performance Mensal Supervisão" })).toHaveTextContent("Julho de 2026");
    fireEvent.click(screen.getByText("Consultar dados da Performance Mensal Supervisão"));
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Equipe Exemplo A");
    expect(rows[2]).toHaveTextContent("28,57%");
    expect(screen.getAllByRole("cell").slice(5).map((cell) => cell.textContent)).toEqual(["7", "2", "0", "28,57%", "100,00%"]);
  });
  it("recorte vazio não fabrica taxa ou gráfico", () => {
    render(<SupervisorsPerformancePanel supervisors={supervisors([])} months={[]} />);
    expect(screen.getByRole("status", { name: "Sem resultados de supervisão" })).toBeVisible();
    expect(screen.queryByText("Gráfico de supervisão")).not.toBeInTheDocument();
  });
  it("exibe metas indeterminadas e cobertura zero sem removê-las do denominador", () => {
    render(<SupervisorsPerformancePanel supervisors={supervisors(scopedBaseline.map((row) => ({ ...row, goalMet: null })))} months={[]} />);
    expect(screen.getByRole("status", { name: "Ressalvas da supervisão" })).toHaveTextContent("indeterminadas permanecem no denominador");
    fireEvent.click(screen.getByText("Consultar dados da Performance Mensal Supervisão"));
    expect(screen.getAllByRole("cell").slice(0, 5).map((cell) => cell.textContent)).toEqual(["8", "0", "8", "0,00%", "0,00%"]);
  });
  it("torna divergências visíveis no painel", () => {
    render(<SupervisorsPerformancePanel supervisors={supervisors([...scopedBaseline, { ...scopedBaseline[0], sourceRowKey: "conflict", goalMet: false }])} months={[]} />);
    expect(screen.getByRole("status", { name: "Ressalvas da supervisão" })).toHaveTextContent("marcações divergentes");
  });
});
