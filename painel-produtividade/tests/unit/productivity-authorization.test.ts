import { describe, expect, it, vi } from "vitest";
import { handleDashboardRequest } from "@/modules/productivity/presentation/dashboard-http";
import { handleProductivityPageRequest } from "@/modules/productivity/presentation/productivity-page-http";
import { handleProductivityExportRequest } from "@/modules/productivity/presentation/productivity-export-http";
import { paginateSyntheticProductivity } from "@/modules/productivity/domain/productivity-page";
import { operationA, operationB, scopedBaseline, supervisorB, syntheticUserId } from "../fixtures/scoped-productivity";

const endpoints = ["summary", "monthly", "supervisors", "filters", "page", "csv"] as const;
const access = (role = "USER") => ({ userId: syntheticUserId, active: true, role, operationIds: [operationA] });
const forbidden = "MARCADOR_SINTETICO_RESTRITO";
const rows = scopedBaseline.map((row) => row.operationId === operationB ? { ...row, technician: forbidden, supervisor: forbidden, contract: forbidden } : row);

function fixture(context: unknown = access(), mode: "scoped" | "leak" | "error" = "scoped") {
  const find = vi.fn(async (ids: readonly string[]) => {
    if (mode === "error") throw new Error(forbidden);
    return mode === "leak" ? rows.filter((row) => row.operationId === operationB) : rows.filter((row) => ids.includes(row.operationId));
  });
  const identity = { getCurrentAccess: vi.fn(async () => context) };
  const pageRepository = {
    findSupervisorIds: vi.fn(async () => []),
    findPage: vi.fn(async (ids: readonly string[], query: unknown) => paginateSyntheticProductivity(await find(ids), query)),
  };
  return {
    find, identity, pageRepository,
    request: async (endpoint: typeof endpoints[number], query = "") => {
      const request = new Request(`http://127.0.0.1:3000/api/v1/productivity?${query}`);
      if (endpoint === "page") return handleProductivityPageRequest(request, { access: identity, repository: pageRepository });
      if (endpoint === "csv") return handleProductivityExportRequest(request, { access: identity, repository: pageRepository });
      return handleDashboardRequest(request, endpoint, { access: identity, repository: { findByOperations: find } });
    },
  };
}

async function privateResponse(response: Response) {
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(response.headers.get("vary")).toBe("Cookie");
  expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  const text = await response.text();
  expect(text).not.toContain(forbidden);
  expect(text).not.toContain(operationB);
  expect(text).not.toContain(supervisorB);
  expect(text).not.toContain("sourceRowKey");
  return text;
}

describe.each(endpoints)("Fronteira de autorização: %s", (endpoint) => {
  it.each([
    { name: "sem sessão, mesmo com query inválida", context: null, query: "role=ADMIN", status: 401 },
    { name: "perfil desativado", context: { ...access(), active: false }, query: "", status: 403 },
    { name: "papel desconhecido", context: access("SUPERADMIN"), query: "", status: 403 },
    { name: "operação adulterada", context: access(), query: `operations=${operationB}`, status: 403 },
  ])("bloqueia $name antes do repositório", async ({ context, query, status }) => {
    const deps = fixture(context);
    const response = await deps.request(endpoint, query);
    expect(response.status).toBe(status);
    expect(response.headers.get("content-disposition")).toBeNull();
    await privateResponse(response);
    expect(deps.find).not.toHaveBeenCalled();
    expect(deps.pageRepository.findPage).not.toHaveBeenCalled();
    expect(deps.pageRepository.findSupervisorIds).not.toHaveBeenCalled();
  });

  it.each(["ADMIN", "USER"])("%s recebe somente a operação fornecida pelo servidor", async (role) => {
    const deps = fixture(access(role));
    const response = await deps.request(endpoint);
    expect(response.status).toBe(200);
    await privateResponse(response);
    expect(deps.find).toHaveBeenCalledWith([operationA]);
  });

  it("rejeita adaptador que retorna dados de outra operação", async () => {
    const response = await fixture(access(), "leak").request(endpoint);
    expect(response.status).toBe(403);
    expect(response.headers.get("content-disposition")).toBeNull();
    await privateResponse(response);
  });

  it("sanitiza falhas internas e não envia arquivo parcial", async () => {
    const response = await fixture(access(), "error").request(endpoint);
    expect(response.status).toBe(500);
    expect(response.headers.get("content-disposition")).toBeNull();
    expect(JSON.parse(await privateResponse(response)).error.code).toBe("INTERNAL_ERROR");
  });
});
