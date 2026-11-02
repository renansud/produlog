import { z } from "zod";

export const roleSchema = z.enum(["ADMIN", "USER"]);
export const permissionSchema = z.enum(["productivity:read", "productivity:export", "users:read", "users:create", "productivity:insert"]);
export type Role = z.infer<typeof roleSchema>;
export type Permission = z.infer<typeof permissionSchema>;
const permissions: Record<Role, readonly Permission[]> = {
  ADMIN: ["productivity:read", "productivity:export", "users:read", "users:create", "productivity:insert"],
  USER: ["productivity:read", "productivity:export"],
};
export function roleHasPermission(role: unknown, permission: unknown): boolean {
  const parsedRole = roleSchema.safeParse(role);
  const parsedPermission = permissionSchema.safeParse(permission);
  return parsedRole.success && parsedPermission.success && permissions[parsedRole.data].includes(parsedPermission.data);
}
