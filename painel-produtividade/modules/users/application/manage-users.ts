import "server-only";
import { z } from "zod";
import { requirePermission } from "@/modules/auth/application/require-permission";
import { createUserSchema, projectAuthUser, usersPageSchema, type CreateUserResult, type NewUserInput, type UserList } from "../domain/users";

export interface UsersGateway {
  list(page: number, perPage: number): Promise<{ users: unknown[]; total: number }>;
  create(input: Omit<NewUserInput, "passwordConfirmation">): Promise<{ kind: "created"; user: unknown } | { kind: "duplicate" }>;
}
type Dependencies = { getCurrentAccess(): Promise<unknown>; getGateway(): UsersGateway | null };
export async function listManagedUsers(deps: Dependencies, input: unknown): Promise<UserList> {
  await requirePermission(deps, "users:read");
  const parsed = usersPageSchema.safeParse(input);
  if (!parsed.success) throw new Error("Página inválida.");
  try {
    const gateway = deps.getGateway();
    if (!gateway) return { kind: "unavailable" };
    const result = await gateway.list(parsed.data.page, 20);
    const total = z.number().int().nonnegative().safeParse(result.total);
    if (!total.success || result.users.length > 20 || result.users.length > total.data) return { kind: "unavailable" };
    return { kind: "ready", users: result.users.map(projectAuthUser), total: total.data, page: parsed.data.page, lastPage: Math.max(1, Math.ceil(total.data / 20)) };
  } catch { return { kind: "unavailable" }; }
}
export async function createManagedUser(deps: Dependencies, input: unknown): Promise<CreateUserResult> {
  await requirePermission(deps, "users:create");
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    const fields: Partial<Record<keyof NewUserInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && ["email", "role", "password", "passwordConfirmation"].includes(key)) fields[key as keyof NewUserInput] = issue.message;
    }
    return { ok: false, code: "INVALID_INPUT", message: "Revise os campos indicados.", fields };
  }
  try {
    const gateway = deps.getGateway();
    if (!gateway) return { ok: false, code: "UNAVAILABLE", message: "O cadastro está indisponível. Tente novamente após a configuração administrativa." };
    const { email, role, password } = parsed.data;
    const result = await gateway.create({ email, role, password });
    if (result.kind === "duplicate") return { ok: false, code: "DUPLICATE", message: "Já existe uma conta com esse e-mail. Consulte a lista de usuários." };
    // Do not report a failed creation after a successful external write because of DTO formatting.
    return { ok: true };
  } catch { return { ok: false, code: "FAILED", message: "Não foi possível confirmar o cadastro. Consulte a lista antes de tentar novamente." }; }
}
