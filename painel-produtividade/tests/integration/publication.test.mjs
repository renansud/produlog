import { it } from "node:test";
import assert from "node:assert/strict";
import { publicationIssue, privateEnvValues } from "../../scripts/publication-policy.mjs";

it("bloqueia arquivos privados e artefatos mesmo quando candidatos ao Git", () => {
  for (const path of ["subaps.txt", "app/.env.local", "app/.env.production", "app/node_modules/a.js", ".tools/a", "app/.vercel/project.json", "app/.next/file", "cert.pem"]) assert.ok(publicationIssue(path, Buffer.from("")));
});
it("permite modelo de configuração e código sem credenciais", () => {
  assert.equal(publicationIssue("app/.env.example", Buffer.from("NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co")), null);
  assert.equal(publicationIssue("app/page.tsx", Buffer.from("export default function Page() {}")), null);
});
it("detecta valores locais copiados e segredos sem incluir valores no diagnóstico", () => {
  for (const value of ["sb_secret_" + "x".repeat(30), "ghp_" + "a".repeat(36), ["-----BEGIN", "PRIVATE KEY-----"].join(" "), "synthetic-local-value-123456789"]) {
    const issue = publicationIssue("notes.txt", Buffer.from(value), ["synthetic-local-value-123456789"]);
    assert.ok(issue);
    assert.ok(!issue.includes(value));
  }
});
it("tolera imagens binárias sem confundir com texto", () => {
  assert.equal(publicationIssue("logo.png", Buffer.from([137, 80, 0, 10])), null);
});

it("detecta valores de ambiente com espaços, export, aspas e comentários sem ecoar credenciais", () => {
  const value = "synthetic-private-url-value-123456789";
  const values = privateEnvValues('export DATABASE_URL = "' + value + '" # comment\nDIRECT_URL = \'another-synthetic-private-value\'');
  const issue = publicationIssue("notes.txt", Buffer.from(value), values);
  assert.ok(issue);
  assert.ok(!issue.includes(value));
  assert.ok(values.includes("another-synthetic-private-value"));
});