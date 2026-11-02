import { describe, expect, it } from "vitest";
import {
  baseline, conflictingGoals, differentYears, duplicateTrue, expectedBaseline,
  exportCase, fixtureRowSchema, fixtureSets, july, june, positiveEvolution, unknownGoals,
} from "../fixtures/productivity";

describe("Integridade dos dados sintéticos de paridade", () => {
  for (const [name, rows] of Object.entries(fixtureSets)) {
    it(`valida os campos e as chaves de origem do conjunto ${name}`, () => {
      expect(() => rows.forEach((row) => fixtureRowSchema.parse(row))).not.toThrow();
      expect(new Set(rows.map((row) => row.sourceRowKey)).size).toBe(rows.length);
    });
  }

  it("contém 3/7 em junho e 3/8 em julho, com evolução racional -75/14 p.p.", () => {
    expect(june).toHaveLength(expectedBaseline.june.technicians);
    expect(july).toHaveLength(expectedBaseline.july.technicians);
    expect(june.filter((row) => row.goalMet)).toHaveLength(3);
    expect(july.filter((row) => row.goalMet)).toHaveLength(3);
    expect(new Set(baseline.map((row) => row.technician)).size).toBe(8);
    // Oráculo dos dados, sem arredondar as taxas antes da subtração.
    const numerator = (3 * 7 - 3 * 8) * 100;
    const denominator = 8 * 7;
    expect(numerator * expectedBaseline.evolution.denominator).toBe(expectedBaseline.evolution.numerator * denominator);
    expect((numerator / denominator).toFixed(2)).toBe("-5.36");
  });

  it("mantém produção exata em centésimos e contratos com zeros iniciais", () => {
    const cents = baseline.reduce((sum, row) => sum + BigInt(row.production.replace(".", "")), BigInt(0));
    expect(cents).toBe(BigInt(150000));
    expect(cents / BigInt(baseline.length)).toBe(BigInt(10000));
    expect(baseline.every((row) => row.contract.startsWith("000"))).toBe(true);
  });

  it("preserva linhas duplicadas e conflitos explícitos no mesmo técnico-mês", () => {
    expect(duplicateTrue).toHaveLength(8);
    expect(new Set(duplicateTrue.map((row) => row.technician)).size).toBe(7);
    const flags = conflictingGoals.filter((row) => row.technician === "TEC-01").map((row) => row.goalMet);
    expect(flags).toEqual([true, false]);
    expect(unknownGoals.every((row) => row.goalMet === null)).toBe(true);
  });

  it("separa anos e oferece um caso positivo de 4/10 para 5/10", () => {
    expect(differentYears.map((row) => row.month)).toEqual(["2025-01", "2026-01"]);
    expect(positiveEvolution.filter((row) => row.month === "2026-06" && row.goalMet)).toHaveLength(4);
    expect(positiveEvolution.filter((row) => row.month === "2026-07" && row.goalMet)).toHaveLength(5);
  });

  it("rejeita fixtures normalizadas com mês, decimal ou meta inválidos", () => {
    for (const invalid of [{ month: "2026-13" }, { production: "1.234,50" }, { goalMet: "TALVEZ" }]) {
      expect(fixtureRowSchema.safeParse({ ...june[0], ...invalid }).success).toBe(false);
    }
  });

  it("oferece exportação com mais de uma página e todas as chaves esperadas", () => {
    expect(exportCase.expectedRowKeys.length).toBeGreaterThan(exportCase.pageSize);
    expect(exportCase.expectedRowKeys.every((key) => baseline.some((row) => row.sourceRowKey === key))).toBe(true);
    expect(exportCase.expectedColumns).toHaveLength(6);
  });
});
