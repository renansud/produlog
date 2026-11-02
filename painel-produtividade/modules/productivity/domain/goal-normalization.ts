export type GoalValue = boolean | null;
export type GoalNormalization =
  | { ok: true; value: GoalValue }
  | { ok: false; code: "UNKNOWN_GOAL_VALUE" };

export function normalizeIdentityName(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toUpperCase();
}

const trueValues = new Set(["SIM", "S", "TRUE", "VERDADEIRO", "1", "YES", "Y", "OK", "ATINGIU", "ATINGIDO", "BATIDA", "META BATIDA"]);
const falseValues = new Set(["NAO", "N", "FALSE", "FALSO", "0", "NO", "NAO ATINGIU", "NAO BATIDA"]);

export function normalizeGoalMet(input: unknown): GoalNormalization {
  if (input === null || input === undefined) return { ok: true, value: null };
  if (typeof input === "boolean") return { ok: true, value: input };
  if (input === 1) return { ok: true, value: true };
  if (input === 0) return { ok: true, value: false };
  if (typeof input === "string") {
    const token = normalizeIdentityName(input);
    if (token === "") return { ok: true, value: null };
    if (trueValues.has(token)) return { ok: true, value: true };
    if (falseValues.has(token)) return { ok: true, value: false };
  }
  // Não devolver o valor bruto: pode conter dados pessoais ou conteúdo inseguro.
  return { ok: false, code: "UNKNOWN_GOAL_VALUE" };
}
