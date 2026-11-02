import "server-only";
import type { ProductivityDependencies } from "../application/read-productivity-dashboard";

/** Falha fechado até a integração de sessão e repositório reais. Não usa query/cookies como permissões. */
export const privateDashboardDependencies: ProductivityDependencies = {
  access: { getCurrentAccess: async () => null },
  repository: { findByOperations: async () => { throw new Error("Repositório não configurado."); } },
};
