import { expect, test } from "@playwright/test";

test("limpar pesquisa preserva ordem e tamanho e restaura o estado ao voltar", async ({ page }) => {
  await page.goto("/demo?search=TEC-01&sort=technician&direction=asc&pageSize=1&page=2");
  await expect(page.getByRole("button", { name: "Ativar tema claro" })).toBeVisible();
  await page.getByRole("button", { name: "Limpar filtros", exact: true }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("");
  const params = new URL(page.url()).searchParams;
  expect(params.has("search")).toBe(false);
  expect(params.has("page")).toBe(false);
  expect(params.get("sort")).toBe("technician");
  expect(params.get("pageSize")).toBe("1");
  await page.reload();
  await expect(page.getByRole("searchbox")).toHaveValue("");
  await page.goBack();
  await expect(page.getByRole("searchbox")).toHaveValue("TEC-01");
  expect(new URL(page.url()).searchParams.get("page")).toBe("2");
});

test("supervisor incompatível é removido sem perder pesquisa e ordem", async ({ page }) => {
  await page.goto("/demo?operations=10000000-0000-4000-8000-000000000001&supervisors=20000000-0000-4000-8000-000000000002&search=TEC-01&sort=technician&direction=asc&pageSize=1&page=9");
  await expect(page.getByRole("searchbox")).toHaveValue("TEC-01");
  const params = new URL(page.url()).searchParams;
  expect(params.has("supervisors")).toBe(false);
  expect(params.has("page")).toBe(false);
  expect(params.get("sort")).toBe("technician");
  expect(params.get("pageSize")).toBe("1");
  await expect(page.getByRole("status", { name: "Resultados do detalhamento" })).toContainText("1–1 de 2");
});

test("navegação descarta rascunho de pesquisa sem alterar o texto aplicado", async ({ page }) => {
  await page.goto("/demo?search=TEC-01&pageSize=1");
  await expect(page.getByRole("button", { name: "Ativar tema claro" })).toBeVisible();
  await page.getByRole("searchbox").fill("rascunho");
  await page.getByRole("button", { name: "Próxima página", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByRole("searchbox")).toHaveValue("TEC-01");
  await expect(page.getByRole("region", { name: "Detalhamento", exact: true }).locator("tbody")).toContainText("TEC-01");
});
