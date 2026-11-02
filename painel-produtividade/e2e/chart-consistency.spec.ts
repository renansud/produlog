import { expect, test } from "@playwright/test";

for (const theme of ["dark", "light"]) {
  for (const width of [320, 768, 1280]) {
    test(`${theme}: tooltips e rótulos dos dois gráficos em ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((value) => localStorage.setItem("servlog-theme", value), theme);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/demo");
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      for (const size of ["100%", "200%"]) {
        await page.evaluate((value) => { document.documentElement.style.fontSize = value; }, size);
        for (const title of ["Performance Mensal", "Performance Mensal Supervisão"]) {
          const panel = page.getByRole("region", { name: title, exact: true });
          const chart = panel.locator("svg.recharts-surface");
          await chart.focus();
          await page.keyboard.press("ArrowRight");
          await page.keyboard.press("ArrowRight");
          const tooltip = panel.locator(".recharts-tooltip-wrapper");
          await expect(tooltip).toBeVisible();
          await expect(tooltip).toContainText("Cobertura: 100,00%");
          const box = await tooltip.boundingBox();
          expect(box).not.toBeNull();
          expect(box!.x).toBeGreaterThanOrEqual(0);
          expect(box!.x + box!.width).toBeLessThanOrEqual(width);
          // O tooltip deve caber na área visível do painel, mesmo com gráfico rolável.
          const panelBox = await panel.boundingBox();
          expect(box!.x).toBeGreaterThanOrEqual(panelBox!.x);
          expect(box!.x + box!.width).toBeLessThanOrEqual(panelBox!.x + panelBox!.width);
          expect(await tooltip.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
          const colors = await tooltip.evaluate((element) => {
            const content = element.firstElementChild!;
            const style = getComputedStyle(content);
            const probe = document.createElement("span");
            probe.style.color = "var(--popover-foreground)";
            probe.style.backgroundColor = "var(--popover)";
            document.body.append(probe);
            const expected = getComputedStyle(probe);
            const result = { foreground: style.color, background: style.backgroundColor, expectedForeground: expected.color, expectedBackground: expected.backgroundColor };
            probe.remove();
            return result;
          });
          expect(colors.foreground).toBe(colors.expectedForeground);
          expect(colors.background).toBe(colors.expectedBackground);
          const originalTitle = await tooltip.locator("p").first().textContent();
          await tooltip.locator("p").first().evaluate((element) => { element.textContent = "EquipeSintetica".repeat(12); });
          expect(await tooltip.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
          await tooltip.locator("p").first().evaluate((element, value) => { element.textContent = value; }, originalTitle);
          await page.keyboard.press("Escape");
          await expect(tooltip).not.toBeVisible();
          await expect(chart).toBeFocused();
          // Reabre em outra referência depois de dispensar com Escape.
          await page.keyboard.press("ArrowLeft");
          await expect(tooltip).toBeVisible();
          expect(await panel.locator(".recharts-label-list text").count()).toBe(2);
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        }
      }
      expect(errors).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`${theme}-${width}-charts.png`), fullPage: true });
    });
  }
}

test("mouse e alternância de tema mantêm os tooltips e os valores coerentes", async ({ page }) => {
  await page.goto("/demo");
  for (const title of ["Performance Mensal", "Performance Mensal Supervisão"]) {
    const panel = page.getByRole("region", { name: title, exact: true });
    await expect(panel.locator(".recharts-label-list text")).toHaveCount(2);
    const labels = await panel.locator(".recharts-label-list text").allTextContents();
    const bar = panel.locator(".recharts-bar-rectangle").first();
    await bar.hover();
    await expect(panel.locator(".recharts-tooltip-wrapper")).toBeVisible();
    await expect(panel.locator(".recharts-tooltip-wrapper")).toContainText(labels[0]);
    await page.getByRole("button", { name: /Ativar tema (claro|escuro)/ }).click();
    expect(await panel.locator(".recharts-label-list text").allTextContents()).toEqual(labels);
    await bar.hover();
    await expect(panel.locator(".recharts-tooltip-wrapper")).toContainText(labels[0]);
  }
});
