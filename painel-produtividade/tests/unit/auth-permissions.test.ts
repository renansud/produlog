import { describe, expect, it, vi } from "vitest";
import { roleHasPermission } from "@/modules/auth/domain/access-policy";
import { requirePermission } from "@/modules/auth/application/require-permission";
import { operationA, operationB, syntheticUserId } from "../fixtures/scoped-productivity";

const identity = (role = "USER") => ({ userId: syntheticUserId, active: true, role, operationIds: [operationA] });
const provider = (value: unknown) => ({ getCurrentAccess: vi.fn(async () => value) });

describe("Matriz ADMIN/USER", () => {
  it.each(["productivity:read", "productivity:export", "users:read", "users:create", "productivity:insert"])("ADMIN recebe %s", (permission) => {
    expect(roleHasPermission("ADMIN", permission)).toBe(true);
  });
  it.each([
    ["productivity:read", true], ["productivity:export", true],
    ["users:read", false], ["users:create", false], ["productivity:insert", false],
  ])("USER: %s = %s", (permission, allowed) => {
    expect(roleHasPermission("USER", permission)).toBe(allowed);
  });
  it.each(["GESTOR", "VISUALIZADOR", "SUPERADMIN", "admin", undefined])("rejeita papel não reconhecido %s", (role) => {
    expect(roleHasPermission(role, "users:create")).toBe(false);
  });
  it("não concede permissões de exclusão ou ações desconhecidas", () => {
    expect(roleHasPermission("ADMIN", "users:delete")).toBe(false);
  });
});

describe("Autorização por identidade fornecida pelo servidor", () => {
  it.each(["GESTOR", "VISUALIZADOR"])("papel antigo %s não recebe sequer leitura por conversão automática", async (role) => {
    await expect(requirePermission(provider(identity(role)), "productivity:read")).rejects.toMatchObject({ status: 403 });
  });
  it.each(["users:read", "users:create", "productivity:insert"] as const)("USER não executa efeito protegido por %s", async (permission) => {
    const effect = vi.fn();
    async function action() { await requirePermission(provider(identity()), permission); effect(); }
    await expect(action()).rejects.toMatchObject({ status: 403, code: "FORBIDDEN" });
    expect(effect).not.toHaveBeenCalled();
    await expect(requirePermission(provider(identity("ADMIN")), permission)).resolves.toMatchObject({ role: "ADMIN", operationIds: [operationA] });
  });
  it.each([
    { value: null, status: 401 },
    { value: { ...identity("ADMIN"), active: false }, status: 403 },
    { value: { ...identity(), permissions: ["users:create"] }, status: 403 },
    { value: { ...identity(), role: "GESTOR" }, status: 403 },
    { value: { ...identity(), userId: "invalid" }, status: 403 },
  ])("identidade inválida não autoriza escrita: $status", async ({ value, status }) => {
    await expect(requirePermission(provider(value), "users:create")).rejects.toMatchObject({ status });
  });
  it("revalida identidade em cada chamada e não amplia operações de ADMIN", async () => {
    const access = provider({ ...identity("ADMIN"), operationIds: [operationB, operationA, operationA] });
    expect((await requirePermission(access, "users:create")).operationIds).toEqual([operationA, operationB]);
    access.getCurrentAccess.mockResolvedValue(identity("USER"));
    await expect(requirePermission(access, "users:create")).rejects.toMatchObject({ status: 403 });
    expect(access.getCurrentAccess).toHaveBeenCalledTimes(2);
  });
});
