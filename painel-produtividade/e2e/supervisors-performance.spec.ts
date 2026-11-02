import { expect, test } from "@playwright/test";

const operationB = "10000000-0000-4000-8000-000000000002";
const supervisorB = "20000000-0000-4000-8000-000000000002";
for (const query of ["", "months=2026-07", `operations=${operationB}`, `supervisors=${supervisorB}`, "months=2027-01"]) {
  test(`supervisão corresponde à API: ${query || "todos"}`, async ({ page, request }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await request.get(`/api/demo/dashboard/supervisors?${query}`);
    expect(response.ok()).toBe(true);
    const data = await response.json();
    await page.goto(`/demo?${query}`);
    const panel = page.getByRole("region", { name: "Performance Mensal Supervisão", exact: true });
    if (data.series.length === 0) {
      await expect(panel.getByRole("status", { name: "Sem resultados de supervisão" })).toBeVisible();
      await expect(panel.locator("svg")).toHaveCount(0);
      // Somente o gráfico mensal ignora Mês.
      await expect(page.getByRole("region", { name: "Performance Mensal", exact: true }).locator(".recharts-bar-rectangle")).toHaveCount(2);
    } else {
      await expect(panel.locator(".recharts-bar-rectangle")).toHaveCount(data.series.length);
      expect(await panel.locator(".recharts-label-list text").allTextContents()).toEqual(data.series.map((point: { rate: number }) => `${point.rate.toFixed(2).replace(".", ",")}%`));
      await expect(panel.locator(".recharts-line, .recharts-cartesian-grid, .recharts-yAxis, .recharts-legend-wrapper")).toHaveCount(0);
      await panel.getByText("Consultar dados da Performance Mensal Supervisão", { exact: true }).click();
      const rows = panel.getByRole("row");
      await expect(rows).toHaveCount(data.series.length + 1);
      for (const [index, point] of data.series.entries()) {
        await expect(rows.nth(index + 1).getByRole("rowheader")).toHaveText(point.supervisor);
        expect(await rows.nth(index + 1).getByRole("cell").allTextContents()).toEqual([String(point.technicianMonths), String(point.goalsMet), String(point.unknownGoals), `${point.rate.toFixed(2).replace(".", ",")}%`, `${point.coverage.toFixed(2).replace(".", ",")}%`]);
      }
    }
    expect(errors).toEqual([]);
  });
}

test("tooltip de supervisão por teclado e tema claro preservam o recorte", async ({ page }, testInfo) => {
  await page.goto("/demo?months=2026-07");
  const panel = page.getByRole("region", { name: "Performance Mensal Supervisão", exact: true });
  await panel.locator("svg.recharts-surface").focus();
  await page.keyboard.press("ArrowRight");
  await expect(panel.locator(".recharts-tooltip-wrapper")).toContainText("técnicos-mês");
  await expect(panel.locator(".recharts-tooltip-wrapper")).toContainText("Cobertura: 100,00%");
  await page.getByRole("button", { name: "Ativar tema claro" }).click();
  await expect(page).toHaveURL(/months=2026-07/);
  expect(await panel.locator(".recharts-label-list text").allTextContents()).toEqual(["50,00%", "25,00%"]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await panel.screenshot({ path: testInfo.outputPath("supervisors-light.png") });
});
