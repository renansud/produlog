import { describe, expect, it, vi } from "vitest";
import { dashboardPath, identityFromAuthUser, loginSchema } from "@/modules/auth/domain/auth-routing";
import { signIn } from "@/modules/auth/application/sign-in";
import { syntheticUserId, operationA } from "../fixtures/scoped-productivity";
const user = (role = "USER") => ({ id: syntheticUserId, app_metadata: { role, active: true, operation_ids: [operationA] } });
const input = { email: "example@example.test", password: "synthetic-password" };
const deps = () => ({ signIn: vi.fn(async () => true), readVerifiedUser: vi.fn(async (): Promise<unknown> => user()), clearSession: vi.fn(async () => {}) });

describe("Roteamento e login", () => {
  it.each(["ADMIN", "USER"] as const)("destino de %s é fixo e determinado pelo perfil", async (role) => {
    const dependencies = deps(); dependencies.readVerifiedUser.mockResolvedValue(user(role));
    expect(await signIn(input, dependencies)).toEqual({ destination: dashboardPath(role) });
  });
  it.each(["GESTOR", "SUPERADMIN", "user"])("perfil %s não concede dashboard", async (role) => {
    const dependencies = deps(); dependencies.readVerifiedUser.mockResolvedValue(user(role));
    expect(await signIn(input, dependencies)).toHaveProperty("error");
    expect(dependencies.clearSession).toHaveBeenCalledOnce();
  });
  it("não aceita papel de user_metadata nem campo role do login", async () => {
    expect(identityFromAuthUser({ id: syntheticUserId, user_metadata: { role: "ADMIN", active: true } })).toBeNull();
    expect(identityFromAuthUser({ ...user(), user_metadata: { role: "ADMIN" } })?.role).toBe("USER");
    const dependencies = deps();
    expect(await signIn({ ...input, role: "ADMIN" }, dependencies)).toHaveProperty("error");
    expect(dependencies.signIn).not.toHaveBeenCalled();
  });
  it("perfil inativo/ausente ou identidade inválida bloqueia acesso", () => {
    expect(identityFromAuthUser({ id: syntheticUserId, app_metadata: {} })).toBeNull();
    expect(identityFromAuthUser({ ...user(), app_metadata: { ...user().app_metadata, active: false } })).toBeNull();
    expect(identityFromAuthUser({ ...user(), id: "invalid" })).toBeNull();
  });
  it("credencial inválida ou falha de rede não revela resposta do provedor", async () => {
    const dependencies = deps(); dependencies.signIn.mockResolvedValue(false);
    expect(await signIn(input, dependencies)).toHaveProperty("error");
    expect(dependencies.readVerifiedUser).not.toHaveBeenCalled();
    dependencies.signIn.mockRejectedValue(new Error("conteúdo restrito"));
    expect(JSON.stringify(await signIn(input, dependencies))).not.toContain("conteúdo restrito");
  });
  it("valida antes de autenticar, preserva a senha e normaliza apenas e-mail", async () => {
    expect(loginSchema.parse({ email: " example@example.test ", password: " password " }).password).toBe(" password ");
    const dependencies = deps();
    expect(await signIn({ email: "invalid", password: "" }, dependencies)).toHaveProperty("error");
    expect(dependencies.signIn).not.toHaveBeenCalled();
  });
});
