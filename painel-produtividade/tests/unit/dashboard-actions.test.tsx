import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { DashboardActions, DashboardFilterActions } from "@/components/dashboard/dashboard-actions";

const mocks = vi.hoisted(() => ({ refresh: vi.fn(), setTheme: vi.fn(), theme: "dark" }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("next-themes", () => ({ useTheme: () => ({ resolvedTheme: mocks.theme, setTheme: mocks.setTheme }) }));
beforeEach(() => { mocks.refresh.mockClear(); mocks.setTheme.mockClear(); mocks.theme = "dark"; });

it("atualizar solicita nova leitura no router", async () => {
  const user = userEvent.setup();
  render(<DashboardActions />);
  await user.click(screen.getByRole("button", { name: "Atualizar dados" }));
  expect(mocks.refresh).toHaveBeenCalledTimes(1);
});

it("alternância escolhe claro a partir de escuro", async () => {
  const user = userEvent.setup();
  render(<DashboardActions />);
  await user.click(screen.getByRole("button", { name: "Ativar tema claro" }));
  expect(mocks.setTheme).toHaveBeenCalledWith("light");
});

it("alternância escolhe escuro a partir de claro", async () => {
  mocks.theme = "light";
  const user = userEvent.setup();
  render(<DashboardActions allowRefresh={false} />);
  expect(screen.queryByRole("button", { name: "Atualizar dados" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Ativar tema escuro" }));
  expect(mocks.setTheme).toHaveBeenCalledWith("dark");
});

it("limpar respeita ausência de seleção e estado pendente", async () => {
  const user = userEvent.setup();
  const clear = vi.fn();
  const { rerender } = render(<DashboardFilterActions pending={false} canClear={false} onClear={clear} />);
  const button = screen.getByRole("button", { name: "Limpar filtros" });
  await user.click(button);
  expect(clear).not.toHaveBeenCalled();
  rerender(<DashboardFilterActions pending canClear onClear={clear} />);
  await user.click(button);
  expect(clear).not.toHaveBeenCalled();
  rerender(<DashboardFilterActions pending={false} canClear onClear={clear} />);
  await user.click(button);
  expect(clear).toHaveBeenCalledTimes(1);
});

it("exportação indisponível é acessível por foco e explica o motivo", async () => {
  const user = userEvent.setup();
  render(<DashboardFilterActions pending={false} canClear onClear={vi.fn()} />);
  const exportButton = screen.getByRole("button", { name: "Exportar CSV" });
  expect(exportButton).toHaveAttribute("aria-disabled", "true");
  exportButton.focus();
  expect(await screen.findByRole("tooltip")).toHaveTextContent("Detalhamento indisponível para exportação.");
  await user.keyboard("{Enter}");
});
