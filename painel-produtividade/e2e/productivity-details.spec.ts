import { expect, test, type Page } from "@playwright/test";

const panel = (page: Page) => page.getByRole("region", { name: "Detalhamento", exact: true });
const rows = (page: Page) => panel(page).locator("tbody tr");
const header = (page: Page, label: string) => panel(page).getByRole("columnheader").filter({ has: page.getByRole("button", { name: `Ordenar por ${label}`, exact: true }) });
async function open(page: Page, query = "") {
  await page.goto(`/demo${query ? `?${query}` : ""}`);
  await expect(page.getByRole("button", { name: "Ativar tema claro" })).toBeVisible();
}

test("controles cabem no painel em 320px com fonte a 200%", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await open(page, "pageSize=5");
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  const bounds = await panel(page).boundingBox();
  const controls = await panel(page).locator("form button, nav button, input, select").evaluateAll((elements) => elements.map((element) => ({ label: element.textContent || element.getAttribute("aria-label") || element.tagName, left: element.getBoundingClientRect().left, right: element.getBoundingClientRect().right, fits: element.scrollWidth <= element.clientWidth })));
  for (const control of controls) {
    expect(control.left, control.label).toBeGreaterThanOrEqual(bounds!.x);
    expect(control.right, control.label).toBeLessThanOrEqual(bounds!.x + bounds!.width);
    expect(control.fits, control.label).toBe(true);
  }
  await panel(page).screenshot({ path: testInfo.outputPath("details-320-text-200.png") });
});

test("tabela mostra seis colunas, dez registros e dados iguais à API", async ({ page, request }) => {
  await open(page);
  const body = await (await request.get("/api/demo/productivity?pageSize=10")).json();
  await expect(panel(page).getByRole("columnheader")).toHaveCount(6);
  await expect(rows(page)).toHaveCount(10);
  await expect(header(page, "Mês")).toHaveAttribute("aria-sort", "descending");
  for (const [index, row] of body.items.entries()) {
    await expect(rows(page).nth(index)).toContainText(row.technician);
    await expect(rows(page).nth(index)).toContainText(row.contract);
    await expect(rows(page).nth(index)).toContainText("100,00");
    await expect(rows(page).nth(index)).toContainText(row.goalMet === null ? "—" : row.goalMet ? "Sim" : "Não");
  }
  await expect(panel(page).getByRole("status", { name: "Resultados do detalhamento" })).toContainText("1–10 de 15");
});

test("cabeçalho funciona por teclado, reinicia página e persiste ao recarregar/voltar", async ({ page }) => {
  await open(page, "months=2026-07&pageSize=5&page=2");
  const sort = panel(page).getByRole("button", { name: "Ordenar por Técnico" });
  await sort.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/sort=technician/);
  await expect(header(page, "Técnico")).toHaveAttribute("aria-sort", "ascending");
  expect(new URL(page.url()).searchParams.has("page")).toBe(false);
  await expect(rows(page).first()).toContainText("TEC-01");
  await sort.click();
  await expect(header(page, "Técnico")).toHaveAttribute("aria-sort", "descending");
  await expect(rows(page).first()).toContainText("TEC-08");
  await page.reload();
  await expect(rows(page).first()).toContainText("TEC-08");
  await page.goBack();
  await expect(rows(page).first()).toContainText("TEC-01");
});

