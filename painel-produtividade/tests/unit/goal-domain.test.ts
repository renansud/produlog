import { describe, expect, it } from "vitest";
import { normalizeGoalMet } from "@/modules/productivity/domain/goal-normalization";
import { deduplicateGoals } from "@/modules/productivity/domain/goal-deduplication";
import { baseline, conflictingGoals, crossScopeTechnician, differentYears, duplicateTrue, june, unknownGoals } from "../fixtures/productivity";

describe("Normalização de META BATIDA", () => {
  it.each([true, 1, "SIM", "S", "TRUE", "VERDADEIRO", "1", "YES", "Y", "OK", "ATINGIU", "ATINGIDO", "BATIDA", "META BATIDA", "  méta   batida  "])("reconhece %s como true", (value) => {
    expect(normalizeGoalMet(value)).toEqual({ ok: true, value: true });
  });
  it.each([false, 0, "NÃO", "NAO", "N", "FALSE", "FALSO", "0", "NO", "NAO ATINGIU", "NAO BATIDA", " não   atingiu "])("reconhece %s como false", (value) => {
    expect(normalizeGoalMet(value)).toEqual({ ok: true, value: false });
  });
  it.each([null, undefined, "", " \t "])("preserva vazio %s como indeterminado", (value) => {
    expect(normalizeGoalMet(value)).toEqual({ ok: true, value: null });
  });
  it.each(["TALVEZ", "2", 2, -1, NaN, {}, [], "=1+1"])("rejeita valor desconhecido sem convertê-lo em false: %s", (value) => {
    expect(normalizeGoalMet(value)).toEqual({ ok: false, code: "UNKNOWN_GOAL_VALUE" });
  });
});

