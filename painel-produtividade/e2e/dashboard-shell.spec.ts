import { expect, test } from "@playwright/test";

test("dashboard apresenta indicadores fictícios e estrutura responsiva", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/demo");
  await expect(page.getByRole("heading", { level: 1, name: "Dashboard de Produtividade" })).toBeVisible();
  await expect(page.getByText("Ambiente local · Sem login real")).toBeVisible();
  const indicators = page.getByRole("region", { name: "Indicadores de produtividade" });
  await expect(indicators.getByRole("article")).toHaveCount(4);
  await expect(indicators.getByRole("article", { name: "Técnicos", exact: true })).toContainText("8");
  await expect(indicators.getByRole("article", { name: "Evolução", exact: true })).toContainText("-5,36%");
  await expect(indicators.getByRole("article", { name: "Média de produção", exact: true })).toContainText("100,00");
  await expect(indicators.getByRole("article", { name: "Produção total", exact: true })).toContainText("1.500,00");
  await expect(page.getByRole("region", { name: "Performance Mensal", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Performance Mensal Supervisão", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("dashboard.png"), fullPage: true });
});

test("navegação conecta dashboard e galeria e indica a página atual", async ({ page }) => {
  await page.goto("/demo");
  const nav = page.getByRole("navigation", { name: "Navegação da demonstração" });
  await expect(nav.getByRole("link", { name: "Dashboard", exact: true })).toHaveAttribute("aria-current", "page");
  await nav.getByRole("link", { name: "Componentes", exact: true }).click();
  await expect(page).toHaveURL(/\/componentes$/);
  await expect(page.getByRole("heading", { name: "Componentes de interface", exact: true })).toBeVisible();
  await page.getByRole("navigation").getByRole("link", { name: "Dashboard", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Dashboard de Produtividade", exact: true })).toBeVisible();
});
