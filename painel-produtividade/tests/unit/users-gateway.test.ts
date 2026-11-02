import { beforeEach, expect, it, vi } from "vitest";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUsersGateway } from "@/modules/users/infrastructure/supabase-users";
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));
vi.mock("@/modules/auth/infrastructure/current-access", () => ({ getCurrentAccess: vi.fn() }));
const create = vi.fn(), list = vi.fn(), from = vi.fn();
beforeEach(() => {
  vi.mocked(createAdminClient).mockReturnValue({ auth: { admin: { createUser: create, listUsers: list } }, from } as unknown as NonNullable<ReturnType<typeof createAdminClient>>);
});
it("cria com metadados administrativos e escopo vazio sem trocar sessão", async () => {
  const password = "Senha" + "Ficticia123!";
  create.mockResolvedValueOnce({ data: { user: { id: "synthetic" } }, error: null });
  const gateway = getUsersGateway()!;
  await expect(gateway.create({ email: "teste@example.invalid", password, role: "USER" })).resolves.toMatchObject({ kind: "created" });
  expect(create).toHaveBeenCalledWith({ email: "teste@example.invalid", password, email_confirm: true, app_metadata: { role: "USER", active: true, operation_ids: [] } });
  expect(from).not.toHaveBeenCalled();
});
it("pagina todas as contas sem consultar Data API", async () => {
  list.mockResolvedValueOnce({ data: { users: [], total: 25 }, error: null });
  expect(await getUsersGateway()!.list(2, 20)).toEqual({ users: [], total: 25 });
  expect(list).toHaveBeenCalledWith({ page: 2, perPage: 20 });
  expect(from).not.toHaveBeenCalled();
});
it("ausência de configuração bloqueia integração", () => {
  vi.mocked(createAdminClient).mockReturnValueOnce(null);
  expect(getUsersGateway()).toBeNull();
});
it("classifica duplicidade; não vaza mensagem interna do Supabase", async () => {
  const input = { email: "teste@example.invalid", password: "Senha" + "Ficticia123!", role: "USER" as const };
  create.mockResolvedValueOnce({ error: { code: "email_exists", message: "private" } });
  expect(await getUsersGateway()!.create(input)).toEqual({ kind: "duplicate" });
  create.mockResolvedValueOnce({ error: { code: "unexpected", message: "private" } });
  await expect(getUsersGateway()!.create(input)).rejects.toThrow("USER_CREATE_FAILED");
  list.mockResolvedValueOnce({ error: { message: "private" } });
  await expect(getUsersGateway()!.list(1, 20)).rejects.toThrow("USERS_READ_FAILED");
});