describe("Deduplicação de metas", () => {
  it("preserva 7 e 8 técnicos-mês com 3 conquistas em cada competência", () => {
    const { groups } = deduplicateGoals(baseline, "technician-month");
    expect(groups).toHaveLength(15);
    for (const [month, count] of [["2026-06", 7], ["2026-07", 8]] as const) {
      const monthly = groups.filter((group) => group.month === month);
      expect(monthly).toHaveLength(count);
      expect(monthly.filter((group) => group.goalMet)).toHaveLength(3);
    }
  });

  it("deduplica metas sem remover as linhas de origem", () => {
    const before = JSON.stringify(duplicateTrue);
    const { groups } = deduplicateGoals(duplicateTrue, "technician-month");
    expect(groups).toHaveLength(7);
    expect(groups.filter((group) => group.goalMet)).toHaveLength(3);
    expect(groups.flatMap((group) => group.sourceRowKeys)).toHaveLength(8);
    expect(JSON.stringify(duplicateTrue)).toBe(before);
  });

  it("true vence false e o conflito continua visível", () => {
    const { groups, warnings } = deduplicateGoals(conflictingGoals, "technician-month");
    const conflict = groups.find((group) => group.sourceRowKeys.includes("conflicting-goals"));
    expect(conflict).toMatchObject({ goalMet: true, hasConflict: true });
    expect(warnings).toContainEqual({ code: "CONFLICTING_GOALS", month: "2026-06", rowCount: 2 });
  });

  it("false com null permanece false; apenas null permanece indeterminado", () => {
    const rows = [{ ...june[0], goalMet: false }, { ...june[0], sourceRowKey: "null-row", goalMet: null }];
    expect(deduplicateGoals(rows, "technician-month").groups[0]).toMatchObject({ goalMet: false, hasConflict: false });
    const result = deduplicateGoals(unknownGoals, "technician-month");
    expect(result.groups).toHaveLength(7);
    expect(result.groups.every((group) => group.goalMet === null)).toBe(true);
    expect(result.warnings.filter((warning) => warning.code === "UNKNOWN_GOAL")).toHaveLength(7);
  });

  it("conta técnico-mês uma vez globalmente e uma vez por supervisor na supervisão", () => {
    const monthly = deduplicateGoals(crossScopeTechnician, "technician-month");
    const supervision = deduplicateGoals(crossScopeTechnician, "supervisor-technician-month");
    expect(monthly.groups).toHaveLength(1);
    expect(supervision.groups).toHaveLength(2);
    expect(monthly.warnings).toContainEqual({ code: "MULTIPLE_SCOPES", month: "2026-06", rowCount: 2 });
    expect(supervision.warnings).toContainEqual({ code: "MULTIPLE_SCOPES", month: "2026-06", rowCount: 2 });
  });

  it("normaliza caixa, acentos e espaços no fallback por nome", () => {
    const rows = [
      { ...june[0], technician: "  Técnico   Exemplo ", supervisor: " Supervisão A " },
      { ...june[0], sourceRowKey: "name-variant", technician: "tecnico exemplo", supervisor: "supervisao a" },
    ];
    const result = deduplicateGoals(rows, "supervisor-technician-month");
    expect(result.groups).toHaveLength(1);
    expect(result.warnings.some((warning) => warning.code === "NAME_BASED_IDENTITY")).toBe(true);
  });

  it("IDs estáveis distinguem homônimos e reúnem variações de nome", () => {
    const rows = [
      { ...june[0], technicianId: "tech-a" },
      { ...june[0], sourceRowKey: "homonym", technicianId: "tech-b" },
      { ...june[0], sourceRowKey: "renamed", technicianId: "tech-a", technician: "Outro rótulo" },
    ];
    const result = deduplicateGoals(rows, "technician-month");
    expect(result.groups).toHaveLength(2);
    expect(result.groups.map((group) => group.sourceRowKeys.length).sort()).toEqual([1, 2]);
    expect(result.warnings.some((warning) => warning.code === "HOMONYM")).toBe(true);
  });

  it("não associa automaticamente nome sem ID a registro com ID", () => {
    const result = deduplicateGoals([june[0], { ...june[0], sourceRowKey: "with-id", technicianId: "tech-a" }], "technician-month");
    expect(result.groups).toHaveLength(2);
    expect(result.warnings.some((warning) => warning.code === "MIXED_IDENTIFICATION")).toBe(true);
  });

  it("usa ID do supervisor e evita colisões em chaves compostas", () => {
    const rows = [
      { ...june[0], technicianId: "a|b", supervisorId: "c" },
      { ...june[0], sourceRowKey: "separator", technicianId: "a", supervisorId: "b|c" },
    ];
    expect(deduplicateGoals(rows, "supervisor-technician-month").groups).toHaveLength(2);
    const renamed = [{ ...june[0], supervisorId: "s-a" }, { ...june[0], sourceRowKey: "supervisor-rename", supervisorId: "s-a", supervisor: "Outro nome" }];
    expect(deduplicateGoals(renamed, "supervisor-technician-month").groups).toHaveLength(1);
  });

  it("separa anos e produz saída estável independentemente da ordem", () => {
    expect(deduplicateGoals(differentYears, "technician-month").groups).toHaveLength(2);
    expect(deduplicateGoals([...conflictingGoals].reverse(), "technician-month")).toEqual(deduplicateGoals(conflictingGoals, "technician-month"));
    expect(deduplicateGoals([], "technician-month")).toEqual({ groups: [], warnings: [] });
  });

  it("rejeita parâmetros inválidos e não inclui nomes nos avisos", () => {
    for (const invalid of [{ month: "Jun" }, { month: "2026-13" }, { technician: " " }, { goalMet: "SIM" }, { technicianId: " " }]) {
      expect(() => deduplicateGoals([{ ...june[0], ...invalid }], "technician-month")).toThrow();
    }
    const privateLabel = "Pessoa fictícia privada";
    const result = deduplicateGoals([{ ...june[0], technician: privateLabel }], "technician-month");
    expect(JSON.stringify(result.warnings)).not.toContain(privateLabel);
    expect(() => deduplicateGoals(june, "invalid" as "technician-month")).toThrow();
  });
});
