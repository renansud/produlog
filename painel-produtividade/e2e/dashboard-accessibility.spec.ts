import { expect, test } from "@playwright/test";

test("atalho de conteúdo, filtros e tabela funcionam por teclado", async ({ page }) => {
  await page.goto("/demo");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Pular para o conteúdo" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await page.keyboard.press("Tab");
  const trigger = page.getByRole("button", { name: "Mês Todos" });
  await expect(trigger).toBeFocused();
  expect(await trigger.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe("none");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("textbox", { name: "Pesquisar Mês" })).toBeFocused();
  await page.keyboard.press("Tab"); // Selecionar tudo; limpar está desabilitado.
  await page.keyboard.press("Tab");
  const june = page.getByRole("checkbox", { name: "Junho de 2026" });
  await expect(june).toBeFocused();
  await page.keyboard.press("Space");
  await expect(june).toBeChecked();
  await expect(page.getByRole("region", { name: "Filtros de produtividade" })).toHaveAttribute("aria-busy", "false");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Mês Junho de 2026" })).toBeFocused();
  const table = page.getByRole("region", { name: "Tabela de produtividade com rolagem horizontal" });
  await table.focus();
  await expect(table).toBeFocused();
  await expect(table).toHaveCSS("outline-style", "solid");
  if (await table.evaluate((element) => element.scrollWidth > element.clientWidth)) {
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => table.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  }
});

for (const theme of ["dark", "light"] as const) {
  for (const width of [320, 768, 1280]) {
    test(`${theme}: reflow em ${width}px e texto ampliado`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((value) => localStorage.setItem("servlog-theme", value), theme);
      await page.goto("/demo");
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
      expect(await fits()).toBe(true);
      await page.getByRole("button", { name: /^Operação / }).click();
      const dialog = page.getByRole("dialog", { name: "Selecionar Operação" });
      const bounds = await dialog.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      await page.keyboard.press("Escape");
      await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
      expect(await fits()).toBe(true);
      await page.getByRole("button", { name: /^Operação / }).click();
      expect(await fits()).toBe(true);
      expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      await page.keyboard.press("Escape");
      await expect(page.getByRole("article", { name: "Produção total", exact: true })).toContainText("1.500,00");
      await page.screenshot({ path: testInfo.outputPath(`${theme}-${width}-text-200.png`), fullPage: true });
    });
  }

  test(`${theme}: contraste dos tokens de texto e sinal dos indicadores`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem("servlog-theme", value), theme);
    await page.goto("/demo");
    await expect(page.locator("html")).toHaveClass(new RegExp(theme));
    const ratios = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d", { willReadFrequently: true })!;
      const rgb = (color: string) => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        return Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
      };
      const luminance = (color: string) => rgb(color).map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
      const probe = document.createElement("span");
      document.body.append(probe);
      const token = (name: string) => {
        probe.style.color = `var(--${name})`;
        return getComputedStyle(probe).color;
      };
      const ratio = (foreground: string, background: string) => {
        const a = luminance(foreground), b = luminance(background);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      };
      const pairs = [["foreground", "background"], ["muted-foreground", "background"], ["muted-foreground", "card"], ["primary", "background"], ["primary-foreground", "primary"], ["popover-foreground", "popover"]];
      const result = pairs.map(([foreground, background]) => ({ name: `${foreground}/${background}`, ratio: ratio(token(foreground), token(background)) }));
      const negative = document.querySelector(".text-rose-700")!;
      result.push({ name: "evolução negativa/card", ratio: ratio(getComputedStyle(negative).color, token("card")) });
      probe.remove();
      return result;
    });
    for (const result of ratios) expect(result.ratio, result.name).toBeGreaterThanOrEqual(4.5);
  });
}