test("pesquisa e paginação preservam indicadores e usam contagens do servidor", async ({ page }) => {
  await open(page, "pageSize=5&page=2");
  await panel(page).getByRole("searchbox").fill("TEC-01");
  await panel(page).getByRole("button", { name: "Pesquisar", exact: true }).click();
  await expect(page).toHaveURL(/search=TEC-01/);
  await expect(rows(page)).toHaveCount(2);
  await expect(page.getByRole("article", { name: "Produção total", exact: true })).toContainText("1.500,00");
  await panel(page).getByRole("searchbox").fill("inexistente");
  await panel(page).getByRole("button", { name: "Pesquisar", exact: true }).click();
  await expect(panel(page)).toContainText("Nenhum registro encontrado");
  await panel(page).getByRole("button", { name: "Limpar pesquisa", exact: true }).click();
  await expect(rows(page)).toHaveCount(5);
  await panel(page).getByRole("combobox", { name: "Linhas por página" }).selectOption("10");
  await expect(rows(page)).toHaveCount(10);
  await panel(page).getByRole("button", { name: "Próxima página" }).click();
  await expect(rows(page)).toHaveCount(5);
  await expect(panel(page).getByRole("status", { name: "Resultados do detalhamento" })).toContainText("11–15 de 15");
});

test("filtro global preserva pesquisa e ordem e reinicia apenas a página", async ({ page }) => {
  await open(page, "search=TEC-01&pageSize=1&page=2&sort=technician&direction=asc");
  await page.getByRole("button", { name: /^Mês / }).click();
  await page.getByRole("dialog", { name: "Selecionar Mês" }).getByRole("checkbox", { name: "Julho de 2026" }).check();
  await expect(page.getByRole("region", { name: "Filtros de produtividade" })).toHaveAttribute("aria-busy", "false");
  await page.keyboard.press("Escape");
  await expect(rows(page)).toHaveCount(1);
  expect(new URL(page.url()).searchParams.get("search")).toBe("TEC-01");
  expect(new URL(page.url()).searchParams.get("sort")).toBe("technician");
  expect(new URL(page.url()).searchParams.get("pageSize")).toBe("1");
  expect(new URL(page.url()).searchParams.has("page")).toBe(false);
  await expect(page.getByRole("article", { name: "Produção total", exact: true })).toContainText("800,00");
});

test("parâmetro inválido isola o erro da tabela e página excedida permite retorno", async ({ page }) => {
  await open(page, "sort=inválido");
  await expect(panel(page).getByRole("alert", { name: "Parâmetros do detalhamento inválidos" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Produção total", exact: true })).toContainText("1.500,00");
  await panel(page).getByRole("link", { name: "Redefinir detalhamento" }).click();
  await expect(rows(page)).toHaveCount(10);
  await open(page, "page=999&pageSize=5");
  await expect(panel(page)).toContainText("Esta página não possui registros");
  await panel(page).getByRole("button", { name: "Primeira página" }).click();
  await expect(rows(page)).toHaveCount(5);
});

test("transição mostra skeleton e tema/rolagem preservam os valores", async ({ page }, testInfo) => {
  await open(page, "pageSize=5");
  let release = () => {};
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/*", async (route) => {
    const request = route.request();
    if (request.headers()["rsc"] === "1" && new URL(request.url()).searchParams.get("sort") === "technician") await gate;
    await route.continue();
  });
  const click = panel(page).getByRole("button", { name: "Ordenar por Técnico" }).click();
  try {
    await expect(panel(page).getByRole("region", { name: "Conteúdo do detalhamento" })).toHaveAttribute("aria-busy", "true");
    await expect(panel(page).locator("tbody .animate-pulse")).toHaveCount(3);
    await expect(page.getByRole("region", { name: "Filtros de produtividade" })).toHaveAttribute("aria-busy", "true");
  } finally { release(); }
  await click;
  await expect(panel(page).getByRole("region", { name: "Conteúdo do detalhamento" })).toHaveAttribute("aria-busy", "false");
  const values = await rows(page).allTextContents();
  await panel(page).screenshot({ path: testInfo.outputPath("details-dark.png") });
  await page.getByRole("button", { name: "Ativar tema claro" }).click();
  expect(await rows(page).allTextContents()).toEqual(values);
  const scroll = panel(page).getByRole("region", { name: "Tabela de produtividade com rolagem horizontal" });
  await scroll.focus();
  if (await scroll.evaluate((element) => element.scrollWidth > element.clientWidth)) {
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => scroll.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await panel(page).screenshot({ path: testInfo.outputPath("details-light.png") });
});
