import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const operationA = "10000000-0000-4000-8000-000000000001";
test("download reflete filtros/pesquisa/ordem e inclui todas as páginas", async ({ page }) => {
  await page.goto(`/demo?months=2026-07&operations=${operationA}&search=tec-0&sort=technician&direction=desc&pageSize=2&page=2`);
  await expect(page.getByRole("button", { name: "Ativar tema claro" })).toBeVisible();
  const details = page.getByRole("region", { name: "Detalhamento", exact: true });
  await expect(details.locator("tbody tr")).toHaveCount(2);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar CSV", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("servlog-produtividade-demo.csv");
  const bytes = await readFile((await download.path())!);
  expect(Array.from(bytes.subarray(0, 3))).toEqual([239, 187, 191]);
  const csv = bytes.toString("utf8");
  const lines = csv.split("\r\n").filter(Boolean);
  expect(lines).toHaveLength(5);
  expect(lines[0]).toBe('\uFEFF"Mês";"Supervisor";"Técnico";"Contrato";"Produção";"Meta Batida"');
  expect(lines.slice(1).map((line) => line.match(/TEC-\d+/)?.[0])).toEqual(["TEC-04", "TEC-03", "TEC-02", "TEC-01"]);
  expect(csv).not.toContain("Equipe Exemplo B");
  expect(csv).not.toContain("Junho");
  expect(csv).toContain('"00004";"100,00";"Não"');
  await expect(page).toHaveURL(/page=2/);
});

test("endpoint CSV ignora paginação válida, mantém escopo e retorna erro sem anexo", async ({ request }) => {
  const first = await request.get("/api/demo/productivity/export?page=99&pageSize=1");
  expect(first.status()).toBe(200);
  expect(first.headers()["cache-control"]).toBe("private, no-store");
  expect(first.headers()["x-servlog-demo"]).toBe("synthetic");
  expect((await first.body()).toString("utf8").split("\r\n").filter(Boolean)).toHaveLength(16);
  expect((await request.get("/api/v1/productivity/export?role=ADMIN")).status()).toBe(401);
  for (const query of ["role=ADMIN", "page=0", "sort=operation"]) {
    const response = await request.get(`/api/demo/productivity/export?${query}`);
    expect(response.status()).toBe(400);
    expect(response.headers()["content-disposition"]).toBeUndefined();
  }
  expect((await request.get("/api/demo/productivity/export?operations=10000000-0000-4000-8000-000000000099")).status()).toBe(403);
  expect((await request.get("/api/demo/productivity/export", { headers: { origin: "https://externo.example" } })).status()).toBe(403);
});

test("falha de exportação é visível e permite tentar novamente sem arquivo inválido", async ({ page }) => {
  await page.goto("/demo?pageSize=2");
  await expect(page.getByRole("button", { name: "Ativar tema claro" })).toBeVisible();
  const routePattern = "**/api/demo/productivity/export?**";
  await page.route(routePattern, (route) => route.fulfill({ status: 500, contentType: "application/json", body: '{"error":"conteúdo fictício restrito"}' }));
  await page.getByRole("button", { name: "Exportar CSV", exact: true }).click();
  await expect(page.getByRole("alert", { name: "Estado da exportação" })).toContainText("Não foi possível exportar");
  await expect(page.getByText("conteúdo fictício restrito")).toHaveCount(0);
  await page.unroute(routePattern);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar CSV", exact: true }).click();
  expect((await download).suggestedFilename()).toContain(".csv");
});
