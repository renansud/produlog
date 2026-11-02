import { z } from "zod";
import { deduplicateGoals } from "./goal-deduplication";
import { scopedProductivityRowSchema } from "./productivity-filters";
import { createRatio, toFixedDecimal } from "./exact-ratio";

export function calculateSupervisorPerformance(records: readonly unknown[]) {
  const rows = z.array(scopedProductivityRowSchema).parse(records);
  const metadata = new Map<string, { id: string; label: string }>();
  for (const row of rows) {
    const key = JSON.stringify(["id", row.supervisorId]);
    const previous = metadata.get(key);
    if (!previous || row.supervisor < previous.label) metadata.set(key, { id: row.supervisorId, label: row.supervisor });
  }
  const { groups, warnings } = deduplicateGoals(rows, "supervisor-technician-month");
  const counts = new Map<string, { technicianMonths: number; goalsMet: number; unknownGoals: number }>();
  for (const group of groups) {
    const key = group.supervisorKey!;
    const count = counts.get(key) ?? { technicianMonths: 0, goalsMet: 0, unknownGoals: 0 };
    count.technicianMonths += 1;
    if (group.goalMet === true) count.goalsMet += 1;
    if (group.goalMet === null) count.unknownGoals += 1;
    counts.set(key, count);
  }
  const series = [...counts].map(([key, count]) => ({
    supervisorId: metadata.get(key)!.id,
    supervisor: metadata.get(key)!.label,
    ...count,
    rate: toFixedDecimal(createRatio(BigInt(count.goalsMet) * BigInt(100), BigInt(count.technicianMonths))!),
    coverage: toFixedDecimal(createRatio(BigInt(count.technicianMonths - count.unknownGoals) * BigInt(100), BigInt(count.technicianMonths))!),
  })).sort((a, b) => {
    const difference = BigInt(b.goalsMet) * BigInt(a.technicianMonths) - BigInt(a.goalsMet) * BigInt(b.technicianMonths);
    return difference > BigInt(0) ? 1 : difference < BigInt(0) ? -1 : a.supervisor.localeCompare(b.supervisor, "pt-BR") || a.supervisorId.localeCompare(b.supervisorId);
  });
  return { series, warnings };
}
