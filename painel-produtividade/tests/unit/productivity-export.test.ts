import { describe, expect, it, vi } from "vitest";
import { exportProductivityCsv, MAX_CSV_ROWS, MAX_CSV_BYTES } from "@/modules/productivity/application/export-productivity-csv";
import { handleProductivityExportRequest } from "@/modules/productivity/presentation/productivity-export-http";
import { paginateSyntheticProductivity } from "@/modules/productivity/domain/productivity-page";
import { csvHeader, encodeProductivityCsvRow } from "@/modules/productivity/domain/productivity-csv";
import type { ScopedProductivityRow } from "@/modules/productivity/domain/productivity-filters";
import { operationA, operationB, scopedBaseline, syntheticUserId } from "../fixtures/scoped-productivity";

function dependencies(rows: readonly ScopedProductivityRow[] = scopedBaseline) {
  const access = { userId: syntheticUserId, active: true, role: "USER", operationIds: [operationA, operationB] };
  return {
    access: { getCurrentAccess: vi.fn(async (): Promise<unknown> => access) },
    repository: {
      findSupervisorIds: vi.fn(async (ids: readonly string[], requested: readonly string[]): Promise<unknown> => [...new Set(rows.filter((row) => ids.includes(row.operationId) && requested.includes(row.supervisorId)).map((row) => row.supervisorId))]),
      findPage: vi.fn(async (ids: readonly string[], query: unknown): Promise<unknown> => paginateSyntheticProductivity(rows.filter((row) => ids.includes(row.operationId)), query)),
    },
  };
}
const request = (query = "") => new Request(`http://127.0.0.1:3000/api/v1/productivity/export?${query}`);

