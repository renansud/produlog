import "server-only";
import { z } from "zod";
import { roleHasPermission, roleSchema, type Permission } from "../domain/access-policy";

const identitySchema = z.object({
  userId: z.uuid(), role: roleSchema, active: z.boolean(),
  operationIds: z.array(z.uuid()).transform((ids) => [...new Set(ids)].sort()),
}).strict();
export class AuthorizationError extends Error {
  readonly status: 401 | 403;
  constructor(readonly code: "UNAUTHORIZED" | "FORBIDDEN") {
    super(code === "UNAUTHORIZED" ? "Autenticação necessária." : "Acesso não autorizado.");
    this.name = "AuthorizationError";
    this.status = code === "UNAUTHORIZED" ? 401 : 403;
  }
}
/** Provider: sessão validada e perfil/escopo no servidor, nunca dados de formulário. */
export async function requirePermission(provider: { getCurrentAccess(): Promise<unknown> }, permission: Permission) {
  const current = await provider.getCurrentAccess();
  if (current === null || current === undefined) throw new AuthorizationError("UNAUTHORIZED");
  const parsed = identitySchema.safeParse(current);
  if (!parsed.success || !parsed.data.active || !roleHasPermission(parsed.data.role, permission)) throw new AuthorizationError("FORBIDDEN");
  return parsed.data;
}
