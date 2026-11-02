import { expect, test } from "@playwright/test";

test("página inicial oferece login sem cadastro público e sem escolha de papel", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Entre na sua conta" })).toBeVisible();
  await expect(page.getByLabel("E-mail", { exact: true })).toHaveAttribute("autocomplete", "username");
  await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute("type", "password");
  await expect(page.getByRole("combobox")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /cadastrar|criar conta/i })).toHaveCount(0);
  await page.setViewportSize({ width: 320, height: 900 });
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test("rotas privadas exigem autenticação e aliases levam ao login", async ({ page }) => {
  for (const path of ["/admin", "/admin/dashboard", "/admin/dados", "/user", "/user/dashboard", "/dashboard", "/auth/login"]) {
    await page.goto(path);
    await expect(page).toHaveURL("http://127.0.0.1:3000/");
    await expect(page.getByRole("heading", { name: "Entre na sua conta" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dashboard do administrador" })).toHaveCount(0);
  }
});
test("demonstração continua disponível separadamente", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explorar demonstração com dados fictícios" }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByRole("article", { name: "Produção total", exact: true })).toContainText("1.500,00");
});
