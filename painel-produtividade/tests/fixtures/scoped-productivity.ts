import { baseline } from "./productivity";

export const operationA = "10000000-0000-4000-8000-000000000001";
export const operationB = "10000000-0000-4000-8000-000000000002";
export const supervisorA = "20000000-0000-4000-8000-000000000001";
export const supervisorB = "20000000-0000-4000-8000-000000000002";
export const syntheticUserId = "30000000-0000-4000-8000-000000000001";

export const scopedBaseline = baseline.map((row) => ({
  ...row,
  operationId: row.operation === "Operação Exemplo A" ? operationA : operationB,
  supervisorId: row.supervisor === "Equipe Exemplo A" ? supervisorA : supervisorB,
}));
