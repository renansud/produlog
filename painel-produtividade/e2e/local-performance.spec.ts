import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("registra navegação, interação e tamanho de respostas da demonstração", async ({ page, request }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const navigation = [];
  const interaction = [];
  const details = page.getByRole("region", { name: "Detalhamento", exact: true });
  for (let sample = 0; sample < 3; sample++) {
    const started = performance.now();
    await page.goto("/demo");
    await expect(page.getByRole("button", { name: "Ativar tema claro" })).toBeVisible();
    await expect(details.locator("tbody tr")).toHaveCount(10);
    await expect(page.locator(".recharts-bar-rectangle")).toHaveCount(4);
    navigation.push({ sample, readyMs: performance.now() - started, timing: await page.evaluate(() => {
      const entry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      return { ttfbMs: entry.responseStart - entry.requestStart, domContentLoadedMs: entry.domContentLoadedEventEnd, transferBytes: entry.transferSize };
    }) });
    await details.getByRole("searchbox").fill("TEC-01");
    const searchStarted = performance.now();
    await details.getByRole("button", { name: "Pesquisar", exact: true }).click();
    await expect(details.locator("tbody tr")).toHaveCount(2);
    await expect(details.getByRole("region", { name: "Conteúdo do detalhamento" })).toHaveAttribute("aria-busy", "false");
    interaction.push({ sample, appliedSearchMs: performance.now() - searchStarted });
    await expect(page.getByRole("article", { name: "Produção total", exact: true })).toContainText("1.500,00");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  const api = [];
  for (const path of ["/api/demo/dashboard/summary", "/api/demo/productivity?pageSize=10", "/api/demo/productivity/export"]) {
    for (let sample = 0; sample < 5; sample++) {
      const started = performance.now();
      const response = await request.get(path);
      const body = await response.body();
      expect(response.status()).toBe(200);
      expect(response.headers()["cache-control"]).toBe("private, no-store");
      if (path.includes("pageSize")) expect((await response.json()).items).toHaveLength(10);
      api.push({ path, sample, responseAndBodyMs: performance.now() - started, bodyBytes: body.byteLength });
    }
  }
  expect(errors).toEqual([]);
  const report = { project: testInfo.project.name, viewport: page.viewportSize(), mode: "development", rows: 15, networkThrottling: false, cpuThrottling: false, navigation, interaction, api };
  const path = testInfo.outputPath("local-performance.json");
  await writeFile(path, JSON.stringify(report, null, 2));
  await testInfo.attach("local-performance", { path, contentType: "application/json" });
});
