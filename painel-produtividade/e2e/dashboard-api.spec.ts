import { expect, test } from "@playwright/test";

test("demo responde contratos de summary, monthly, supervisors e filters", async ({ request }) => {
  const summary = await request.get("/api/demo/dashboard/summary?months=2026-07");
  expect(summary.status()).toBe(200);
  expect(summary.headers()["cache-control"]).toBe("private, no-store");
  expect(await summary.json()).toMatchObject({ demo: true, totalProduction: "800.00", evolution: { differencePercentagePoints: -5.36 } });
  const monthly = await request.get("/api/demo/dashboard/monthly?months=2026-07");
  expect((await monthly.json()).series.map((item: { rate: number }) => item.rate)).toEqual([42.86, 37.5]);
  const supervisors = await request.get("/api/demo/dashboard/supervisors?months=2026-07");
  expect((await supervisors.json()).series.map((item: { rate: number }) => item.rate)).toEqual([50, 25]);
  const filters = await request.get("/api/demo/dashboard/filters");
  expect((await filters.json()).operations).toHaveLength(2);
});

test("demo sanitiza entradas e endpoints privados continuam fechados", async ({ request }) => {
  expect((await request.get("/api/demo/dashboard/summary?role=ADMIN")).status()).toBe(400);
  expect((await request.get("/api/demo/dashboard/summary?operations=10000000-0000-4000-8000-000000000099")).status()).toBe(403);
  for (const kind of ["summary", "monthly", "supervisors", "filters"]) {
    expect((await request.get(`/api/v1/dashboard/${kind}`)).status()).toBe(401);
  }
});
