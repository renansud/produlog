import { describe, expect, it } from "vitest";
import { calculateEvolution, calculateKpis, calculateMonthlyPerformance } from "@/modules/productivity/domain/productivity-metrics";
import { baseline, conflictingGoals, differentYears, duplicateTrue, july, june, positiveEvolution, unknownGoals } from "../fixtures/productivity";

describe("KPIs de produção", () => {
  it("conta técnicos distintos e calcula soma e média por linha", () => {
    expect(calculateKpis(baseline)).toMatchObject({ technicians: 8, rowCount: 15, totalProduction: "1500.00", averageProduction: "100.00" });
  });

  it("não elimina produção de linhas repetidas nem calcula média por técnico", () => {
    expect(calculateKpis(duplicateTrue)).toMatchObject({ technicians: 7, rowCount: 8, totalProduction: "725.50", averageProduction: "90.69", averageProductionExact: { numerator: "1451", denominator: "16" } });
    expect(calculateKpis(conflictingGoals)).toMatchObject({ totalProduction: "710.25", averageProduction: "88.78" });
  });

  it("soma decimais pequenos sem erro binário e aceita escala de até duas casas", () => {
    const result = calculateKpis([{ ...june[0], production: "0.1" }, { ...june[1], production: "0.20" }]);
    expect(result.totalProduction).toBe("0.30");
    expect(result.averageProduction).toBe("0.15");
    expect(calculateKpis([{ ...june[0], production: "100" }]).totalProduction).toBe("100.00");
  });

  it("preserva totais maiores que a precisão inteira segura de Number", () => {
    const rows = Array.from({ length: 100 }, (_, index) => ({ ...june[0], sourceRowKey: `large-${index}`, production: "999999999999.99" }));
    expect(calculateKpis(rows)).toMatchObject({ totalProduction: "99999999999999.00", averageProduction: "999999999999.99" });
  });

  it("arredonda empates somente na saída, para longe de zero", () => {
    expect(calculateKpis([{ ...june[0], production: "0.01" }, { ...june[1], production: "0.00" }])).toMatchObject({ averageProduction: "0.01", averageProductionExact: { numerator: "1", denominator: "200" } });
    expect(calculateKpis([{ ...june[0], production: "-0.01" }, { ...june[1], production: "0.00" }]).averageProduction).toBe("-0.01");
    expect(calculateKpis([{ ...june[0], production: "-0.01" }, { ...june[1], production: "0" }, { ...june[2], production: "0" }]).averageProduction).toBe("0.00");
  });

  it("distingue homônimos por ID e agrupa nomes normalizados sem ID", () => {
    expect(calculateKpis([{ ...june[0], technicianId: "a" }, { ...june[0], technicianId: "b" }]).technicians).toBe(2);
    expect(calculateKpis([june[0], { ...june[0], technician: " tec-01 " }]).technicians).toBe(1);
  });

  it("base vazia tem total zero e média indisponível, sem NaN/Infinity", () => {
    expect(calculateKpis([])).toEqual({ technicians: 0, rowCount: 0, totalProduction: "0.00", averageProduction: null, averageProductionExact: null, warnings: [] });
  });

  it.each([100.25, "1.234,50", "1e3", "0.001", "1000000000000.00", "NaN", ""])("rejeita produção não normalizada ou fora de Decimal(14,2): %s", (production) => {
    expect(() => calculateKpis([{ ...june[0], production }])).toThrow();
  });
});

