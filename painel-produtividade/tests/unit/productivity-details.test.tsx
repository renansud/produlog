import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardStateProvider } from "@/modules/productivity/presentation/dashboard-state-provider";
import { dashboardStateSchema } from "@/modules/productivity/domain/dashboard-state";
import { ProductivityDetails } from "@/modules/productivity/presentation/productivity-details";
import type { ProductivityPage } from "@/modules/productivity/application/read-productivity-page";
import { dashboardInputFromPageQuery, productivityPageInputFromQuery, productivityPageQuerySchema, productivityPageQueryString } from "@/modules/productivity/domain/productivity-page";

const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push, refresh }) }));
const filters = { months: [], operations: [], supervisors: [] };
function data(): ProductivityPage {
  return {
    items: [{ month: "2026-07", supervisor: "Equipe Fictícia", technician: "TEC-01", contract: "00001", production: "1234.50", goalMet: true }, { month: "2026-06", supervisor: "Equipe Fictícia", technician: "TEC-02", contract: "00002", production: "-10.25", goalMet: null }],
    pagination: { page: 1, pageSize: 2, total: 3, totalPages: 2, hasNextPage: true, hasPreviousPage: false },
    selected: { ...filters, search: "", sort: "month", direction: "desc" }, discardedSupervisorIds: [],
  };
}
function view(source: ProductivityPage | null, error?: "invalid" | "unavailable") { const query = dashboardStateSchema.parse(source ? { ...source.selected, page: source.pagination.page, pageSize: source.pagination.pageSize } : filters); return <DashboardStateProvider query={query}><ProductivityDetails data={source} query={query} error={error} /></DashboardStateProvider>; }
beforeEach(() => { push.mockClear(); refresh.mockClear(); });

describe("Tabela de produtividade", () => {
  it("renderiza seis colunas acessíveis e formata valores sem perder zeros", () => {
    render(view(data()));
    expect(screen.getAllByRole("columnheader")).toHaveLength(6);
    expect(screen.getByRole("columnheader", { name: "Mês" })).toHaveAttribute("aria-sort", "descending");
    expect(screen.getByRole("table")).toHaveTextContent("Julho de 2026");
    expect(screen.getByRole("table")).toHaveTextContent("00001");
    expect(screen.getByRole("table")).toHaveTextContent("1.234,50");
    expect(screen.getByRole("table")).toHaveTextContent("-10,25");
    expect(screen.getByRole("table")).toHaveTextContent("Sim");
    expect(screen.getByRole("table")).toHaveTextContent("—");
    expect(screen.getByRole("button", { name: "Página anterior" })).toHaveAttribute("aria-disabled", "true");
  });
  it("ordena por teclado e reinicia a página preservando pesquisa e filtros", async () => {
    const source = data();
    source.selected.search = "TEC";
    source.pagination.page = 2;
    source.items = source.items.slice(0, 1);
    source.pagination.hasNextPage = false;
    source.pagination.hasPreviousPage = true;
    render(view(source));
    const button = screen.getByRole("button", { name: "Ordenar por Técnico" });
    button.focus();
    await userEvent.keyboard("{Enter}");
    const params = new URL(push.mock.calls[0][0], "http://localhost").searchParams;
    expect(params.get("sort")).toBe("technician");
    expect(params.get("direction")).toBe("asc");
    expect(params.get("search")).toBe("TEC");
    expect(params.has("page")).toBe(false);
  });
  it("submete pesquisa e pagina sem ordenar ou filtrar linhas no cliente", async () => {
    render(view(data()));
    const user = userEvent.setup();
    await user.type(screen.getByRole("searchbox", { name: "Pesquisar no detalhamento" }), "TEC-02");
    await user.click(screen.getByRole("button", { name: "Pesquisar" }));
    expect(new URL(push.mock.calls[0][0], "http://localhost").searchParams.get("search")).toBe("TEC-02");
    // O componente aguarda a próxima página RSC; os dados atuais não são recalculados no browser.
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(new URL(push.mock.calls.at(-1)![0], "http://localhost").searchParams.get("page")).toBe("2");
  });
  it("troca de tamanho reinicia a página", () => {
    const source = data(); source.pagination.page = 2;
    source.items = source.items.slice(0, 1);
    source.pagination.hasNextPage = false;
    source.pagination.hasPreviousPage = true;
    render(view(source));
    fireEvent.change(screen.getByRole("combobox", { name: "Linhas por página" }), { target: { value: "10" } });
    const params = new URL(push.mock.calls[0][0], "http://localhost").searchParams;
    expect(dashboardStateSchema.parse(productivityPageInputFromQuery(params)).pageSize).toBe(10);
    expect(params.has("page")).toBe(false);
  });
  it("mostra recorte vazio e página fora do intervalo sem taxa ou linha inventada", () => {
    const source = data(); source.items = []; source.pagination.page = 99;
    source.pagination.hasNextPage = false; source.pagination.hasPreviousPage = true;
    render(view(source));
    expect(screen.getByRole("table")).toHaveTextContent("Esta página não possui registros");
    expect(screen.getByRole("status", { name: "Resultados do detalhamento" })).toHaveTextContent("3 registros no resultado");
  });
  it("diferencia resultado vazio de falha e permite redefinir parâmetros", () => {
    const source = data(); source.items = []; source.pagination.total = 0; source.pagination.totalPages = 0;
    source.pagination.hasNextPage = false;
    const { unmount } = render(view(source));
    expect(screen.getByRole("table")).toHaveTextContent("Nenhum registro encontrado");
    unmount();
    render(view(null, "invalid"));
    expect(screen.getByRole("alert", { name: "Parâmetros do detalhamento inválidos" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Redefinir detalhamento" })).toHaveAttribute("href", "/demo");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
  it("falha de leitura não apresenta linhas antigas e oferece nova leitura", async () => {
    render(view(null, "unavailable"));
    expect(screen.getByRole("alert", { name: "Detalhamento indisponível" })).toBeVisible();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(refresh).toHaveBeenCalledOnce();
  });
});

describe("URLs do detalhamento", () => {
  it("serializa ida/volta sem perder filtros, busca, ordem e página", () => {
    const source = productivityPageQuerySchema.parse({ months: ["2026-07"], search: "técnico & contrato", sort: "production", direction: "asc", page: 3, pageSize: 5 });
    expect(productivityPageQuerySchema.parse(productivityPageInputFromQuery(new URLSearchParams(productivityPageQueryString(source))))).toEqual(source);
  });
  it("separa apenas parâmetros conhecidos e mantém tentativas de permissão para rejeição", () => {
    expect(dashboardInputFromPageQuery(new URLSearchParams("months=2026-07&sort=production&page=2&role=ADMIN"))).toEqual({ months: ["2026-07"], role: ["ADMIN"] });
  });
});
