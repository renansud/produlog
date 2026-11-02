import "server-only";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

/** Atualiza cookies; autorização de dados permanece nos casos de uso. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  let config: ReturnType<typeof getSupabaseEnv>;
  try { config = getSupabaseEnv(); }
  catch {
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Vary", "Cookie");
    return response; // Guards de servidor continuam negando acesso sem configuração/sessão.
  }
  const { url, key } = config;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookies) {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  try { await supabase.auth.getClaims(); } catch { /* Páginas e ações validam a identidade independentemente. */ }
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Vary", "Cookie");
  return response;
}