describe("Performance mensal e evolução", () => {
  it("calcula taxas exatas e evolução em pontos percentuais", () => {
    const monthly = calculateMonthlyPerformance(baseline);
    expect(monthly.series).toMatchObject([
      { month: "2026-06", technicians: 7, goalsMet: 3, rate: "42.86", rateExact: { numerator: "300", denominator: "7" } },
      { month: "2026-07", technicians: 8, goalsMet: 3, rate: "37.50", rateExact: { numerator: "75", denominator: "2" } },
    ]);
    expect(calculateEvolution(baseline).evolution).toMatchObject({ previousMonth: "2026-06", currentMonth: "2026-07", previousPercent: "42.86", currentPercent: "37.50", differencePercentagePoints: "-5.36", exactDifference: { numerator: "-75", denominator: "14" }, direction: "negative" });
  });

  it("não subtrai taxas arredondadas: 1/6 para 1/3 resulta 16,67, não 16,66", () => {
    const previous = Array.from({ length: 6 }, (_, index) => ({ ...june[0], technician: `Exemplo ${index}`, sourceRowKey: `p-${index}`, goalMet: index === 0 }));
    const current = previous.slice(0, 3).map((row) => ({ ...row, month: "2026-07" }));
    expect(calculateEvolution([...previous, ...current]).evolution).toMatchObject({ previousPercent: "16.67", currentPercent: "33.33", differencePercentagePoints: "16.67", exactDifference: { numerator: "50", denominator: "3" } });
  });

  it("identifica evolução positiva, zero e base anterior de taxa zero", () => {
    expect(calculateEvolution(positiveEvolution).evolution).toMatchObject({ differencePercentagePoints: "10.00", direction: "positive" });
    expect(calculateEvolution([...june, ...june.map((row) => ({ ...row, month: "2026-07" }))]).evolution).toMatchObject({ differencePercentagePoints: "0.00", direction: "neutral" });
    expect(calculateEvolution([...june.map((row) => ({ ...row, goalMet: false })), ...july]).evolution).toMatchObject({ differencePercentagePoints: "37.50", direction: "positive" });
  });

  it("ordena cronologicamente e seleciona os dois últimos meses com dados", () => {
    expect(calculateEvolution(differentYears).evolution).toMatchObject({ previousMonth: "2025-01", currentMonth: "2026-01", differencePercentagePoints: "-100.00" });
    const recent = june.map((row) => ({ ...row, month: "2026-09", goalMet: true }));
    const rows = [...recent, ...june, ...july].reverse();
    const before = JSON.stringify(rows);
    expect(calculateEvolution(rows).evolution).toMatchObject({ previousMonth: "2026-07", currentMonth: "2026-09", differencePercentagePoints: "62.50" });
    expect(JSON.stringify(rows)).toBe(before);
  });

  it("deduplica metas e informa cobertura de indeterminados sem excluir denominador", () => {
    expect(calculateMonthlyPerformance(duplicateTrue).series[0]).toMatchObject({ technicians: 7, goalsMet: 3, rate: "42.86" });
    const allUnknown = calculateMonthlyPerformance(unknownGoals);
    expect(allUnknown.series[0]).toMatchObject({ technicians: 7, goalsMet: 0, unknownGoals: 7, rate: "0.00", coverage: "0.00" });
    expect(allUnknown.warnings.filter((warning) => warning.code === "UNKNOWN_GOAL")).toHaveLength(7);
    const partial = calculateMonthlyPerformance([...june.slice(0, 6), { ...june[6], goalMet: null }]);
    expect(partial.series[0]).toMatchObject({ technicians: 7, unknownGoals: 1, rate: "42.86", coverage: "85.71" });
  });

  it("menos de dois meses deixa evolução indisponível", () => {
    expect(calculateEvolution([])).toEqual({ evolution: null, warnings: [] });
    expect(calculateEvolution(june).evolution).toBeNull();
    expect(calculateMonthlyPerformance([])).toEqual({ series: [], warnings: [] });
  });

  it("retorna valores serializáveis sem expor chaves de identificação", () => {
    expect(() => JSON.stringify(calculateKpis(baseline))).not.toThrow();
    expect(() => JSON.stringify(calculateEvolution(baseline))).not.toThrow();
    expect(JSON.stringify(calculateMonthlyPerformance(baseline))).not.toContain("TEC-01");
  });
});
