import { expect, test } from "@playwright/test";

const operationB = "10000000-0000-4000-8000-000000000002";
const supervisorB = "20000000-0000-4000-8000-000000000002";

for (const query of ["", "months=2026-07", `operations=${operationB}`, `months=2027-01&operations=${operationB}&supervisors=${supervisorB}`]) {
  test(`gráfico e tabela correspondem ao contrato mensal: ${query || "todos"}`, async ({ page, request }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await request.get(`/api/demo/dashboard/monthly?${query}`);
    expect(response.ok()).toBe(true);
    const monthly = await response.json();
    await page.goto(`/demo?${query}`);
    const panel = page.getByRole("region", { name: "Performance Mensal", exact: true });
    await expect(panel.locator(".recharts-bar-rectangle")).toHaveCount(monthly.series.length);
    await expect(panel.locator(".recharts-line-curve")).toHaveCount(1);
    expect(await panel.locator(".recharts-label-list text").allTextContents()).toEqual(monthly.series.map((point: { rate: number }) => `${point.rate.toFixed(2).replace(".", ",")}%`));
    await expect(panel.locator(".recharts-cartesian-grid, .recharts-legend-wrapper, .recharts-yAxis")).toHaveCount(0);
    await panel.getByText("Consultar dados da Performance Mensal", { exact: true }).click();
    const rows = panel.getByRole("row");
    await expect(rows).toHaveCount(monthly.series.length + 1);
    for (const [index, point] of monthly.series.entries()) {
      const cells = rows.nth(index + 1).getByRole("cell");
      expect(await cells.allTextContents()).toEqual([String(point.technicians), String(point.goalsMet), String(point.unknownGoals), `${point.rate.toFixed(2).replace(".", ",")}%`, `${point.coverage.toFixed(2).replace(".", ",")}%`]);
    }
    // Mesmo com recorte de julho ou mês vazio, junho/julho permanecem no histórico.
    await expect(rows.nth(1)).toContainText("Junho de 2026");
    await expect(rows.nth(2)).toContainText("Julho de 2026");
    expect(errors).toEqual([]);
  });
}

test("tooltip por teclado e tema preservam a série e o layout", async ({ page }, testInfo) => {
  await page.goto("/demo");
  const panel = page.getByRole("region", { name: "Performance Mensal", exact: true });
  const chart = panel.locator("svg.recharts-surface");
  await chart.focus();
  await page.keyboard.press("ArrowRight");
  await expect(panel.locator(".recharts-tooltip-wrapper")).toContainText("de 2026");
  await expect(panel.locator(".recharts-tooltip-wrapper")).toContainText("Cobertura: 100,00%");
  await page.getByRole("button", { name: "Ativar tema claro" }).click();
  await expect(page.locator("html")).toHaveClass(/light/);
  await expect(panel.locator(".recharts-label-list text")).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await panel.screenshot({ path: testInfo.outputPath("monthly-light.png") });
});
