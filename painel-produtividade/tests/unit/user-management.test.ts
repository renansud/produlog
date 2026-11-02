import { describe, expect, it, vi } from "vitest";
import { createManagedUser, listManagedUsers, type UsersGateway } from "@/modules/users/application/manage-users";
import { createUserSchema, projectAuthUser } from "@/modules/users/domain/users";
const admin = { userId: "30000000-0000-4000-8000-000000000001", role: "ADMIN", active: true, operationIds: [] };
const sample = { id: "30000000-0000-4000-8000-000000000002", email: "teste@example.invalid", created_at: "2026-07-01T00:00:00Z", email_confirmed_at: "2026-07-01T00:00:00Z", app_metadata: { role: "USER", active: true, operation_ids: [] } };
const password = "Senha" + "Sintetica123!";
const input = () => ({ email: " novo@example.invalid ", role: "USER", password, passwordConfirmation: password });
function dependencies(identity: unknown = admin) {
  const gateway: UsersGateway = { list: vi.fn(async () => ({ users: [sample], total: 21 })), create: vi.fn(async () => ({ kind: "created" as const, user: sample })) };
  return { getCurrentAccess: vi.fn(async () => identity), getGateway: vi.fn(() => gateway), gateway };
}
describe("administração de usuários", () => {
  it.each([null, { ...admin, role: "USER" }, { ...admin, active: false }])("bloqueia leitura e escrita antes de acessar integração: %s", async (identity) => {
    const deps = dependencies(identity);
    await expect(listManagedUsers(deps, { page: 1 })).rejects.toMatchObject({ status: identity ? 403 : 401 });
    await expect(createManagedUser(deps, input())).rejects.toMatchObject({ status: identity ? 403 : 401 });
    expect(deps.getGateway).not.toHaveBeenCalled();
  });
  it("pagina e retorna apenas projeção segura", async () => {
    const deps = dependencies();
    const result = await listManagedUsers(deps, { page: "2" });
    expect(deps.gateway.list).toHaveBeenCalledWith(2, 20);
    expect(result).toMatchObject({ kind: "ready", page: 2, lastPage: 2, total: 21 });
    expect(JSON.stringify(result)).not.toContain("app_metadata");
  });
  it.each([0, -1, "invalid", 1.5, 10001])("rejeita página inválida %s sem consulta", async (page) => {
    const deps = dependencies();
    await expect(listManagedUsers(deps, { page })).rejects.toThrow("Página inválida");
    expect(deps.gateway.list).not.toHaveBeenCalled();
  });
  it("indisponibilidade não aparece como diretório vazio", async () => {
    const deps = { ...dependencies(), getGateway: () => null };
    expect(await listManagedUsers(deps, { page: 1 })).toEqual({ kind: "unavailable" });
    expect(await createManagedUser(deps, input())).toMatchObject({ ok: false, code: "UNAVAILABLE" });
  });
  it("valida antes de criar e não aceita escopo/atividade no payload", async () => {
    const deps = dependencies();
    expect(await createManagedUser(deps, { ...input(), operation_ids: ["forged"] })).toMatchObject({ ok: false, code: "INVALID_INPUT" });
    expect(await createManagedUser(deps, { ...input(), passwordConfirmation: "diferente" })).toMatchObject({ ok: false, code: "INVALID_INPUT" });
    expect(deps.gateway.create).not.toHaveBeenCalled();
  });
  it("cria somente após autorizar, sem retornar senha", async () => {
    const deps = dependencies();
    const result = await createManagedUser(deps, input());
    expect(result).toEqual({ ok: true });
    expect(deps.gateway.create).toHaveBeenCalledWith({ email: "novo@example.invalid", role: "USER", password });
    expect(JSON.stringify(result)).not.toContain(password);
  });
  it("trata duplicidade e falha sem ecoar erro do provedor ou senha", async () => {
    const deps = dependencies();
    vi.mocked(deps.gateway.create).mockResolvedValueOnce({ kind: "duplicate" });
    expect(await createManagedUser(deps, input())).toMatchObject({ ok: false, code: "DUPLICATE" });
    vi.mocked(deps.gateway.create).mockRejectedValueOnce(new Error(password));
    const result = await createManagedUser(deps, input());
    expect(result).toMatchObject({ ok: false, code: "FAILED" });
    expect(JSON.stringify(result)).not.toContain(password);
  });
  it("consulta com falha não fornece dados parciais nem erro interno", async () => {
    const deps = dependencies();
    vi.mocked(deps.gateway.list).mockRejectedValueOnce(new Error("internal"));
    expect(await listManagedUsers(deps, { page: 1 })).toEqual({ kind: "unavailable" });
  });
  it("preserva senha e rejeita e-mail, papel, tamanho e confirmação inválidos", () => {
    expect(createUserSchema.parse({ ...input(), password: ` ${password} `, passwordConfirmation: ` ${password} ` }).password).toBe(` ${password} `);
    for (const change of [{ email: "inválido" }, { role: "SUPERADMIN" }, { password: "curta" }, { password: "x".repeat(129) }]) expect(createUserSchema.safeParse({ ...input(), ...change }).success).toBe(false);
  });
  it("sem metadados válidos não declara conta ativa e ignora user_metadata", () => {
    expect(projectAuthUser({ ...sample, app_metadata: {}, user_metadata: { role: "ADMIN", active: true } })).toMatchObject({ role: null, status: "NO_PROFILE" });
    expect(projectAuthUser({ ...sample, app_metadata: { role: "USER", active: false, operation_ids: [] } })).toMatchObject({ status: "INACTIVE" });
    expect(projectAuthUser({ ...sample, email_confirmed_at: undefined })).toMatchObject({ status: "PENDING" });
    expect(projectAuthUser({ ...sample, banned_until: "2999-01-01T00:00:00Z" })).toMatchObject({ status: "INACTIVE" });
  });
});

it("limita senha a 72 bytes UTF-8 sem truncar ASCII ou caracteres multibyte", () => {
  const validate = (value: string) => createUserSchema.safeParse({ ...input(), password: value, passwordConfirmation: value }).success;
  expect(validate("x".repeat(72))).toBe(true);
  expect(validate("x".repeat(73))).toBe(false);
  expect(validate("á".repeat(36))).toBe(true);
  expect(validate("á".repeat(37))).toBe(false);
  expect(validate("😀".repeat(6))).toBe(false);
});