describe("Exportação autorizada em lotes", () => {
  it("aceita exatamente 5 MiB e conta UTF-8 após o escape, sem truncar", async () => {
    const base = { ...scopedBaseline[0], supervisor: "" };
    const overhead = new TextEncoder().encode(csvHeader + encodeProductivityCsvRow(base)).byteLength;
    const padding = "x".repeat(MAX_CSV_BYTES - overhead);
    const result = await exportProductivityCsv(dependencies([{ ...base, supervisor: padding }]), {});
    expect(result.bytes).toBe(MAX_CSV_BYTES);
    expect(new TextEncoder().encode(result.csv).byteLength).toBe(MAX_CSV_BYTES);
    for (const suffix of ["x", "é", '"']) {
      const response = await handleProductivityExportRequest(request(), dependencies([{ ...base, supervisor: padding + suffix }]));
      expect(response.status).toBe(413);
      expect(response.headers.get("content-disposition")).toBeNull();
      expect(await response.text()).not.toContain(padding.slice(0, 100));
    }
  });
  it("UTF-8 multibyte e aspas escapadas consomem o limite real do arquivo", async () => {
    for (const supervisor of ["é".repeat(MAX_CSV_BYTES / 2), '"'.repeat(MAX_CSV_BYTES / 2)]) {
      const response = await handleProductivityExportRequest(request(), dependencies([{ ...scopedBaseline[0], supervisor }]));
      expect(response.status).toBe(413);
      expect(response.headers.get("content-disposition")).toBeNull();
    }
  });
  it("cancelamento prévio impede consulta ao repositório", async () => {
    const deps = dependencies();
    const controller = new AbortController();
    controller.abort();
    await expect(exportProductivityCsv(deps, {}, controller.signal)).rejects.toMatchObject({ name: "AbortError" });
    expect(deps.repository.findPage).not.toHaveBeenCalled();
  });
  it("cancelamento após o primeiro lote impede ler o segundo e liberar resultado", async () => {
    const deps = dependencies();
    const controller = new AbortController();
    deps.repository.findPage.mockImplementationOnce(async () => {
      controller.abort();
      return { rows: Array.from({ length: 100 }, (_, index) => ({ ...scopedBaseline[0], sourceRowKey: `cancel-${String(index).padStart(4, "0")}` })), total: 101 };
    });
    await expect(exportProductivityCsv(deps, {}, controller.signal)).rejects.toMatchObject({ name: "AbortError" });
    expect(deps.repository.findPage).toHaveBeenCalledTimes(1);
  });
  it("lê todas as páginas em lotes de 100, ignorando página/tamanho válidos da tabela", async () => {
    const rows = Array.from({ length: 205 }, (_, index) => ({ ...scopedBaseline[0], sourceRowKey: `row-${String(index).padStart(4, "0")}` }));
    const deps = dependencies(rows);
    const result = await exportProductivityCsv(deps, { page: 99, pageSize: 1 });
    expect(result.rowCount).toBe(205);
    expect(result.csv.split("\r\n").filter(Boolean)).toHaveLength(206);
    expect(deps.repository.findPage.mock.calls.map(([, query]) => (query as { page: number }).page)).toEqual([1, 2, 3]);
    expect(deps.access.getCurrentAccess).toHaveBeenCalledTimes(3);
  });
  it("mantém filtros, pesquisa e ordem em todas as linhas, inclusive fora da página visível", async () => {
    const result = await exportProductivityCsv(dependencies(), { months: ["2026-07"], operations: [operationA], search: "tec-0", sort: "technician", direction: "desc", page: 2, pageSize: 2 });
    expect(result.rowCount).toBe(4);
    expect(result.csv.indexOf("TEC-04")).toBeLessThan(result.csv.indexOf("TEC-03"));
    expect(result.csv.indexOf("TEC-03")).toBeLessThan(result.csv.indexOf("TEC-02"));
    expect(result.csv).toContain("TEC-01");
    expect(result.csv).not.toContain("Junho");
    expect(result.csv).not.toContain("Equipe Exemplo B");
  });
  it("conjunto vazio produz só cabeçalho, sem linhas artificiais", async () => {
    const result = await exportProductivityCsv(dependencies(), { search: "inexistente" });
    expect(result).toMatchObject({ csv: csvHeader, rowCount: 0 });
  });
  it("autentica antes dos parâmetros e rejeita operação fora do escopo sem leitura", async () => {
    const deps = dependencies();
    deps.access.getCurrentAccess.mockResolvedValue(null);
    expect((await handleProductivityExportRequest(request("role=ADMIN"), deps)).status).toBe(401);
    expect(deps.repository.findPage).not.toHaveBeenCalled();
    const restricted = dependencies();
    restricted.access.getCurrentAccess.mockResolvedValue({ userId: syntheticUserId, active: true, role: "USER", operationIds: [operationA] });
    expect((await handleProductivityExportRequest(request(`operations=${operationB}`), restricted)).status).toBe(403);
    expect(restricted.repository.findPage).not.toHaveBeenCalled();
  });
  it("valida paginação mesmo sendo ignorada no arquivo e rejeita parâmetro desconhecido", async () => {
    for (const query of ["page=0", "pageSize=101", "role=ADMIN", "sort=operation"]) expect((await handleProductivityExportRequest(request(query), dependencies())).status).toBe(400);
  });
  it("revogação entre lotes bloqueia sem liberar arquivo parcial", async () => {
    const rows = Array.from({ length: 101 }, (_, index) => ({ ...scopedBaseline[0], sourceRowKey: `row-${index}` }));
    const deps = dependencies(rows);
    deps.access.getCurrentAccess.mockResolvedValueOnce({ userId: syntheticUserId, active: true, role: "USER", operationIds: [operationA, operationB] }).mockResolvedValue(null);
    const response = await handleProductivityExportRequest(request(), deps);
    expect(response.status).toBe(401);
    expect(response.headers.get("content-disposition")).toBeNull();
    expect(deps.repository.findPage).toHaveBeenCalledTimes(1);
  });
  it("mudança de escopo entre lotes bloqueia a exportação", async () => {
    const rows = Array.from({ length: 101 }, (_, index) => ({ ...scopedBaseline[0], sourceRowKey: `row-${index}` }));
    const deps = dependencies(rows);
    deps.access.getCurrentAccess.mockResolvedValueOnce({ userId: syntheticUserId, active: true, role: "USER", operationIds: [operationA, operationB] }).mockResolvedValue({ userId: syntheticUserId, active: true, role: "USER", operationIds: [operationA] });
    expect((await handleProductivityExportRequest(request(), deps)).status).toBe(403);
  });
  it("mudança de contagem entre lotes retorna conflito sem arquivo parcial", async () => {
    const deps = dependencies();
    const row = scopedBaseline[0];
    deps.repository.findPage.mockResolvedValueOnce({ rows: Array.from({ length: 100 }, (_, index) => ({ ...row, sourceRowKey: `row-${String(index).padStart(4, "0")}` })), total: 101 }).mockResolvedValueOnce({ rows: [], total: 100 });
    const response = await handleProductivityExportRequest(request(), deps);
    expect(response.status).toBe(409);
    expect(response.headers.get("content-disposition")).toBeNull();
  });
  it("limites de linhas e bytes rejeitam explicitamente sem truncamento", async () => {
    const deps = dependencies();
    deps.repository.findPage.mockResolvedValue({ rows: Array.from({ length: 100 }, (_, index) => ({ ...scopedBaseline[0], sourceRowKey: `row-${String(index).padStart(4, "0")}` })), total: MAX_CSV_ROWS + 1 });
    expect((await handleProductivityExportRequest(request(), deps)).status).toBe(413);
    const oversized = dependencies([{ ...scopedBaseline[0], supervisor: "x".repeat(5 * 1024 * 1024) }]);
    const response = await handleProductivityExportRequest(request(), oversized);
    expect(response.status).toBe(413);
    expect(response.headers.get("content-disposition")).toBeNull();
  });
  it("headers do download e tamanho em bytes incluem BOM", async () => {
    const response = await handleProductivityExportRequest(request(), dependencies(), true);
    expect(response.headers.get("content-type")).toBe("text/csv; charset=utf-8");
    expect(response.headers.get("content-disposition")).toContain("servlog-produtividade-demo.csv");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(Array.from(bytes.slice(0, 3))).toEqual([239, 187, 191]);
    expect(bytes.byteLength).toBe(Number(response.headers.get("content-length")));
  });
  it("erro do repositório é sanitizado e não vira anexo", async () => {
    const deps = dependencies();
    deps.repository.findPage.mockRejectedValue(new Error("conteúdo fictício restrito"));
    const response = await handleProductivityExportRequest(request(), deps);
    expect(response.status).toBe(500);
    expect(response.headers.get("content-disposition")).toBeNull();
    expect(await response.json()).toEqual({ error: { code: "INTERNAL_ERROR", message: "Não foi possível exportar o detalhamento." } });
  });
});
