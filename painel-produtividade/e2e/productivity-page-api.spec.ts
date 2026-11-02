import { expect, test } from "@playwright/test";

const operationA = "10000000-0000-4000-8000-000000000001";
test("detalhamento filtra, pesquisa, ordena e pagina com o mesmo total", async ({ request }) => {
  const query = `months=2026-07&operations=${operationA}&search=tec-0&sort=technician&direction=desc&pageSize=2`;
  const first = await request.get(`/api/demo/productivity?${query}`);
  expect(first.status()).toBe(200);
  expect(first.headers()["cache-control"]).toBe("private, no-store");
  expect(first.headers()["x-servlog-demo"]).toBe("synthetic");
  const body = await first.json();
  expect(body).toMatchObject({ demo: true, pagination: { page: 1, pageSize: 2, total: 4, totalPages: 2, hasNextPage: true, hasPreviousPage: false } });
  expect(body.items.map((row: { technician: string }) => row.technician)).toEqual(["TEC-04", "TEC-03"]);
  expect(Object.keys(body.items[0]).sort()).toEqual(["contract", "goalMet", "month", "production", "supervisor", "technician"]);
  expect(body.items[0]).toMatchObject({ contract: "00004", production: "100.00" });
  const second = await (await request.get(`/api/demo/productivity?${query}&page=2`)).json();
  expect(second.items.map((row: { technician: string }) => row.technician)).toEqual(["TEC-02", "TEC-01"]);
  expect(second.pagination).toMatchObject({ total: 4, hasNextPage: false, hasPreviousPage: true });
  const beyond = await (await request.get(`/api/demo/productivity?${query}&page=3`)).json();
  expect(beyond.items).toEqual([]);
  expect(beyond.pagination.total).toBe(4);
});

test("limites, permissões e origem são validados no servidor", async ({ request }) => {
  for (const query of ["pageSize=101", "page=0", "sort=operation", "role=ADMIN", "search=a&search=b"]) expect((await request.get(`/api/demo/productivity?${query}`)).status()).toBe(400);
  expect((await request.get("/api/demo/productivity?operations=10000000-0000-4000-8000-000000000099")).status()).toBe(403);
  expect((await request.get("/api/demo/productivity", { headers: { origin: "https://externo.example" } })).status()).toBe(403);
  expect((await request.get("/api/v1/productivity?role=ADMIN&pageSize=101")).status()).toBe(401);
  expect((await request.post("/api/demo/productivity")).status()).toBe(405);
});

test("supervisor incompatível é saneado e pesquisa vazia ou sem resultado é explícita", async ({ request }) => {
  const result = await (await request.get(`/api/demo/productivity?operations=${operationA}&supervisors=20000000-0000-4000-8000-000000000002`)).json();
  expect(result.selected.supervisors).toEqual([]);
  expect(result.discardedSupervisorIds).toEqual(["20000000-0000-4000-8000-000000000002"]);
  expect(result.pagination.total).toBe(8);
  expect(result.items.every((row: { supervisor: string }) => row.supervisor === "Equipe Exemplo A")).toBe(true);
  const absent = await (await request.get("/api/demo/productivity?search=inexistente" )).json();
  expect(absent.items).toEqual([]);
  expect(absent.pagination).toMatchObject({ total: 0, totalPages: 0, hasNextPage: false });
  const all = await (await request.get("/api/demo/productivity?search=")).json();
  expect(all.pagination.total).toBe(15);
});
