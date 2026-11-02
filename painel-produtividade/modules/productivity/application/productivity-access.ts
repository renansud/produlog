import "server-only";
import { requirePermission } from "@/modules/auth/application/require-permission";

export { AuthorizationError as ProductivityAccessError } from "@/modules/auth/application/require-permission";

export async function requireProductivityAccess(provider: { getCurrentAccess(): Promise<unknown> }) {
  return requirePermission(provider, "productivity:read");
}
