import { expect, it } from "vitest";
import { prismaMigrationUrl } from "@/lib/database/cli-url";
it("adapta CA ao conector de migrations mantendo verificação estrita", () => {
  const uri = new URL(prismaMigrationUrl("postgresql://owner:synthetic@db.example.invalid:5432/postgres?sslmode=verify-full&sslrootcert=prisma%2Fcerts%2Fsupabase.crt", process.cwd()));
  expect(uri.searchParams.get("sslmode")).toBe("require");
  expect(uri.searchParams.get("sslaccept")).toBe("strict");
  expect(uri.searchParams.has("sslrootcert")).toBe(false);
  expect(uri.searchParams.get("sslcert")).toContain("supabase.crt");
});
it("mantém conexão local sem exigir TLS e rejeita pooler transacional", () => {
  expect(new URL(prismaMigrationUrl("postgresql://local:synthetic@localhost:5432/test", process.cwd())).searchParams.has("sslmode")).toBe(false);
  expect(() => prismaMigrationUrl("postgresql://owner:synthetic@region.pooler.supabase.com:6543/postgres?sslmode=verify-full", process.cwd())).toThrow("DIRECT_URL");
});
