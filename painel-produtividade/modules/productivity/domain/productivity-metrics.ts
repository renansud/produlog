import { z } from "zod";
import { deduplicateGoals, goalRecordSchema } from "./goal-deduplication";
import { createRatio, subtractRatios, toFixedDecimal, type ExactRatio } from "./exact-ratio";

const hundred = BigInt(100);
const zero = BigInt(0);

export const productionRecordSchema = goalRecordSchema.extend({
  production: z.string().regex(/^-?\d{1,12}(?:\.\d{1,2})?$/),
});

export function productionCents(value: string): bigint {
  const negative = value.startsWith("-");
  const [integer, fraction = ""] = value.replace(/^-/, "").split(".");
  const cents = BigInt(integer) * hundred + BigInt(fraction.padEnd(2, "0"));
  return negative ? -cents : cents;
}

/** Cards de técnicos e produção: receber linhas autorizadas com todos os filtros. */
export function calculateKpis(records: readonly unknown[]) {
  const rows = z.array(productionRecordSchema).parse(records);
  const { groups, warnings } = deduplicateGoals(rows, "technician-month");
  const totalCents = rows.reduce((sum, row) => sum + productionCents(row.production), zero);
  const averageProductionExact = createRatio(totalCents, BigInt(rows.length) * hundred);
  return {
    technicians: new Set(groups.map((group) => group.technicianKey)).size,
    rowCount: rows.length,
    // Denominador constante positivo; o total nunca é indisponível.
    totalProduction: toFixedDecimal(createRatio(totalCents, hundred)!),
    averageProduction: averageProductionExact ? toFixedDecimal(averageProductionExact) : null,
    averageProductionExact,
    warnings,
  };
}

export type MonthlyPerformance = {
  month: string;
  technicians: number;
  goalsMet: number;
  unknownGoals: number;
  rate: string;
  rateExact: ExactRatio;
  coverage: string;
};

/** Histórico já autorizado por operação/supervisor, sem aplicar filtro Mês. */
export function calculateMonthlyPerformance(records: readonly unknown[]) {
  const { groups, warnings } = deduplicateGoals(records, "technician-month");
  const months = new Map<string, { technicians: number; goalsMet: number; unknownGoals: number }>();
  for (const group of groups) {
    const month = months.get(group.month) ?? { technicians: 0, goalsMet: 0, unknownGoals: 0 };
    month.technicians += 1;
    if (group.goalMet === true) month.goalsMet += 1;
    if (group.goalMet === null) month.unknownGoals += 1;
    months.set(group.month, month);
  }
  const series: MonthlyPerformance[] = [...months.entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([month, counts]) => {
    // Somente meses com pelo menos um grupo são inseridos no mapa.
    const denominator = BigInt(counts.technicians);
    const rateExact = createRatio(BigInt(counts.goalsMet) * hundred, denominator)!;
    const coverageExact = createRatio(BigInt(counts.technicians - counts.unknownGoals) * hundred, denominator)!;
    return { month, ...counts, rate: toFixedDecimal(rateExact), rateExact, coverage: toFixedDecimal(coverageExact) };
  });
  return { series, warnings };
}

export type Evolution = {
  previousMonth: string;
  currentMonth: string;
  previousPercent: string;
  currentPercent: string;
  differencePercentagePoints: string;
  exactDifference: ExactRatio;
  direction: "positive" | "negative" | "neutral";
};

/** Diferença absoluta em p.p.; nunca variação relativa ou subtração das taxas exibidas. */
export function calculateEvolution(records: readonly unknown[]): { evolution: Evolution | null; warnings: ReturnType<typeof deduplicateGoals>["warnings"] } {
  const { series, warnings } = calculateMonthlyPerformance(records);
  const previous = series.at(-2);
  const current = series.at(-1);
  if (!previous || !current) return { evolution: null, warnings };
  const exactDifference = subtractRatios(current.rateExact, previous.rateExact);
  if (!exactDifference) return { evolution: null, warnings };
  const difference = BigInt(exactDifference.numerator);
  return {
    evolution: {
      previousMonth: previous.month,
      currentMonth: current.month,
      previousPercent: previous.rate,
      currentPercent: current.rate,
      differencePercentagePoints: toFixedDecimal(exactDifference),
      exactDifference,
      direction: difference > zero ? "positive" : difference < zero ? "negative" : "neutral",
    },
    warnings,
  };
}
