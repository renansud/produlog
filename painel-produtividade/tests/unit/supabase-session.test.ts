import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";
const { createServerClient, getClaims } = vi.hoisted(() => ({ createServerClient: vi.fn(), getClaims: vi.fn() }));
vi.mock("@supabase/ssr", () => ({ createServerClient }));
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://synthetic.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_synthetic_test_only");
  createServerClient.mockReturnValue({ auth: { getClaims } });
  getClaims.mockResolvedValue({ data: null, error: null });
});
afterEach(() => vi.unstubAllEnvs());

it("consulta claims e mantém a resposta privada sem redirecionamento de login inexistente", async () => {
  const response = await updateSession(new NextRequest("http://localhost/auth/login"));
  expect(getClaims).toHaveBeenCalledOnce();
  expect(response.headers.get("location")).toBeNull();
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(response.headers.get("vary")).toBe("Cookie");
});
it("propaga cookies renovados à requisição e à resposta", async () => {
  const request = new NextRequest("http://localhost/auth/login");
  getClaims.mockImplementation(async () => {
    const options = createServerClient.mock.calls[0][2];
    options.cookies.setAll([{ name: "sb-synthetic", value: "renewed", options: { httpOnly: true, path: "/", sameSite: "lax" } }]);
    return { data: null, error: null };
  });
  const response = await updateSession(request);
  expect(request.cookies.get("sb-synthetic")?.value).toBe("renewed");
  expect(response.cookies.get("sb-synthetic")).toMatchObject({ value: "renewed", httpOnly: true, path: "/", sameSite: "lax" });
  expect(response.headers.get("cache-control")).toBe("private, no-store");
});
it("cria um cliente por requisição e falha sem consultar rede se a configuração for inválida", async () => {
  await updateSession(new NextRequest("http://localhost/auth/login"));
  await updateSession(new NextRequest("http://localhost/auth/login"));
  expect(createServerClient).toHaveBeenCalledTimes(2);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "invalid");
  const response = await updateSession(new NextRequest("http://localhost/auth/login"));
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(createServerClient).toHaveBeenCalledTimes(2);
});
