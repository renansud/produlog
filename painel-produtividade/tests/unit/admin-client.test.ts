import { afterEach, expect, it, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn(() => ({})) }));
vi.mock("@/lib/supabase/env", () => ({ getSupabaseEnv: () => ({ url: "https://example.invalid", key: "public" }) }));
afterEach(() => vi.unstubAllEnvs());
it("não usa publishable como credencial administrativa nem inicializa sem segredo", () => {
  vi.stubEnv("SUPABASE_SECRET_KEY", undefined);
  expect(createAdminClient()).toBeNull();
  vi.stubEnv("SUPABASE_SECRET_KEY", ["sb", "publishable", "test".repeat(8)].join("_"));
  expect(createAdminClient()).toBeNull();
  expect(createClient).not.toHaveBeenCalled();
});
it("desabilita armazenamento, detecção e atualização de sessão no cliente privilegiado", () => {
  const key = ["sb", "secret", "test".repeat(8)].join("_");
  vi.stubEnv("SUPABASE_SECRET_KEY", key);
  expect(createAdminClient()).not.toBeNull();
  expect(createClient).toHaveBeenCalledWith("https://example.invalid", key, expect.objectContaining({ auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }));
});
