import { expect, test, type Locator } from "@playwright/test";
import { chartParityCases } from "../tests/fixtures/chart-parity";

const percent = (value: number) => `${value.toFixed(2).replace(".", ",")}%`;

async function verifyChart(panel: Locator, expected: number[]) {
  const bars = panel.locator(".recharts-bar-rectangle");
  const labels = panel.locator(".recharts-label-list text");
  await expect(bars).toHaveCount(expected.length);
  await expect(labels).toHaveCount(expected.length);
  expect(await labels.allTextContents()).toEqual(expected.map(percent));
  for (let index = 0; index < expected.length; index++) {
    const shape = bars.nth(index).locator("path");
    await expect(shape).toHaveAttribute("fill", "#16a8e6");
    await expect(shape).toHaveAttribute("stroke", "#000000");
    const barBox = await bars.nth(index).boundingBox();
    const labelBox = await labels.nth(index).boundingBox();
    expect(barBox).not.toBeNull();
    expect(labelBox!.y + labelBox!.height).toBeLessThanOrEqual(barBox!.y + 1);
  }
  // Mede apenas as formas, numa mesma leitura SVG; caixas de grupos podem incluir
  // contorno/interação e variar enquanto ResponsiveContainer conclui o layout.
  for (let index = 1; index < expected.length; index++) {
    await expect.poll(async () => {
      const heights = await bars.locator("path.recharts-rectangle").evaluateAll((elements) => elements.map((element) => (element as SVGGraphicsElement).getBBox().height));
      return Math.abs(heights[index] / heights[0] - expected[index] / expected[0]);
    }).toBeLessThan(0.005);
  }
}

for (const reference of chartParityCases) {
  test(`oráculo numérico e especificação visual: ${reference.name}`, async ({ page, request }, testInfo) => {
    for (const [kind, expected] of [["monthly", reference.monthly], ["supervisors", reference.supervisors]] as const) {
      const response = await request.get(`/api/demo/dashboard/${kind}?${reference.query}`);
      expect(response.ok()).toBe(true);
      expect((await response.json()).series.map((point: { rate: number }) => point.rate)).toEqual(expected);
    }
    await page.goto(`/demo?${reference.query}`);
    const monthly = page.getByRole("region", { name: "Performance Mensal", exact: true });
    const supervisors = page.getByRole("region", { name: "Performance Mensal Supervisão", exact: true });
    for (const theme of ["dark", "light"]) {
      if (theme === "light") await page.getByRole("button", { name: "Ativar tema claro" }).click();
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      await verifyChart(monthly, reference.monthly);
      await verifyChart(supervisors, reference.supervisors);
      await expect(monthly.locator(".recharts-line-curve")).toHaveCount(1);
      await expect(supervisors.locator(".recharts-line-curve")).toHaveCount(0);
      await expect(page.getByRole("article", { name: "Evolução", exact: true })).toContainText(percent(reference.evolution));
      for (const panel of [monthly, supervisors]) await expect(panel.locator(".recharts-cartesian-grid, .recharts-yAxis, .recharts-legend-wrapper")).toHaveCount(0);
      if (reference.query === "") {
        await monthly.screenshot({ path: testInfo.outputPath(`monthly-${theme}.png`) });
        await supervisors.screenshot({ path: testInfo.outputPath(`supervisors-${theme}.png`) });
      }
    }
    if (reference.teams.length > 0) {
      await supervisors.getByText("Consultar dados da Performance Mensal Supervisão", { exact: true }).click();
      expect(await supervisors.getByRole("rowheader").allTextContents()).toEqual(reference.teams);
    }
  });
}
