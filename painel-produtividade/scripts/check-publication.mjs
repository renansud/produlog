import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { publicationIssue } from "./publication-policy.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const result = spawnSync("git", ["-c", `safe.directory=${root.replaceAll("\\", "/").replace(/\/$/, "")}`, "-C", root, "ls-files", "--cached", "--others", "--exclude-standard", "-z"], { encoding: "utf8", windowsHide: true });
if (result.error || result.status !== 0) throw new Error("Não foi possível listar os arquivos candidatos pelo Git.");
const files = [...new Set(result.stdout.split("\0").filter(Boolean))];
const problems = [];
const realValues = [];
try {
  for (const line of readFileSync(resolve(root, "painel-produtividade/.env.local"), "utf8").split(/\r?\n/)) {
    const match = line.match(/^[A-Z][A-Z0-9_]*=(.+)$/);
    if (match && match[1].length >= 20) realValues.push(match[1].replace(/^["']|["']$/g, ""));
  }
} catch { /* O arquivo local não precisa existir no CI. */ }

for (const file of files) {
  const buffer = readFileSync(resolve(root, file));
  const issue = publicationIssue(file, buffer, realValues);
  if (issue) problems.push(`${file}: ${issue}`);
}
if (problems.length) {
  for (const problem of problems) console.error(problem);
  process.exitCode = 1;
} else console.log(`Auditoria local aprovada: ${files.length} arquivos candidatos, sem valores do ambiente local ou padrões de credencial detectados.`);
