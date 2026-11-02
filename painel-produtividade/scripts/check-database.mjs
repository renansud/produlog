import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { parseDatabaseUrl, parseRuntimeDatabaseEnv } from "../lib/database/env.ts";
import { describeDatabaseFailure } from "../lib/database/failure.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
config({ path: [resolve(root, ".env.local"), resolve(root, ".env")], quiet: true });
let client;
try {
  const settings = parseRuntimeDatabaseEnv(process.argv.includes("--direct")
    ? { ...process.env, DATABASE_URL: parseDatabaseUrl(process.env.DIRECT_URL, "DIRECT_URL") }
    : process.env);
  client = new PrismaClient({ adapter: new PrismaPg(settings), log: [], errorFormat: "minimal" });
  const result = await client.$queryRaw`SELECT 1 AS ok`;
  if (result[0]?.ok !== 1) throw new Error("Unexpected response");
  console.log("Conexão Prisma/PostgreSQL validada com consulta somente de leitura.");
} catch (error) {
  console.error(describeDatabaseFailure(error));
  process.exitCode = 1;
} finally { if (client) await client.$disconnect().catch(() => {}); }
