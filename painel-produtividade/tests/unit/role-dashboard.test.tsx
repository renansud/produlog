import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { RoleDashboard } from "@/modules/auth/presentation/role-dashboard";
vi.mock("@/modules/auth/presentation/require-role", () => ({ requireRole: vi.fn(async () => ({})) }));
it("dashboard ADMIN apresenta administração sem dados inventados", async () => {
  render(await RoleDashboard({ role: "ADMIN" }));
  expect(screen.getByRole("heading", { name: "Dashboard do administrador" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Gerenciamento de usuários" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Inserção de dados" })).toBeVisible();
  expect(screen.queryByText("1.500,00")).not.toBeInTheDocument();
});
it("dashboard USER não apresenta operações administrativas", async () => {
  render(await RoleDashboard({ role: "USER" }));
  expect(screen.getByRole("heading", { name: "Meu dashboard" })).toBeVisible();
  expect(screen.queryByRole("region", { name: "Administração" })).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Inserção de dados" })).not.toBeInTheDocument();
});
