import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { prismaMigrationUrl } from "./lib/database/cli-url";

const root = fileURLToPath(new URL(".", import.meta.url));
config({ path: [resolve(root, ".env.local"), resolve(root, ".env")], quiet: true });
// generate/validate are offline. Migration commands require DIRECT_URL explicitly;
// never substitute DATABASE_URL or a made-up connection string.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  ...(process.env.DIRECT_URL ? { datasource: { url: prismaMigrationUrl(process.env.DIRECT_URL, root) } } : {}),
});
