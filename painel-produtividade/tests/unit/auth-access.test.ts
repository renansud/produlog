import { beforeEach, expect, it, vi } from "vitest";
import { syntheticUserId, operationA } from "../fixtures/scoped-productivity";
const { getClaims, getUser, createClient, redirect } = vi.hoisted(() => ({ getClaims: vi.fn(), getUser: vi.fn(), createClient: vi.fn(), redirect: vi.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }) }));
vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/navigation", () => ({ redirect }));
import { getCurrentAccess } from "@/modules/auth/infrastructure/current-access";
import { requireRole } from "@/modules/auth/presentation/require-role";

beforeEach(() => {
  vi.clearAllMocks();
  createClient.mockResolvedValue({ auth: { getClaims, getUser } });
  getClaims.mockResolvedValue({ data: { claims: { sub: syntheticUserId } }, error: null });
  getUser.mockResolvedValue({ data: { user: { id: syntheticUserId, app_metadata: { role: "USER", active: true, operation_ids: [operationA] } } }, error: null });
});
it("exige claims verificados e relê o usuário antes de aceitar papel", async () => {
  expect(await getCurrentAccess()).toMatchObject({ userId: syntheticUserId, role: "USER" });
  expect(getUser).toHaveBeenCalledOnce();
  getClaims.mockResolvedValue({ data: null, error: new Error("invalid") });
  expect(await getCurrentAccess()).toBeNull();
  expect(getUser).toHaveBeenCalledOnce();
});
it("bloqueia troca de identidade e perfil revogado na leitura atual", async () => {
  getUser.mockResolvedValue({ data: { user: { id: operationA, app_metadata: { role: "ADMIN", active: true, operation_ids: [] } } }, error: null });
  expect(await getCurrentAccess()).toBeNull();
  getUser.mockResolvedValue({ data: { user: { id: syntheticUserId, app_metadata: { role: "ADMIN", active: false, operation_ids: [] } } }, error: null });
  expect(await getCurrentAccess()).toBeNull();
});
it("USER não abre layout/página ADMIN e segue para seu próprio dashboard", async () => {
  await expect(requireRole("ADMIN")).rejects.toThrow("REDIRECT:/user/dashboard");
  expect(await requireRole("USER")).toMatchObject({ role: "USER" });
});
it("sem sessão ou em falha de serviço retorna ao login, sem liberar dashboard", async () => {
  getClaims.mockResolvedValue({ data: null, error: null });
  await expect(requireRole("USER")).rejects.toThrow("REDIRECT:/");
  createClient.mockRejectedValue(new Error("service unavailable"));
  expect(await getCurrentAccess()).toBeNull();
});
