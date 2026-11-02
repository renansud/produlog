import { expect, it } from "vitest";
import { filterInputFromQuery, filterQueryString } from "@/modules/productivity/domain/filter-query";
import { productivityFiltersSchema, selectProductivityRows } from "@/modules/productivity/domain/productivity-filters";
import { formatReferenceMonth } from "@/modules/productivity/presentation/format-decimal";
import { operationA, operationB, scopedBaseline, supervisorA } from "../fixtures/scoped-productivity";

it("faz roundtrip de filtros repetidos e ordenados sem incluir permissões", () => {
  const filters = { months: ["2026-07", "2026-06", "2026-07"], operations: [operationB, operationA], supervisors: [supervisorA] };
  const query = filterQueryString(filters);
  expect(productivityFiltersSchema.parse(filterInputFromQuery(new URLSearchParams(query)))).toEqual({ months: ["2026-06", "2026-07"], operations: [operationA, operationB], supervisors: [supervisorA] });
  expect(filterQueryString({})).toBe("");
});

it("não elimina parâmetro desconhecido antes da validação", () => {
  expect(() => productivityFiltersSchema.parse(filterInputFromQuery(new URLSearchParams("role=ADMIN")))).toThrow();
});

it("preserva associação de supervisor a todas as operações autorizadas", () => {
  const shared = scopedBaseline.map((row) => ({ ...row, supervisorId: supervisorA, supervisor: "Equipe Compartilhada" }));
  const result = selectProductivityRows(shared, { operations: [operationA] });
  expect(result.options.supervisors[0].operationIds).toEqual([operationA, operationB]);
});

it.each([["2026-06", "Junho de 2026"], ["2026-07", "Julho de 2026"]])("formata competência %s sem deslocamento de fuso", (month, expected) => {
  expect(formatReferenceMonth(month)).toBe(expected);
});
