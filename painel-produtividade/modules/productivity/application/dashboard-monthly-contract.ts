import { z } from "zod";
import type { calculateMonthlyPerformance } from "../domain/productivity-metrics";
import { createRatio, toFixedDecimal } from "../domain/exact-ratio";

const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const percentage = z.number().finite().min(0).max(100).refine((value) => Number(value.toFixed(2)) === value);
const point = z.object({
  month, technicians: count.positive(), goalsMet: count, unknownGoals: count,
  rate: percentage, coverage: percentage,
  rateExact: z.object({ numerator: z.string().max(128).regex(/^\d+$/), denominator: z.string().max(128).regex(/^[1-9]\d*$/) }).strict(),
}).strict().superRefine((value, context) => {
  if (value.technicians <= 0 || !Number.isSafeInteger(value.technicians) || !Number.isSafeInteger(value.goalsMet) || !Number.isSafeInteger(value.unknownGoals)) return;
  if (value.goalsMet + value.unknownGoals > value.technicians) {
    context.addIssue({ code: "custom", message: "Contagens mensais inconsistentes." });
    return;
  }
  const rate = createRatio(BigInt(value.goalsMet) * BigInt(100), BigInt(value.technicians))!;
  const coverage = createRatio(BigInt(value.technicians - value.unknownGoals) * BigInt(100), BigInt(value.technicians))!;
  if (value.rate !== Number(toFixedDecimal(rate)) || value.coverage !== Number(toFixedDecimal(coverage)) || value.rateExact.numerator !== rate.numerator || value.rateExact.denominator !== rate.denominator) {
    context.addIssue({ code: "custom", message: "Taxa mensal inconsistente com as contagens." });
  }
});

export const dashboardMonthlySchema = z.object({
  series: z.array(point).refine((series) => series.every((item, index) => index === 0 || series[index - 1].month < item.month), "Competências devem ser únicas e cronológicas."),
  quality: z.object({ warnings: z.array(z.object({
    code: z.enum(["NAME_BASED_IDENTITY", "CONFLICTING_GOALS", "UNKNOWN_GOAL", "MULTIPLE_SCOPES", "HOMONYM", "MIXED_IDENTIFICATION"]),
    month, rowCount: count.positive(),
  }).strict()) }).strict(),
}).strict();

export type DashboardMonthly = z.infer<typeof dashboardMonthlySchema>;

/** Mesmo DTO para API e página; somente agregados autorizados atravessam a fronteira cliente. */
export function buildDashboardMonthly(source: ReturnType<typeof calculateMonthlyPerformance>): DashboardMonthly {
  return dashboardMonthlySchema.parse({
    series: source.series.map(({ month, technicians, goalsMet, unknownGoals, rate, rateExact, coverage }) => ({ month, technicians, goalsMet, unknownGoals, rate: Number(rate), rateExact, coverage: Number(coverage) })),
    quality: { warnings: source.warnings },
  });
}
