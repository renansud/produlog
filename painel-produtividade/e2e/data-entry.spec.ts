import { expect, test } from "@playwright/test";
import { entryWorkbook } from "../tests/fixtures/entry-workbook";
import { ENTRY_HEADERS } from "../modules/imports/domain/data-entry";

test("formulário confere, aponta erros e invalida prévia ao editar", async ({ page }) => {
  await page.goto("/demo/dados");
  await page.getByRole("button", { name: "Conferir registro" }).click();
  await expect(page.getByText("Corrija os campos indicados")).toBeVisible();
  await page.getByLabel("Mês *", { exact: true }).fill("2026-07");
  await page.getByLabel("Operação *").fill("Operação teste");
  await page.getByLabel("Supervisor *").fill("Supervisor teste");
  await page.getByLabel("Técnico *").fill("Técnico teste");
  await page.getByLabel("Contrato *").fill("00001");
  await page.getByLabel("Produção *").fill("1.234,50");
  await page.getByLabel("Meta batida", { exact: true }).selectOption("SIM");
  await page.getByRole("button", { name: "Conferir registro" }).click();
  await expect(page.getByRole("cell", { name: "00001", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "1234,50", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviar dados (em breve)" })).toBeDisabled();
  await page.getByLabel("Produção *").fill("2");
  await expect(page.getByText("Conferência concluída · Nenhum dado salvo")).toHaveCount(0);
  await page.getByRole("button", { name: "Limpar formulário" }).click();
  await expect(page.getByLabel("Contrato *")).toHaveValue("");
});

test("CSV oferece modelo, erro por linha e limpa resultados entre modos sem upload", async ({ page }) => {
  const uploads: string[] = [];
  page.on("request", (request) => { if (["POST", "PUT"].includes(request.method())) uploads.push(request.url()); });
  await page.goto("/demo/dados");
  await page.getByRole("tab", { name: "Planilha", exact: true }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Baixar modelo CSV" }).click();
  expect((await download).suggestedFilename()).toBe("modelo-produtividade.csv");
  await page.getByLabel("Arquivo da planilha *").setInputFiles({ name: "teste.csv", mimeType: "text/csv", buffer: Buffer.from(`${ENTRY_HEADERS.join(";")}\r\nJul;Operação teste;Supervisor teste;Técnico teste;00001;1.234,50;SIM;;\r\nJul;Operação teste;Supervisor teste;Técnico teste;00002;10,00;talvez;;`) });
  await page.getByLabel("Ano de referência (opcional)").fill("2025");
  await page.getByRole("button", { name: "Conferir planilha" }).click();
  await expect(page.getByRole("cell", { name: "2025-07" })).toBeVisible();
  await expect(page.getByText(/Linha 3 · Meta batida/)).toBeVisible();
  await page.getByRole("tab", { name: "Formulário", exact: true }).click();
  await expect(page.getByRole("table")).toHaveCount(0);
  expect(uploads).toEqual([]);
});

test("Excel preserva decimal e contrato textual; contrato numérico exige correção", async ({ page }) => {
  await page.goto("/demo/dados");
  await page.getByRole("tab", { name: "Planilha", exact: true }).click();
  const upload = async (numericContract: boolean) => {
    await page.getByLabel("Arquivo da planilha *").setInputFiles({ name: "teste.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer: entryWorkbook({ numericContract }) });
    await page.getByRole("button", { name: "Conferir planilha" }).click();
  };
  await upload(false);
  await expect(page.getByRole("cell", { name: "1234,50", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "00001", exact: true })).toBeVisible();
  await upload(true);
  await expect(page.getByText(/Linha 2 · Linha:.*Contrato deve ser texto/)).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
});

test("duas entradas acessíveis em mobile, tablet e desktop, dois temas e texto ampliado", async ({ page }) => {
  await page.goto("/demo/dados");
  for (const width of [320, 768, 1280]) for (const theme of ["light", "dark"]) for (const scale of ["100%", "200%"]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(({ theme, scale }) => { document.documentElement.classList.toggle("dark", theme === "dark"); document.documentElement.classList.toggle("light", theme === "light"); document.documentElement.style.fontSize = scale; }, { theme, scale });
    for (const mode of ["Formulário", "Planilha"]) {
      await page.getByRole("tab", { name: mode, exact: true }).click();
      await expect(page.getByRole("button", { name: mode === "Formulário" ? "Conferir registro" : "Conferir planilha" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}, ${theme}, ${scale}, ${mode}`).toBe(true);
    }
  }
});

test("tabela de prévia mantém rolagem própria por teclado com texto ampliado", async ({ page }) => {
  await page.goto("/demo/dados");
  await page.getByRole("tab", { name: "Planilha", exact: true }).click();
  await page.getByLabel("Arquivo da planilha *").setInputFiles({ name: "teste.csv", mimeType: "text/csv", buffer: Buffer.from(`${ENTRY_HEADERS.join(";")}\n2026-07;Operação teste;Supervisor teste;Técnico teste;00001;1.234,50;SIM;;`) });
  await page.getByRole("button", { name: "Conferir planilha" }).click();
  const region = page.getByRole("region", { name: /^Registros conferidos/ });
  await expect(region).toBeVisible();
  for (const width of [320, 768, 1280]) for (const theme of ["light", "dark"]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate((theme) => { document.documentElement.classList.toggle("dark", theme === "dark"); document.documentElement.classList.toggle("light", theme === "light"); document.documentElement.style.fontSize = "200%"; }, theme);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 320, height: 900 });
  await region.focus();
  await region.press("ArrowRight");
  await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
});
