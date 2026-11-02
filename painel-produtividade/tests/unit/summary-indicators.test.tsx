import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { buildDashboardSummary, dashboardSummarySchema } from "@/modules/productivity/application/dashboard-summary-contract";
import { calculateEvolution, calculateKpis } from "@/modules/productivity/domain/productivity-metrics";
import { SummaryIndicators, SummaryUnavailable } from "@/modules/productivity/presentation/summary-indicators";
import { baseline, conflictingGoals, unknownGoals } from "../fixtures/productivity";

function summary(rows: readonly unknown[] = baseline, timeline = rows) {
  const { evolution, warnings } = calculateEvolution(timeline);
  return buildDashboardSummary({ ...calculateKpis(rows), evolution, evolutionWarnings: warnings });
}

describe("Contrato compartilhado do resumo", () => {
  it("mantém produção textual, percentuais finais numéricos e não expõe linhas", () => {
    const result = summary();
    expect(result).toMatchObject({ technicians: 8, rowCount: 15, totalProduction: "1500.00", averageProduction: "100.00", evolution: { differencePercentagePoints: -5.36, exactDifference: { numerator: "-75", denominator: "14" } } });
    expect(JSON.stringify(result)).not.toMatch(/TEC-01|sourceRowKey|technicianKey/);
    expect(dashboardSummarySchema.parse(result)).toEqual(result);
  });

  it.each([
    { totalProduction: 1500 }, { averageProduction: "100,00" }, { technicians: -1 },
    { rowCount: 0 }, { totalProduction: "NaN" }, { role: "ADMIN" },
  ])("rejeita dado inválido antes de chegar aos cards: %j", (override) => {
    expect(dashboardSummarySchema.safeParse({ ...summary(), ...override }).success).toBe(false);
  });

  it("rejeita percentuais não finitos, precisão excessiva e direção inconsistente", () => {
    const original = summary();
    for (const fields of [{ currentPercent: Infinity }, { previousPercent: 42.857 }, { direction: "positive" }, { differencePercentagePoints: -5.35 }, { exactDifference: { numerator: "inválido", denominator: "1" } }, { exactDifference: { numerator: "1", denominator: "0" } }]) {
      expect(dashboardSummarySchema.safeParse({ ...original, evolution: { ...original.evolution, ...fields } }).success).toBe(false);
    }
  });
});

describe("Cards integrados ao contrato", () => {
  it("renderiza os quatro valores na ordem e formatação documentadas", () => {
    render(<SummaryIndicators summary={summary()} />);
    expect(screen.getAllByRole("article").map((article) => article.getAttribute("aria-labelledby"))).toEqual(["technicians-title", "evolution-title", "average-title", "production-title"]);
    expect(screen.getByRole("article", { name: "Técnicos" })).toHaveTextContent("8");
    expect(screen.getByRole("article", { name: "Evolução" })).toHaveTextContent("-5,36%");
    expect(screen.getByRole("article", { name: "Média de produção" })).toHaveTextContent("100,00");
    expect(screen.getByRole("article", { name: "Produção total" })).toHaveTextContent("1.500,00");
  });

  it("recorte vazio tem média indisponível e preserva evolução do histórico", () => {
    render(<SummaryIndicators summary={summary([], baseline)} />);
    expect(screen.getByRole("status", { name: "Sem registros no recorte" })).toBeVisible();
    expect(screen.getByRole("article", { name: "Média de produção" })).toHaveTextContent("—");
    expect(screen.getByRole("article", { name: "Produção total" })).toHaveTextContent("0,00");
    expect(screen.getByRole("article", { name: "Evolução" })).toHaveTextContent("-5,36%");
  });

  it("sem histórico não apresenta evolução calculada", () => {
    render(<SummaryIndicators summary={summary([])} />);
    expect(screen.getByRole("article", { name: "Evolução" })).toHaveTextContent("Sem meses suficientes para comparar");
  });

  it("mostra ressalva visível para metas indeterminadas", () => {
    render(<SummaryIndicators summary={summary(unknownGoals)} />);
    expect(screen.getByRole("status", { name: "Ressalvas das metas" })).toHaveTextContent("Há metas indeterminadas");
  });

  it("conflitos ficam visíveis e detalhes de identificação podem ser abertos", async () => {
    const user = userEvent.setup();
    render(<SummaryIndicators summary={summary(conflictingGoals)} />);
    expect(screen.getByRole("status", { name: "Ressalvas das metas" })).toHaveTextContent("marcações de meta divergentes");
    await user.click(screen.getByText("Qualidade dos dados", { exact: true }));
    expect(screen.getByText("Parte da identificação usa nomes; homônimos precisam de revisão.")).toBeVisible();
  });

  it("falha de leitura mostra erro sem valores ou detalhes internos", () => {
    render(<SummaryUnavailable />);
    expect(screen.getByRole("alert", { name: "Indicadores indisponíveis" })).toBeVisible();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
  });
});
