import { z } from "zod";
import { roleSchema, type Role } from "./access-policy";

export const loginSchema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(1024) }).strict();
const profileSchema = z.object({ role: roleSchema, active: z.literal(true), operation_ids: z.array(z.uuid()) });
export function identityFromAuthUser(user: unknown) {
  const parsed = z.object({ id: z.uuid(), app_metadata: profileSchema }).safeParse(user);
  if (!parsed.success) return null;
  return { userId: parsed.data.id, role: parsed.data.app_metadata.role, active: true as const, operationIds: [...new Set(parsed.data.app_metadata.operation_ids)].sort() };
}
export const dashboardPath = (role: Role) => role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard";
