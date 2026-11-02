import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { parseRuntimeDatabaseEnv } from "./database/env";

const globalForPrisma = globalThis as unknown as { servlogPrisma?: PrismaClient };
let productionClient: PrismaClient | undefined;
/** Lazy: importing this module during build never connects or requires database credentials.
 * Authorization and operation scope remain mandatory in every consuming application service.
 */
export function getPrisma(): PrismaClient {
  const current = process.env.NODE_ENV === "production" ? productionClient : globalForPrisma.servlogPrisma;
  if (current) return current;
  const adapter = new PrismaPg(parseRuntimeDatabaseEnv(process.env));
  const client = new PrismaClient({ adapter, log: [], errorFormat: "minimal" });
  if (process.env.NODE_ENV === "production") productionClient = client;
  else globalForPrisma.servlogPrisma = client;
  return client;
}
