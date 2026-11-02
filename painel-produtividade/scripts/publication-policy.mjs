export function publicationIssue(file, buffer, realValues = []) {
  const parts = file.replaceAll("\\", "/").split("/");
  const name = parts.at(-1);
  if ((name.startsWith(".env") && name !== ".env.example") || name === "subaps.txt" || parts.some((part) => ["node_modules", ".next", ".vercel", ".tools", "test-results", "playwright-report", "coverage"].includes(part)) || /\.(pem|key|pfx|p12)$/i.test(name)) return "arquivo local/credencial não publicável";
  if (buffer.includes(0)) return null;
  const text = buffer.toString("utf8");
  if (realValues.filter((value) => value.length >= 20).some((value) => text.includes(value)) || /sb_secret_[A-Za-z0-9_-]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}/.test(text)) return "possível credencial ou valor do ambiente local";
  return null;
}
