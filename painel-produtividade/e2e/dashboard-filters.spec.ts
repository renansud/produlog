import { expect, test } from "@playwright/test";

const operationA = "10000000-0000-4000-8000-000000000001";
const operationB = "10000000-0000-4000-8000-000000000002";
const supervisorA = "20000000-0000-4000-8000-000000000001";

test("Mês atualiza cards, mantém Evolução e persiste ao recarregar", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: /^Mês / }).click();
  const dialog = page.getByRole("dialog", { name: "Selecionar Mês" });
  await dialog.getByRole("textbox", { name: "Pesquisar Mês" }).fill("julho");
  await dialog.getByRole("checkbox", { name: "Julho de 2026" }).check();
  await expect(page).toHaveURL(/months=2026-07/);
  await expect(page.getByRole("region", { name: "Filtros de produtividade" })).toHaveAttribute("aria-busy", "false");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("article", { name: "Produção total", exact: true })).toContainText("800,00");
  await expect(page.getByRole("article", { name: "Evolução", exact: true })).toContainText("-5,36%");
  await page.reload();
  await expect(page.getByRole("button", { name: "Mês Julho de 2026" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Produção total", exact: true })).toContainText("800,00");
});

test("troca de operação remove supervisor incompatível e atualiza opções", async ({ page }) => {
  await page.goto(`/demo?operations=${operationA}&supervisors=${supervisorA}`);
  await page.getByRole("button", { name: /^Operação / }).click();
  let dialog = page.getByRole("dialog", { name: "Selecionar Operação" });
  await dialog.getByRole("checkbox", { name: "Operação Exemplo B" }).check();
  await expect(page.getByRole("region", { name: "Filtros de produtividade" })).toHaveAttribute("aria-busy", "false");
  await dialog.getByRole("checkbox", { name: "Operação Exemplo A" }).uncheck();
  await expect(page).toHaveURL(new RegExp(`operations=${operationB}$`));
  await expect(page.getByRole("region", { name: "Filtros de produtividade" })).toHaveAttribute("aria-busy", "false");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("article", { name: "Produção total", exact: true })).toContainText("700,00");
  await expect(page.getByRole("article", { name: "Evolução", exact: true })).toContainText("-8,33%");
  await page.getByRole("button", { name: /^Supervisor / }).click();
  dialog = page.getByRole("dialog", { name: "Selecionar Supervisor" });
  await expect(dialog.getByRole("checkbox", { name: "Equipe Exemplo B" })).toBeVisible();
  await expect(dialog.getByRole("checkbox", { name: "Equipe Exemplo A" })).toHaveCount(0);
});

test("selecionar tudo, limpar e voltar recuperam o estado da URL", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: /^Mês / }).click();
  const dialog = page.getByRole("dialog", { name: "Selecionar Mês" });
  await dialog.getByRole("button", { name: "Selecionar tudo", exact: true }).click();
  await expect(page).toHaveURL(/months=/);
  await expect(page.getByRole("region", { name: "Filtros de produtividade" })).toHaveAttribute("aria-busy", "false");
  await expect(dialog.getByRole("checkbox", { name: "Junho de 2026" })).toBeChecked();
  await expect(dialog.getByRole("checkbox", { name: "Julho de 2026" })).toBeChecked();
  await dialog.getByRole("button", { name: "Limpar seleção", exact: true }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3000/demo");
  await page.goBack();
  await expect(page.getByRole("button", { name: "Mês 2 selecionados" })).toBeVisible();
});

test("URL incompatível é saneada e filtro inválido não expõe dados", async ({ page }) => {
  await page.goto(`/demo?operations=${operationB}&supervisors=${supervisorA}`);
  await expect(page).toHaveURL(`http://127.0.0.1:3000/demo?operations=${operationB}`);
  await page.goto("/demo?role=ADMIN");
  await expect(page.getByRole("alert", { name: "Filtros não disponíveis" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Produção total", exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Limpar filtros", exact: true }).click();
  await expect(page.getByRole("article", { name: "Produção total", exact: true })).toContainText("1.500,00");
});
