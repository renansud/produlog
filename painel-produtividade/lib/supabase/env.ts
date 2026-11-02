import { z } from "zod";

const schema = z.object({
  url: z.url().refine((value) => {
    try {
      const url = new URL(value);
      return !url.username && !url.password && (url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)));
    } catch { return false; }
  }),
  key: z.string().startsWith("sb_publishable_").min(20),
});

export function getSupabaseEnv() {
  const parsed = schema.safeParse({ url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY });
  if (!parsed.success) throw new Error("Configuração pública do Supabase inválida ou ausente.");
  return parsed.data;
}
