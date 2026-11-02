import { describe, expect, it, vi } from "vitest";
import { checkXlsxContainer, readEntryFile } from "@/modules/imports/infrastructure/read-entry-file";
import { entryWorkbook } from "../fixtures/entry-workbook";

describe("fronteira de arquivos da conferência local", () => {
  it.each([
    { name: "teste.xls", size: 20, type: "application/vnd.ms-excel" },
    { name: "teste.csv", size: 1024 * 1024 + 1, type: "text/csv" },
    { name: "teste.xlsx", size: 0, type: "" },
    { name: "teste.csv", size: 20, type: "text/html" },
  ])("rejeita formato/tamanho inválido antes de ler conteúdo", async (metadata) => {
    const arrayBuffer = vi.fn();
    await expect(readEntryFile({ ...metadata, arrayBuffer } as unknown as File)).rejects.toThrow("Selecione um CSV ou XLSX");
    expect(arrayBuffer).not.toHaveBeenCalled();
  });
  it("rejeita Excel renomeado e CSV com codificação inválida", async () => {
    const file = (name: string, data: Uint8Array) => ({ name, size: data.byteLength, type: "", arrayBuffer: async () => data.buffer }) as File;
    await expect(readEntryFile(file("teste.xlsx", new TextEncoder().encode("não é ZIP")))).rejects.toThrow("Excel inválido");
    await expect(readEntryFile(file("teste.csv", new Uint8Array([0xff, 0xff])))).rejects.toThrow("UTF-8");
  });
  it("verifica estrutura ZIP e orçamento de expansão antes do leitor Excel", () => {
    const data = entryWorkbook();
    const buffer = Uint8Array.from(data).buffer;
    expect(() => checkXlsxContainer(buffer)).not.toThrow();
    const view = new DataView(buffer);
    const directory = view.getUint32(buffer.byteLength - 22 + 16, true);
    view.setUint32(directory + 24, 11 * 1024 * 1024, true);
    expect(() => checkXlsxContainer(buffer)).toThrow("acima dos limites");
  });
});
