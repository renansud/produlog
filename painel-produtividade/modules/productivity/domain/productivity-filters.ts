import { z } from "zod";
import { productionRecordSchema } from "./productivity-metrics";

const months = z.array(z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)).max(120);
const ids = (limit: number) => z.array(z.uuid()).max(limit);

export const productivityFiltersSchema = z.object({
  months: months.default([]).transform((values) => [...new Set(values)].sort()),
  operations: ids(200).default([]).transform((values) => [...new Set(values)].sort()),
  supervisors: ids(500).default([]).transform((values) => [...new Set(values)].sort()),
}).strict();

export const scopedProductivityRowSchema = productionRecordSchema.extend({
  operationId: z.uuid(),
  supervisorId: z.uuid(),
  contract: z.string().min(1),
});

export type ScopedProductivityRow = z.infer<typeof scopedProductivityRowSchema>;
type DimensionOption = { id: string; label: string };

function options(rows: readonly ScopedProductivityRow[], kind: "operation" | "supervisor"): DimensionOption[] {
  const labels = new Map<string, string>();
  for (const row of rows) {
    const id = kind === "operation" ? row.operationId : row.supervisorId;
    const label = kind === "operation" ? row.operation : row.supervisor;
    const previous = labels.get(id);
    if (previous === undefined || label < previous) labels.set(id, label);
  }
  return [...labels].map(([id, label]) => ({ id, label })).sort((a, b) => a.label.localeCompare(b.label, "pt-BR") || a.id.localeCompare(b.id));
}

/** Função pura; o chamador deve restringir os registros ao escopo autorizado antes. */
export function selectProductivityRows(records: readonly unknown[], input: unknown) {
  const filters = productivityFiltersSchema.parse(input);
  const rows = z.array(scopedProductivityRowSchema).parse(records);
  const selectedOperations = new Set(filters.operations);
  const operationRows = rows.filter((row) => selectedOperations.size === 0 || selectedOperations.has(row.operationId));
  const supervisorMembership = new Map<string, Set<string>>();
  for (const row of rows) {
    const memberships = supervisorMembership.get(row.supervisorId) ?? new Set<string>();
    memberships.add(row.operationId);
    supervisorMembership.set(row.supervisorId, memberships);
  }
  const supervisorOptions = options(operationRows, "supervisor").map((option) => ({
    ...option, operationIds: [...supervisorMembership.get(option.id)!].sort(),
  }));
  const validSupervisors = new Set(supervisorOptions.map((option) => option.id));
  const effectiveSupervisors = filters.supervisors.filter((id) => validSupervisors.has(id));
  const selectedSupervisors = new Set(effectiveSupervisors);
  const timelineRows = operationRows.filter((row) => selectedSupervisors.size === 0 || selectedSupervisors.has(row.supervisorId));
  const selectedMonths = new Set(filters.months);
  const filteredRows = timelineRows.filter((row) => selectedMonths.size === 0 || selectedMonths.has(row.month));

  return {
    filteredRows,
    timelineRows,
    filters: { ...filters, supervisors: effectiveSupervisors },
    discardedSupervisorIds: filters.supervisors.filter((id) => !validSupervisors.has(id)),
    options: {
      months: [...new Set(timelineRows.map((row) => row.month))].sort(),
      operations: options(rows, "operation"),
      supervisors: supervisorOptions,
    },
  };
}
