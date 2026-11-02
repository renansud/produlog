import "server-only";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getSupabaseEnv } from "./env";

export function createAdminClient() {
  const secret = z.string().startsWith("sb_secret_").min(24).safeParse(process.env.SUPABASE_SECRET_KEY);
  if (!secret.success) return null;
  try {
    const { url } = getSupabaseEnv();
    return createClient(url, secret.data, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: init?.signal ? AbortSignal.any([init.signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) }) },
    });
  } catch { return null; }
}
