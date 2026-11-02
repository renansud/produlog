import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { after, before, describe, it } from "node:test";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const nextBin = fileURLToPath(new URL("../../node_modules/next/dist/bin/next", import.meta.url));
let server;
let origin;
let output = "";
let startupError;

describe("Fronteiras HTTP do build de produção", { timeout: 60_000 }, () => {
  before(async () => {
    await access(new URL("../../.next/BUILD_ID", import.meta.url)).catch(() => {
      throw new Error("Build ausente. Execute npm run build ou npm run check antes de test:http.");
    });

    server = spawn(process.execPath, [nextBin, "start", "--hostname", "127.0.0.1", "--port", "0"], {
      cwd: projectRoot,
      env: { ...process.env, NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    server.on("error", (error) => { startupError = error; });
    for (const stream of [server.stdout, server.stderr]) {
      stream.on("data", (chunk) => {
        output = (output + chunk.toString()).slice(-8_000);
        const address = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
        if (address && Number(address[1]) > 0) origin = address[0];
      });
    }

    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      if (startupError) throw startupError;
      if (server.exitCode !== null) throw new Error(`Servidor encerrou antes dos testes: ${output}`);
      if (origin) {
        try {
          const response = await fetch(origin, { signal: AbortSignal.timeout(2_000) });
          await response.arrayBuffer();
          return;
        } catch { /* Aguarda o servidor aceitar conexões. */ }
      }
      await delay(100);
    }
    throw new Error(`Servidor não iniciou em 30 segundos: ${output}`);
  });

  after(async () => {
    if (!server || server.exitCode !== null || server.signalCode !== null) return;
    const closed = once(server, "close");
    server.kill();
    await closed;
  });

  it("página inicial mostra login sem expor a demonstração", async () => {
    const response = await fetch(origin, { signal: AbortSignal.timeout(5_000) });
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.doesNotMatch(html, /Experimente os componentes|Tabela de demonstração|Sem login real/);
    assert.match(html, /Entre na sua conta/);
  });

  it("responde HEAD sem disponibilizar a demonstração", async () => {
    const response = await fetch(origin, { method: "HEAD", signal: AbortSignal.timeout(5_000) });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "");
  });

  for (const path of ["/demo", "/demo/dados", "/demo/usuarios", "/componentes"]) {
    it(`não disponibiliza a rota ainda não implementada ${path}`, async () => {
      const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(5_000) });
      assert.equal(response.status, 404);
      await response.arrayBuffer();
    });
  }

  for (const path of ["/admin", "/admin/dashboard", "/admin/dados", "/admin/usuarios", "/user", "/user/dashboard", "/dashboard", "/auth/login"]) {
    it(`protege ${path} sem sessão`, async () => {
      const response = await fetch(new URL(path, origin), { redirect: "manual", signal: AbortSignal.timeout(5_000) });
      assert.equal(response.status, 307);
      assert.equal(new URL(response.headers.get("location"), origin).pathname, "/");
      await response.arrayBuffer();
    });
  }

  it("não recebe upload na rota de importação ainda ausente", async () => {
    const missing = await fetch(new URL("/api/v1/imports", origin), { signal: AbortSignal.timeout(5_000) });
    assert.equal(missing.status, 404);
    await missing.arrayBuffer();
    const form = new FormData();
    form.append("file", new Blob(["coluna\r\nexemplo fictício"], { type: "text/csv" }), "exemplo.csv");
    const response = await fetch(new URL("/api/v1/imports", origin), { method: "POST", body: form, signal: AbortSignal.timeout(5_000) });
    // Com Server Actions registradas, Next rejeita multipart sem ação válida com 400.
    assert.equal(response.status, 400);
    assert.equal(response.headers.get("content-disposition"), null);
    assert.doesNotMatch(await response.text(), /exemplo fictício|coluna/);
  });

  it("CSV privado exige autenticação e não envia arquivo em erro", async () => {
    const response = await fetch(new URL("/api/v1/productivity/export?role=ADMIN&page=0", origin));
    assert.equal(response.status, 401);
    assert.equal(response.headers.get("content-disposition"), null);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal((await response.json()).error.code, "UNAUTHORIZED");
  });

  it("CSV demo permanece indisponível em produção", async () => {
    const response = await fetch(new URL("/api/demo/productivity/export", origin));
    assert.equal(response.status, 404);
    assert.equal(response.headers.get("content-disposition"), null);
    assert.equal((await response.json()).error.code, "NOT_FOUND");
  });

  it("HEAD do CSV privado não devolve arquivo e POST não é suportado", async () => {
    const response = await fetch(new URL("/api/v1/productivity/export", origin), { method: "HEAD" });
    assert.equal(response.status, 401);
    assert.equal(response.headers.get("content-disposition"), null);
    assert.equal(await response.text(), "");
    const post = await fetch(new URL("/api/v1/productivity/export", origin), { method: "POST" });
    assert.equal(post.status, 405);
    await post.arrayBuffer();
  });

  it("bloqueia o detalhamento privado sem sessão, mesmo com parâmetros de permissão", async () => {
    const response = await fetch(new URL("/api/v1/productivity?role=ADMIN&pageSize=101", origin));
    assert.equal(response.status, 401);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.deepEqual(await response.json(), { error: { code: "UNAUTHORIZED", message: "Autenticação necessária." } });
  });

  it("não disponibiliza detalhamento demo em produção", async () => {
    const response = await fetch(new URL("/api/demo/productivity", origin));
    assert.equal(response.status, 404);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal((await response.json()).error.code, "NOT_FOUND");
  });

  it("HEAD privado preserva bloqueio e não devolve linhas", async () => {
    const response = await fetch(new URL("/api/v1/productivity", origin), { method: "HEAD" });
    assert.equal(response.status, 401);
    assert.equal(await response.text(), "");
  });

  it("detalhamento não aceita mutações", async () => {
    const response = await fetch(new URL("/api/v1/productivity", origin), { method: "POST" });
    assert.equal(response.status, 405);
    await response.arrayBuffer();
  });

  for (const kind of ["summary", "monthly", "supervisors", "filters"]) {
    it(`bloqueia o endpoint privado ${kind} sem autenticação real`, async () => {
      const response = await fetch(new URL(`/api/v1/dashboard/${kind}?role=ADMIN`, origin));
      assert.equal(response.status, 401);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
      assert.deepEqual(await response.json(), { error: { code: "UNAUTHORIZED", message: "Autenticação necessária." } });
    });
    it(`não disponibiliza o endpoint demo ${kind} em produção`, async () => {
      const response = await fetch(new URL(`/api/demo/dashboard/${kind}`, origin));
      assert.equal(response.status, 404);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
      assert.equal((await response.json()).error.code, "NOT_FOUND");
    });
  }
});
