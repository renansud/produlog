import { resolve } from "node:path";
import { DatabaseConfigurationError, parseDatabaseUrl } from "./env.ts";
/** Prisma Migrate's native connector uses sslcert/sslaccept, unlike node-pg. */
export function prismaMigrationUrl(value: unknown, root: string): string {
  const uri = new URL(parseDatabaseUrl(value, "DIRECT_URL"));
  const ca = uri.searchParams.get("sslrootcert");
  if (ca && uri.searchParams.has("sslcert")) throw new DatabaseConfigurationError("DIRECT_URL contém configuração de certificados conflitante.");
  if (ca) {
    uri.searchParams.delete("sslrootcert");
    uri.searchParams.set("sslcert", resolve(root, ca));
  } else if (uri.searchParams.get("sslcert")) {
    uri.searchParams.set("sslcert", resolve(root, uri.searchParams.get("sslcert")!));
  }
  if (uri.searchParams.has("sslmode")) {
    uri.searchParams.set("sslmode", "require");
    uri.searchParams.set("sslaccept", "strict");
  }
  return uri.toString();
}
