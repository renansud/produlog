import { z } from "zod";

type DatabaseVariable = "DATABASE_URL" | "DIRECT_URL";
export class DatabaseConfigurationError extends Error {
  constructor(message: string) { super(message); this.name = "DatabaseConfigurationError"; }
}
/** Never include a submitted connection string or Zod issue payload in errors. */
export function parseDatabaseUrl(value: unknown, variable: DatabaseVariable): string {
  const parsed = z.string().min(1).max(4096).safeParse(value);
  let valid = parsed.success;
  if (parsed.success) {
    try {
      const uri = new URL(parsed.data);
      const local = ["localhost", "127.0.0.1", "[::1]"].includes(uri.hostname);
      const tls = uri.searchParams.get("sslmode");
      const allowed = new Set(["sslmode", "sslrootcert", "sslcert", "sslkey", "pgbouncer", "connection_limit", "pool_timeout", "connect_timeout", "application_name", "schema"]);
      const safeParams = Array.from(uri.searchParams.keys()).every((key) => allowed.has(key) && uri.searchParams.getAll(key).length === 1);
      valid = ["postgres:", "postgresql:"].includes(uri.protocol) && !!uri.hostname && !!uri.username &&
        !!uri.pathname.replaceAll("/", "") && safeParams && !uri.hash && !/\s/.test(parsed.data) &&
        (local || (!!uri.password && ["require", "verify-full"].includes(tls ?? "")));
      if (variable === "DIRECT_URL" && uri.hostname.endsWith(".pooler.supabase.com") && uri.port === "6543") valid = false;
    } catch { valid = false; }
  }
  if (!valid || !parsed.success) throw new DatabaseConfigurationError(`${variable} ausente ou inválida. Configure uma URL PostgreSQL privada com TLS fora de localhost.`);
  return parsed.data;
}
export function parseRuntimeDatabaseEnv(env: Record<string, string | undefined>) {
  if (env.NEXT_PUBLIC_DATABASE_URL || env.NEXT_PUBLIC_DIRECT_URL) throw new DatabaseConfigurationError("URLs PostgreSQL não podem usar prefixo NEXT_PUBLIC.");
  const connectionString = parseDatabaseUrl(env.DATABASE_URL, "DATABASE_URL");
  const max = z.coerce.number().int().min(1).max(20).safeParse(env.DATABASE_POOL_MAX ?? 5);
  if (!max.success) throw new DatabaseConfigurationError("DATABASE_POOL_MAX inválido. Use um inteiro de 1 a 20.");
  return { connectionString, max: max.data, connectionTimeoutMillis: 10000, idleTimeoutMillis: 30000 };
}
