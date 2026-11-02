import { expect, test } from "@playwright/test";

for (const query of ["", "?months=2026-07", "?operations=10000000-0000-4000-8000-000000000002", "?months=2027-01"]) {
  test(`cards correspondem ao contrato de resumo ${query || "sem filtros"}`, async ({ page, request }) => {
    const response = await request.get(`/api/demo/dashboard/summary${query}`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    await page.goto(`/demo${query}`);
    const decimal = (value: string) => value.split(".").map((part, index) => index === 0 ? part.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : part).join(",");
    await expect(page.getByRole("article", { name: "Técnicos", exact: true })).toContainText(String(data.technicians));
    await expect(page.getByRole("article", { name: "Produção total", exact: true })).toContainText(decimal(data.totalProduction));
    await expect(page.getByRole("article", { name: "Média de produção", exact: true })).toContainText(data.averageProduction === null ? "—" : decimal(data.averageProduction));
    const difference = data.evolution?.differencePercentagePoints;
    await expect(page.getByRole("article", { name: "Evolução", exact: true })).toContainText(difference === undefined ? "—" : `${difference > 0 ? "+" : ""}${difference.toFixed(2).replace(".", ",")}%`);
    if (data.rowCount === 0) await expect(page.getByRole("status", { name: "Sem registros no recorte" })).toBeVisible();
    await page.getByText("Qualidade dos dados", { exact: true }).click();
    await expect(page.getByText("Parte da identificação usa nomes; homônimos precisam de revisão.")).toBeVisible();
  });
}
