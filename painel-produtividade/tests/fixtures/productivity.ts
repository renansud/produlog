import { z } from "zod";

// Todos os identificadores, rótulos e anos abaixo são sintéticos.
export const fixtureRowSchema = z.object({
  sourceRowKey: z.string().min(1),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  technician: z.string().regex(/^TEC-\d{2}$/),
  operation: z.enum(["Operação Exemplo A", "Operação Exemplo B"]),
  supervisor: z.enum(["Equipe Exemplo A", "Equipe Exemplo B"]),
  contract: z.string().min(1),
  production: z.string().regex(/^-?\d+\.\d{2}$/),
  goalMet: z.boolean().nullable(),
}).strict();

export type FixtureRow = z.infer<typeof fixtureRowSchema>;

function monthRows(month: string, count: number, goals: readonly number[]): FixtureRow[] {
  return Array.from({ length: count }, (_, index) => {
    const ordinal = index + 1;
    const suffix = String(ordinal).padStart(2, "0");
    return {
      sourceRowKey: `${month}-${suffix}`,
      month,
      technician: `TEC-${suffix}`,
      operation: ordinal <= 4 ? "Operação Exemplo A" : "Operação Exemplo B",
      supervisor: ordinal <= 4 ? "Equipe Exemplo A" : "Equipe Exemplo B",
      contract: `000${suffix}`,
      production: "100.00",
      goalMet: goals.includes(ordinal),
    };
  });
}

export const june = monthRows("2026-06", 7, [1, 2, 5]);
export const july = monthRows("2026-07", 8, [1, 2, 5]);
export const baseline = [...june, ...july];

export const expectedBaseline = {
  june: { technicians: 7, goalsMet: 3, rateDisplay: "42,86%", production: "700.00" },
  july: { technicians: 8, goalsMet: 3, rateDisplay: "37,50%", production: "800.00" },
  evolution: { numerator: -75, denominator: 14, display: "-5,36%" },
  totalProduction: "1500.00",
  averageProduction: "100.00",
  technicians: 8,
} as const;

export const duplicateTrue = [...june, { ...june[0], sourceRowKey: "duplicate-true", contract: "00901", production: "25.50" }];
export const conflictingGoals = [...june, { ...june[0], sourceRowKey: "conflicting-goals", contract: "00902", production: "10.25", goalMet: false }];
export const unknownGoals = june.map((row) => ({ ...row, goalMet: null }));
export const empty: FixtureRow[] = [];
export const differentYears = [...monthRows("2025-01", 1, [1]), ...monthRows("2026-01", 1, [])];
export const positiveEvolution = [...monthRows("2026-06", 10, [1, 2, 3, 4]), ...monthRows("2026-07", 10, [1, 2, 3, 4, 5])];

export const filterCases = [
  { name: "Mês julho", months: ["2026-07"], operations: [], supervisors: [], tableRows: 8, monthlyMonths: ["2026-06", "2026-07"], evolutionDisplay: "-5,36%" },
  { name: "Operação A", months: [], operations: ["Operação Exemplo A"], supervisors: [], tableRows: 8, monthlyRates: ["50,00%", "50,00%"], evolutionDisplay: "0,00%" },
  { name: "Operação B", months: [], operations: ["Operação Exemplo B"], supervisors: [], tableRows: 7, monthlyRates: ["33,33%", "25,00%"], evolutionDisplay: "-8,33%" },
  { name: "Julho e equipe A", months: ["2026-07"], operations: ["Operação Exemplo A"], supervisors: ["Equipe Exemplo A"], tableRows: 4, monthlyRates: ["50,00%", "50,00%"], evolutionDisplay: "0,00%" },
] as const;

export const exportCase = {
  months: ["2026-07"], operations: ["Operação Exemplo A"], supervisors: ["Equipe Exemplo A"],
  search: "TEC-0", sort: "technician", direction: "desc", pageSize: 2,
  expectedRowKeys: ["2026-07-04", "2026-07-03", "2026-07-02", "2026-07-01"],
  expectedColumns: ["Mês", "Supervisor", "Técnico", "Contrato", "Produção", "Meta Batida"],
  separator: ";", bom: "\uFEFF",
} as const;

export const unsafeCsvTexts = ["=1+1", "+1+1", "-1+1", "@SUM(1)"];
export const numericNegativeProduction = "-10.25";
export const repeatedImport = { source: "snapshot-ficticio", first: baseline, second: baseline, expectedRowsAfterSecond: 15 };
// Cenário de qualidade: a decisão de identidade entre escopos permanece pendente.
export const crossScopeTechnician = [june[0], { ...june[0], sourceRowKey: "cross-scope", operation: "Operação Exemplo B" as const, supervisor: "Equipe Exemplo B" as const }];
export const rawImportCases = [
  { production: "1.234,50", goal: "SIM", expectedProduction: "1234.50", expectedGoal: true },
  { production: "0,00", goal: "NÃO", expectedProduction: "0.00", expectedGoal: false },
  { production: "100,00", goal: "", expectedProduction: "100.00", expectedGoal: null },
] as const;
export const invalidImportCases = [
  { field: "META BATIDA", value: "TALVEZ", expected: "rejeição ou quarentena; nunca false silencioso" },
  { field: "Mês", value: "Jun", expected: "exigir atribuição explícita de ano antes de importar" },
  { field: "Produção", value: "inválida", expected: "erro de validação" },
] as const;

export const accessCases = [
  { role: "USER", active: true, allowed: ["Operação Exemplo A"], requested: "Operação Exemplo B", expected: "403 ou interseção vazia" },
  { role: "USER", active: false, allowed: ["Operação Exemplo A"], requested: "Operação Exemplo A", expected: "acesso bloqueado" },
] as const;

export const fixtureSets = { baseline, duplicateTrue, conflictingGoals, unknownGoals, empty, differentYears, positiveEvolution, crossScopeTechnician };
