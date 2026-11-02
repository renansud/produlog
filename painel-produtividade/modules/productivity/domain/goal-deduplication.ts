import { z } from "zod";
import { normalizeIdentityName, type GoalValue } from "./goal-normalization";

const identity = z.string().trim().min(1);
export const goalRecordSchema = z.object({
  sourceRowKey: identity,
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  technician: identity,
  technicianId: identity.optional(),
  supervisor: identity,
  supervisorId: identity.optional(),
  operation: identity,
  operationId: identity.optional(),
  goalMet: z.boolean().nullable(),
});

export type GoalRecord = z.infer<typeof goalRecordSchema>;
const goalUnitSchema = z.enum(["technician-month", "supervisor-technician-month"]);
export type GoalUnit = z.infer<typeof goalUnitSchema>;
export type GoalWarningCode = "NAME_BASED_IDENTITY" | "CONFLICTING_GOALS" | "UNKNOWN_GOAL" | "MULTIPLE_SCOPES" | "HOMONYM" | "MIXED_IDENTIFICATION";
export type GoalWarning = { code: GoalWarningCode; month: string; rowCount: number };
export type DeduplicatedGoal = {
  month: string;
  technicianKey: string;
  supervisorKey: string | null;
  goalMet: GoalValue;
  hasConflict: boolean;
  sourceRowKeys: string[];
};

function identityKey(name: string, id?: string): string {
  return JSON.stringify(id === undefined ? ["name", normalizeIdentityName(name)] : ["id", id]);
}

function technicianKey(row: GoalRecord): string {
  return identityKey(row.technician, row.technicianId);
}

function supervisorKey(row: GoalRecord): string {
  return identityKey(row.supervisor, row.supervisorId);
}

function bucketRows(rows: readonly GoalRecord[], key: (row: GoalRecord) => string): Map<string, GoalRecord[]> {
  const buckets = new Map<string, GoalRecord[]>();
  for (const row of rows) {
    const value = key(row);
    const bucket = buckets.get(value);
    if (bucket) bucket.push(row);
    else buckets.set(value, [row]);
  }
  return buckets;
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Recebe linhas já autorizadas pelo chamador; não aplica RBAC nem filtros. */
export function deduplicateGoals(records: readonly unknown[], unit: GoalUnit): { groups: DeduplicatedGoal[]; warnings: GoalWarning[] } {
  const mode = goalUnitSchema.parse(unit);
  const rows = z.array(goalRecordSchema).parse(records);
  const warnings: GoalWarning[] = [];

  // Diagnósticos independem da unidade do gráfico e nunca incluem nomes ou IDs.
  const technicianMonths = bucketRows(rows, (row) => JSON.stringify([row.month, technicianKey(row)]));
  for (const bucket of technicianMonths.values()) {
    const first = bucket[0];
    if (first.technicianId === undefined) warnings.push({ code: "NAME_BASED_IDENTITY", month: first.month, rowCount: bucket.length });
    const scopes = new Set(bucket.map((row) => JSON.stringify([identityKey(row.operation, row.operationId), supervisorKey(row)])));
    if (scopes.size > 1) warnings.push({ code: "MULTIPLE_SCOPES", month: first.month, rowCount: bucket.length });
  }

  const namesByMonth = bucketRows(rows, (row) => JSON.stringify([row.month, normalizeIdentityName(row.technician)]));
  for (const bucket of namesByMonth.values()) {
    if (new Set(bucket.map(technicianKey)).size > 1) {
      warnings.push({
        code: bucket.some((row) => row.technicianId === undefined) ? "MIXED_IDENTIFICATION" : "HOMONYM",
        month: bucket[0].month,
        rowCount: bucket.length,
      });
    }
  }

  const buckets = bucketRows(rows, (row) => JSON.stringify([row.month, technicianKey(row), mode === "technician-month" ? null : supervisorKey(row)]));
  const groups = [...buckets.entries()].sort(([a], [b]) => compare(a, b)).map(([, bucket]): DeduplicatedGoal => {
    const first = bucket[0];
    const hasTrue = bucket.some((row) => row.goalMet === true);
    const hasFalse = bucket.some((row) => row.goalMet === false);
    const goalMet = hasTrue ? true : hasFalse ? false : null;
    const hasConflict = hasTrue && hasFalse;
    if (hasConflict) warnings.push({ code: "CONFLICTING_GOALS", month: first.month, rowCount: bucket.length });
    if (goalMet === null) warnings.push({ code: "UNKNOWN_GOAL", month: first.month, rowCount: bucket.length });
    return {
      month: first.month,
      technicianKey: technicianKey(first),
      supervisorKey: mode === "technician-month" ? null : supervisorKey(first),
      goalMet,
      hasConflict,
      sourceRowKeys: bucket.map((row) => row.sourceRowKey).sort(),
    };
  });
  warnings.sort((a, b) => compare(JSON.stringify(a), JSON.stringify(b)));
  return { groups, warnings };
}
