import "server-only";
import type { ProductivityPageDependencies } from "../application/read-productivity-page";
import { scopedProductivityRowSchema } from "../domain/productivity-filters";
import { paginateSyntheticProductivity } from "../domain/productivity-page";
import { createDemoDependencies } from "./demo-dashboard";

export const privateProductivityPageDependencies: ProductivityPageDependencies = {
  access: { getCurrentAccess: async () => null },
  repository: {
    findSupervisorIds: async () => { throw new Error("Repositório indisponível."); },
    findPage: async () => { throw new Error("Repositório indisponível."); },
  },
};

export function createDemoProductivityPageDependencies(): ProductivityPageDependencies {
  const dependencies = createDemoDependencies();
  return {
    access: dependencies.access,
    repository: {
      findSupervisorIds: async (ids, requested) => {
        const rows = (await dependencies.repository.findByOperations(ids)).map((row) => scopedProductivityRowSchema.parse(row));
        return [...new Set(rows.filter((row) => requested.includes(row.supervisorId)).map((row) => row.supervisorId))];
      },
      findPage: async (ids, query) => paginateSyntheticProductivity(await dependencies.repository.findByOperations(ids), query),
    },
  };
}
