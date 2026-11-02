import { describe, expect, it } from "vitest";
import { parseDatabaseUrl, parseRuntimeDatabaseEnv } from "@/lib/database/env";
const remote = (port = 6543) => `postgresql://runtime:synthetic@region.pooler.supabase.com:${port}/postgres?sslmode=require`;
describe("configuração PostgreSQL sanitizada", () => {
  it("aceita runtime com TLS e limita o pool", () => {
    expect(parseRuntimeDatabaseEnv({ DATABASE_URL: remote() })).toMatchObject({ connectionString: remote(), max: 5, connectionTimeoutMillis: 10000 });
    expect(parseRuntimeDatabaseEnv({ DATABASE_URL: remote(), DATABASE_POOL_MAX: "2" }).max).toBe(2);
  });
  it("permite Postgres local sem TLS, mas exige TLS remotamente", () => {
    expect(parseDatabaseUrl("postgresql://local:synthetic@127.0.0.1:5432/test", "DATABASE_URL")).toContain("127.0.0.1");
    expect(() => parseDatabaseUrl(remote().replace("?sslmode=require", ""), "DATABASE_URL")).toThrow("DATABASE_URL");
    expect(() => parseDatabaseUrl(remote().replace("require", "disable"), "DATABASE_URL")).toThrow();
  });
  it("não usa pooler transacional para migrations", () => {
    expect(() => parseDatabaseUrl(remote(), "DIRECT_URL")).toThrow("DIRECT_URL");
    expect(parseDatabaseUrl(remote(5432), "DIRECT_URL")).toContain(":5432/");
  });
  it.each([undefined, "", "https://project.supabase.co", "file:./dev.db", "postgresql://host/db", "postgresql://a:b@host/db?sslmode=no-verify"])( "rejeita URL inválida sem ecoar valor %s", (value) => {
    try { parseDatabaseUrl(value, "DATABASE_URL"); throw new Error("expected failure"); }
    catch (error) { expect((error as Error).message).toBe("DATABASE_URL ausente ou inválida. Configure uma URL PostgreSQL privada com TLS fora de localhost."); }
  });
  it.each(["0", "21", "1.5", "x"])( "rejeita tamanho de pool %s", (max) => {
    expect(() => parseRuntimeDatabaseEnv({ DATABASE_URL: remote(), DATABASE_POOL_MAX: max })).toThrow("DATABASE_POOL_MAX");
  });
  it("não troca runtime por DIRECT_URL nem tolera URL privada pública", () => {
    expect(() => parseRuntimeDatabaseEnv({ DIRECT_URL: remote(5432) })).toThrow("DATABASE_URL");
    expect(() => parseRuntimeDatabaseEnv({ DATABASE_URL: remote(), NEXT_PUBLIC_DATABASE_URL: remote() })).toThrow("NEXT_PUBLIC");
  });
});

it.each([
  "postgresql://local:synthetic@127.0.0.1:5432/test?host=outside.invalid",
  "postgresql://runtime:synthetic@region.pooler.supabase.com:5432/test?sslmode=require&sslmode=disable",
  "postgresql://runtime:synthetic@region.pooler.supabase.com:5432/test?sslmode=require&uselibpqcompat=true",
  "postgresql://runtime:synthetic@region.pooler.supabase.com:5432/test?sslmode=require&port=6543",
])("não aceita parâmetros que sobrescrevem roteamento ou verificação TLS", (value) => {
  expect(() => parseDatabaseUrl(value, "DIRECT_URL")).toThrow("DIRECT_URL");
});