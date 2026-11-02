import { z } from "zod";
import type { readProductivityDashboard } from "./read-productivity-dashboard";
import { toFixedDecimal } from "../domain/exact-ratio";

const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const decimal = z.string().regex(/^-?\d+\.\d{2}$/);
const integer = z.string().max(128).regex(/^-?\d+$/);
const percentage = z.number().finite().min(0).max(100).refine((value) => Number(value.toFixed(2)) === value);
const difference = z.number().finite().min(-100).max(100).refine((value) => Number(value.toFixed(2)) === value);
const warning = z.object({
  code: z.enum(["NAME_BASED_IDENTITY", "CONFLICTING_GOALS", "UNKNOWN_GOAL", "MULTIPLE_SCOPES", "HOMONYM", "MIXED_IDENTIFICATION"]),
  month,
  rowCount: z.number().int().positive(),
}).strict();

export const dashboardSummarySchema = z.object({
  technicians: z.number().int().nonnegative(),
  rowCount: z.number().int().nonnegative(),
  totalProduction: decimal,
  averageProduction: decimal.nullable(),
  evolution: z.object({
    previousMonth: month,
    currentMonth: month,
    previousPercent: percentage,
    currentPercent: percentage,
    differencePercentagePoints: difference,
    exactDifference: z.object({ numerator: integer, denominator: z.string().max(128).regex(/^[1-9]\d*$/) }).strict(),
    direction: z.enum(["positive", "negative", "neutral"]),
  }).strict().refine((value) => value.previousMonth < value.currentMonth).nullable(),
  quality: z.object({ warnings: z.array(warning), evolutionWarnings: z.array(warning) }).strict(),
}).strict().superRefine((value, context) => {
  if (value.technicians > value.rowCount || (value.rowCount === 0) !== (value.averageProduction === null)) {
    context.addIssue({ code: "custom", message: "Contagens e disponibilidade inconsistentes." });
  }
  if (value.rowCount === 0 && value.totalProduction !== "0.00") {
    context.addIssue({ code: "custom", message: "Total sem registros inconsistente." });
  }
  if (value.evolution) {
    const exact = value.evolution.exactDifference;
    // Refinamentos estruturais já reportam o erro; não executar aritmética em texto inválido.
    if (exact.numerator.length > 128 || exact.denominator.length > 128 || !/^-?\d+$/.test(exact.numerator) || !/^[1-9]\d*$/.test(exact.denominator)) return;
    const numerator = BigInt(value.evolution.exactDifference.numerator);
    const direction = numerator > BigInt(0) ? "positive" : numerator < BigInt(0) ? "negative" : "neutral";
    if (value.evolution.direction !== direction || Number(toFixedDecimal(value.evolution.exactDifference)) !== value.evolution.differencePercentagePoints) {
      context.addIssue({ code: "custom", message: "Evolução inconsistente com sua razão exata." });
    }
  }
});

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;

/** Projeção única compartilhada pelos endpoints e pela apresentação Server Component. */
export function buildDashboardSummary(source: Awaited<ReturnType<typeof readProductivityDashboard>>["summary"]): DashboardSummary {
  const { technicians, rowCount, averageProduction, totalProduction, evolution, warnings, evolutionWarnings } = source;
  return dashboardSummarySchema.parse({
    technicians, rowCount, averageProduction, totalProduction,
    evolution: evolution ? {
      previousMonth: evolution.previousMonth, currentMonth: evolution.currentMonth,
      previousPercent: Number(evolution.previousPercent), currentPercent: Number(evolution.currentPercent),
      differencePercentagePoints: Number(evolution.differencePercentagePoints),
      exactDifference: evolution.exactDifference, direction: evolution.direction,
    } : null,
    quality: { warnings, evolutionWarnings },
  });
}
