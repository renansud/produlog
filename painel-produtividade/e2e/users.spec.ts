import { expect, test } from "@playwright/test";

test("diretório exibe contas paginadas e a rota real exige login", async ({ page }) => {
  await page.goto("/admin/usuarios");
  await expect(page).toHaveURL("http://127.0.0.1:3000/");
  await page.goto("/demo/usuarios");
  await expect(page.getByRole("heading", { name: "Usuários", exact: true })).toBeVisible();
  await expect(page.getByRole("table").getByRole("row")).toHaveCount(21);
  await expect(page.getByText("Sem perfil de acesso", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Próxima", exact: true }).click();
  await expect(page.getByRole("cell", { name: "sintetico.21@example.invalid", exact: true })).toBeVisible();
  await expect(page.getByText("Página 2 de 2")).toBeVisible();
  await page.getByRole("button", { name: "Anterior", exact: true }).click();
  await expect(page.getByText("Página 1 de 2")).toBeVisible();
});

test("formulário valida, adiciona apenas usuário fictício e limpa credenciais", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (request) => { if (["POST", "PUT", "PATCH"].includes(request.method())) writes.push(request.url()); });
  await page.goto("/demo/usuarios");
  await page.getByRole("button", { name: "Novo usuário" }).click();
  const dialog = page.getByRole("dialog", { name: "Criar novo usuário" });
  await dialog.getByRole("button", { name: "Criar usuário fictício" }).click();
  await expect(dialog.getByText("Revise os campos indicados.")).toBeVisible();
  await dialog.getByLabel("E-mail", { exact: true }).fill("novo@example.invalid");
  await dialog.getByLabel("Senha inicial", { exact: true }).fill("Ficticia" + "123456!");
  await dialog.getByLabel("Confirmar senha inicial", { exact: true }).fill("diferente");
  await dialog.getByRole("button", { name: "Criar usuário fictício" }).click();
  await expect(dialog.getByText("As senhas precisam ser iguais.")).toBeVisible();
  await dialog.getByLabel("Confirmar senha inicial", { exact: true }).fill("Ficticia" + "123456!");
  await dialog.getByRole("button", { name: "Mostrar senhas" }).click();
  await expect(dialog.getByLabel("Senha inicial", { exact: true })).toHaveAttribute("type", "text");
  await dialog.getByRole("button", { name: "Criar usuário fictício" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("cell", { name: "novo@example.invalid", exact: true })).toBeVisible();
  await expect(page.getByText("Usuário fictício adicionado", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Novo usuário" }).click();
  await expect(dialog.getByLabel("Senha inicial", { exact: true })).toHaveValue("");
  await expect(dialog.getByLabel("Senha inicial", { exact: true })).toHaveAttribute("type", "password");
  await dialog.getByRole("button", { name: "Cancelar" }).click();
  expect(writes).toEqual([]);
  await page.reload();
  await expect(page.getByRole("cell", { name: "novo@example.invalid", exact: true })).toHaveCount(0);
});

test("demo rejeita e-mail real e duplicado; Escape restaura foco e limpa formulário", async ({ page }) => {
  await page.goto("/demo/usuarios");
  const trigger = page.getByRole("button", { name: "Novo usuário" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("E-mail", { exact: true }).fill("pessoa@empresa.invalid");
  await dialog.getByLabel("Senha inicial", { exact: true }).fill("Ficticia" + "123456!");
  await dialog.getByLabel("Confirmar senha inicial", { exact: true }).fill("Ficticia" + "123456!");
  await dialog.getByRole("button", { name: "Criar usuário fictício" }).click();
  await expect(dialog.getByText(/use somente e-mails fictícios/)).toBeVisible();
  await expect(dialog.getByLabel("Senha inicial", { exact: true })).toHaveValue("");
  await dialog.getByLabel("E-mail", { exact: true }).fill("sintetico.01@example.invalid");
  await dialog.getByLabel("Senha inicial", { exact: true }).fill("Ficticia" + "123456!");
  await dialog.getByLabel("Confirmar senha inicial", { exact: true }).fill("Ficticia" + "123456!");
  await dialog.getByRole("button", { name: "Criar usuário fictício" }).click();
  await expect(dialog.getByText(/Já existe uma conta fictícia/)).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Criar usuário fictício" })).toBeEnabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(dialog.getByLabel("E-mail", { exact: true })).toHaveValue("");
});

test("tabela e formulário respeitam larguras, temas e texto a 200%", async ({ page }) => {
  await page.goto("/demo/usuarios");
  for (const width of [320, 768, 1280]) for (const theme of ["dark", "light"]) for (const scale of ["100%", "200%"]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(({ theme, scale }) => { document.documentElement.classList.toggle("dark", theme === "dark"); document.documentElement.classList.toggle("light", theme === "light"); document.documentElement.style.fontSize = scale; }, { theme, scale });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: "Novo usuário" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel("E-mail", { exact: true })).toBeVisible();
    const close = dialog.getByRole("button", { name: "Fechar", exact: true });
    await expect.poll(async () => (await close.boundingBox())?.width ?? 0).toBeGreaterThanOrEqual(44);
    await expect.poll(async () => (await close.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    const dims = await dialog.boundingBox();
    expect(dims!.x).toBeGreaterThanOrEqual(0);
    expect(dims!.x + dims!.width).toBeLessThanOrEqual(width + 1);
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await expect(dialog.getByRole("button", { name: "Criar usuário fictício" })).toBeVisible();
    await dialog.getByRole("button", { name: "Cancelar" }).click();
  }
  await page.setViewportSize({ width: 320, height: 900 });
  const table = page.getByRole("region", { name: /^Lista de usuários/ });
  await table.focus();
  await table.press("ArrowRight");
  await expect.poll(() => table.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
});
