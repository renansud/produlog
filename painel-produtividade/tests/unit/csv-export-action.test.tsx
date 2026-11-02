import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { CsvExportAction } from "@/components/dashboard/csv-export-action";

const fetchMock = vi.fn();
const downloads: string[] = [];
const originalCreate = URL.createObjectURL;
const originalRevoke = URL.revokeObjectURL;
const originalFetch = globalThis.fetch;
beforeAll(() => { URL.createObjectURL = vi.fn(() => "blob:synthetic"); URL.revokeObjectURL = vi.fn(); });
beforeEach(() => {
  fetchMock.mockReset(); downloads.length = 0;
  globalThis.fetch = fetchMock;
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) { downloads.push(this.download); });
});
afterEach(() => { globalThis.fetch = originalFetch; vi.restoreAllMocks(); });
afterAll(async () => { await new Promise((resolve) => setTimeout(resolve, 1050)); URL.createObjectURL = originalCreate; URL.revokeObjectURL = originalRevoke; });
const response = () => new Response("csv sintético", { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="servlog-produtividade-demo.csv"' } });

it("bloqueia repetição enquanto prepara e anuncia download após resposta válida", async () => {
  let resolve: (response: Response) => void = () => {};
  fetchMock.mockReturnValue(new Promise<Response>((done) => { resolve = done; }));
  render(<CsvExportAction href="/api/demo/productivity/export?search=TEC" />);
  const user = userEvent.setup();
  const button = screen.getByRole("button", { name: "Exportar CSV" });
  await user.click(button);
  expect(button).toHaveAttribute("aria-busy", "true");
  await user.click(button);
  expect(fetchMock).toHaveBeenCalledOnce();
  resolve(response());
  await waitFor(() => expect(downloads).toEqual(["servlog-produtividade-demo.csv"]));
  expect(screen.getByRole("status", { name: "Estado da exportação" })).toHaveTextContent("CSV preparado para download");
});

it("falha HTTP não gera arquivo nem ecoa detalhes internos", async () => {
  fetchMock.mockResolvedValue(new Response('{"error":"conteúdo fictício restrito"}', { status: 500, headers: { "content-type": "application/json" } }));
  render(<CsvExportAction href="/api/demo/productivity/export" />);
  await userEvent.click(screen.getByRole("button", { name: "Exportar CSV" }));
  expect(await screen.findByRole("alert", { name: "Estado da exportação" })).toHaveTextContent("Não foi possível exportar");
  expect(downloads).toEqual([]);
  expect(screen.queryByText(/conteúdo fictício restrito/)).not.toBeInTheDocument();
});

it("respeita estado indisponível sem iniciar requisição", async () => {
  render(<CsvExportAction href="/api/demo/productivity/export" disabled />);
  await userEvent.click(screen.getByRole("button", { name: "Exportar CSV" }));
  expect(fetchMock).not.toHaveBeenCalled();
});

it("desmontar o controle cancela requisição pendente sem download tardio", async () => {
  let signal: AbortSignal | undefined;
  fetchMock.mockImplementation((_href: string, init: RequestInit) => new Promise((_resolve, reject) => {
    signal = init.signal as AbortSignal;
    signal.addEventListener("abort", () => reject(new DOMException("cancelada", "AbortError")), { once: true });
  }));
  const { unmount } = render(<CsvExportAction href="/api/demo/productivity/export" />);
  await userEvent.click(screen.getByRole("button", { name: "Exportar CSV" }));
  unmount();
  expect(signal?.aborted).toBe(true);
  expect(downloads).toEqual([]);
});
