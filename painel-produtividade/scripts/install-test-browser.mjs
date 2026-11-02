import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../node_modules/playwright/cli.js", import.meta.url));
const browsers = fileURLToPath(new URL("../../.tools/playwright", import.meta.url));
const result = spawnSync(process.execPath, [cli, "install", "chromium", ...process.argv.slice(2)], {
  stdio: "inherit",
  windowsHide: true,
  env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH ?? browsers },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
