import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/componentes");
  await expect(page.getByRole("heading", { name: "Componentes de interface" })).toBeVisible();
  await expect(page.locator("header").getByRole("img", { name: "Servlog" })).toBeVisible();
  const logo = page.locator("header").getByRole("img", { name: "Servlog" });
  await expect.poll(() => logo.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0)).toBe(true);
  const bounds = await logo.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.width / bounds!.height).toBeCloseTo(1815 / 871, 1);
  await expect(page.locator("header").getByText("Acompanhamento operacional", { exact: true })).toBeVisible();
});

test("diálogo abre pelo teclado e restaura o foco", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Sobre esta demonstração" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Componentes para testar localmente" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("pesquisa, seleciona e restaura os exemplos", async ({ page }) => {
  const combo = page.getByRole("combobox", { name: /Opção de exemplo/ });
  await combo.click();
  const search = page.getByRole("combobox", { name: "Pesquisar opção de exemplo" });
  await search.fill("Exemplo B");
  await search.press("Enter");
  await expect(combo).toContainText("Exemplo B");
  const checkbox = page.getByRole("checkbox", { name: "Experimentar seleção" });
  await checkbox.check();
  await page.getByRole("button", { name: "Opções", exact: true }).click();
  await page.getByRole("menuitem", { name: "Restaurar seleções" }).click();
  await expect(combo).toContainText("Exemplo A");
  await expect(checkbox).not.toBeChecked();
});

test("exibe feedback sem erros e mantém o conteúdo na largura da tela", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.reload();
  await page.getByRole("button", { name: "Testar notificação" }).click();
  await expect(page.getByText("Notificação de demonstração", { exact: true })).toBeVisible();
  await expect(page.getByText("Nenhuma informação foi enviada.", { exact: true })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("preview.png"), fullPage: true });
});
