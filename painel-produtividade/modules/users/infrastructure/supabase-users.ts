import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAccess } from "@/modules/auth/infrastructure/current-access";
import type { UsersGateway } from "../application/manage-users";

export function getUsersGateway(): UsersGateway | null {
  const client = createAdminClient();
  if (!client) return null;
  return {
    async list(page, perPage) {
      const result = await client.auth.admin.listUsers({ page, perPage });
      if (result.error) throw new Error("USERS_READ_FAILED");
      return { users: result.data.users, total: result.data.total };
    },
    async create({ email, role, password }) {
      const result = await client.auth.admin.createUser({
        email, password, email_confirm: true,
        app_metadata: { role, active: true, operation_ids: [] },
      });
      if (result.error) {
        if (["email_exists", "user_already_exists"].includes(result.error.code ?? "")) return { kind: "duplicate" };
        throw new Error("USER_CREATE_FAILED");
      }
      return { kind: "created", user: result.data.user };
    },
  };
}
export const usersDependencies = { getCurrentAccess, getGateway: getUsersGateway };
