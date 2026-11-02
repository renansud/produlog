import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabaseEnv } from "@/lib/supabase/env";

afterEach(() => vi.unstubAllEnvs());
const configure = (url: string, key = "sb_publishable_synthetic_test_only") => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", key);
};
describe("Configuração pública Supabase", () => {
  it("aceita projeto HTTPS e desenvolvimento local", () => {
    for (const url of ["https://synthetic.supabase.co", "http://127.0.0.1:54321"]) {
      configure(url);
      expect(getSupabaseEnv().url).toBe(url);
    }
  });
  it.each(["http://remote.example", "https://user:password@example.com", "invalid"])("rejeita URL inválida sem ecoar conteúdo: %s", (url) => {
    configure(url);
    expect(() => getSupabaseEnv()).toThrow("Configuração pública do Supabase inválida ou ausente.");
  });
  it("rejeita chave secreta ou configuração ausente", () => {
    configure("https://synthetic.supabase.co", "sb_secret_synthetic_test_only");
    expect(() => getSupabaseEnv()).toThrow();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    expect(() => getSupabaseEnv()).toThrow();
  });
});
