import { expect, test } from "@playwright/test";

test("tema começa escuro, alterna e persiste sem alterar filtros ou valores", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/demo?months=2026-07");
  await expect(page.locator("html")).toHaveClass(/dark/);
  const total = page.getByRole("article", { name: "Produção total", exact: true });
  await expect(total).toContainText("800,00");
  await page.getByRole("button", { name: "Ativar tema claro" }).click();
  await expect(page.locator("html")).toHaveClass(/light/);
  expect(await page.evaluate(() => localStorage.getItem("servlog-theme"))).toBe("light");
  await expect(page).toHaveURL(/months=2026-07/);
  await expect(total).toContainText("800,00");
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/light/);
  await expect(page.getByRole("button", { name: "Ativar tema escuro" })).toBeVisible();
  await page.getByRole("button", { name: /^Operação / }).click();
  await expect(page.getByRole("dialog", { name: "Selecionar Operação" })).toBeVisible();
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.screenshot({ path: testInfo.outputPath("light.png"), fullPage: true });
  await page.getByRole("button", { name: "Ativar tema escuro" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(total).toContainText("800,00");
  expect(errors).toEqual([]);
});

test("atualizar faz nova requisição ao servidor preservando o recorte", async ({ page }) => {
  await page.goto("/demo?months=2026-07");
  const refreshed = page.waitForRequest((request) => request.headers()["rsc"] === "1" && new URL(request.url()).searchParams.get("months") === "2026-07");
  await page.getByRole("button", { name: "Atualizar dados" }).click();
  await refreshed;
  await expect(page.getByRole("button", { name: "Atualizar dados" })).not.toHaveAttribute("aria-busy", "true");
  await expect(page).toHaveURL(/months=2026-07/);
  await expect(page.getByRole("article", { name: "Produção total", exact: true })).toContainText("800,00");
});

test("limpar remove todos os filtros e permite exportar o conjunto completo", async ({ page }) => {
  await page.goto("/demo?months=2026-07&operations=10000000-0000-4000-8000-000000000002&supervisors=20000000-0000-4000-8000-000000000002");
  const clear = page.getByRole("button", { name: "Limpar filtros", exact: true });
  await clear.click();
  await expect(page).toHaveURL("http://127.0.0.1:3000/demo");
  await expect(page.getByRole("article", { name: "Produção total", exact: true })).toContainText("1.500,00");
  await expect(clear).toHaveAttribute("aria-disabled", "true");
  const exportButton = page.getByRole("button", { name: "Exportar CSV", exact: true });
  await expect(exportButton).not.toHaveAttribute("aria-disabled", "true");
  await exportButton.focus();
  await expect(page.getByRole("tooltip")).toContainText("Exportar todos os registros");
  const download = page.waitForEvent("download");
  await exportButton.press("Enter");
  expect((await download).suggestedFilename()).toBe("servlog-produtividade-demo.csv");
});
