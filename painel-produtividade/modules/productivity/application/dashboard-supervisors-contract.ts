import { z } from "zod";
import type { calculateSupervisorPerformance } from "../domain/supervisor-performance";
import { createRatio, toFixedDecimal } from "../domain/exact-ratio";

const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const percentage = z.number().finite().min(0).max(100).refine((value) => Number(value.toFixed(2)) === value);
const point = z.object({
  supervisorId: z.uuid(), supervisor: z.string().trim().min(1),
  technicianMonths: count.positive(), goalsMet: count, unknownGoals: count,
  rate: percentage, coverage: percentage,
}).strict().superRefine((value, context) => {
  if (value.technicianMonths <= 0 || !Number.isSafeInteger(value.technicianMonths) || !Number.isSafeInteger(value.goalsMet) || !Number.isSafeInteger(value.unknownGoals)) return;
  if (value.goalsMet + value.unknownGoals > value.technicianMonths) {
    context.addIssue({ code: "custom", message: "Contagens de supervisão inconsistentes." });
    return;
  }
  const rate = createRatio(BigInt(value.goalsMet) * BigInt(100), BigInt(value.technicianMonths))!;
  const coverage = createRatio(BigInt(value.technicianMonths - value.unknownGoals) * BigInt(100), BigInt(value.technicianMonths))!;
  if (value.rate !== Number(toFixedDecimal(rate)) || value.coverage !== Number(toFixedDecimal(coverage))) context.addIssue({ code: "custom", message: "Taxa de supervisão inconsistente com as contagens." });
});

export const dashboardSupervisorsSchema = z.object({
  series: z.array(point).superRefine((series, context) => {
    const ids = new Set<string>();
    series.forEach((item, index) => {
      if (ids.has(item.supervisorId)) context.addIssue({ code: "custom", message: "Supervisor duplicado." });
      ids.add(item.supervisorId);
      const previous = series[index - 1];
      if (!previous || ![previous.goalsMet, previous.technicianMonths, item.goalsMet, item.technicianMonths].every(Number.isSafeInteger)) return;
      const difference = BigInt(previous.goalsMet) * BigInt(item.technicianMonths) - BigInt(item.goalsMet) * BigInt(previous.technicianMonths);
      const alphabetical = previous.supervisor.localeCompare(item.supervisor, "pt-BR") || previous.supervisorId.localeCompare(item.supervisorId);
      if (difference < BigInt(0) || (difference === BigInt(0) && alphabetical > 0)) context.addIssue({ code: "custom", message: "Ordenação de supervisão inconsistente." });
    });
  }),
  quality: z.object({ warnings: z.array(z.object({
    code: z.enum(["NAME_BASED_IDENTITY", "CONFLICTING_GOALS", "UNKNOWN_GOAL", "MULTIPLE_SCOPES", "HOMONYM", "MIXED_IDENTIFICATION"]),
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/), rowCount: count.positive(),
  }).strict()) }).strict(),
}).strict();

export type DashboardSupervisors = z.infer<typeof dashboardSupervisorsSchema>;

/** Projeção única: não recalcula agregados nem envia linhas de técnicos. */
export function buildDashboardSupervisors(source: ReturnType<typeof calculateSupervisorPerformance>): DashboardSupervisors {
  return dashboardSupervisorsSchema.parse({
    series: source.series.map(({ supervisorId, supervisor, technicianMonths, goalsMet, unknownGoals, rate, coverage }) => ({ supervisorId, supervisor, technicianMonths, goalsMet, unknownGoals, rate: Number(rate), coverage: Number(coverage) })),
    quality: { warnings: source.warnings },
  });
}
