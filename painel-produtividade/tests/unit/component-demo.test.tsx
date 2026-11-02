import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ComponentDemo } from "@/components/demo/component-demo";

describe("Galeria de componentes", () => {
  it("permite digitar e alternar o checkbox pelo rótulo", async () => {
    const user = userEvent.setup();
    render(<ComponentDemo />);
    const field = screen.getByRole("textbox", { name: "Texto de exemplo" });
    await user.type(field, "Exemplo fictício");
    expect(field).toHaveValue("Exemplo fictício");
    const checkbox = screen.getByRole("checkbox", { name: "Experimentar seleção" });
    expect(checkbox).not.toBeChecked();
    await user.click(screen.getByText("Experimentar seleção"));
    expect(checkbox).toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("Checkbox selecionado.");
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("Checkbox não selecionado.");
  });

  it("abre o diálogo pelo teclado e devolve o foco ao fechar com Escape", async () => {
    const user = userEvent.setup();
    render(<ComponentDemo />);
    const trigger = screen.getByRole("button", { name: "Sobre esta demonstração" });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("dialog", { name: "Componentes para testar localmente" })).toBeVisible();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
