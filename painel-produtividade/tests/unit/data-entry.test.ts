import { describe, expect, it } from "vitest";
import { parseCsv, previewRows, ENTRY_HEADERS, MAX_ROWS } from "@/modules/imports/domain/data-entry";

const row = ["2026-07", "Operação teste", "Supervisor teste", "Técnico teste", "00001", "1.234,50", "SIM", "", ""];
describe("conferência compartilhada de produtividade", () => {
  it("preserva contrato e decimal sem arredondamento e usa a regra de meta existente", () => {
    const result = previewRows([ENTRY_HEADERS, row]);
    expect(result.errors).toEqual([]);
    expect(result.records[0]).toMatchObject({ contract: "00001", production: "1234.50", goalMet: true, month: "2026-07" });
    expect(result.totalProduction).toBe("1234.50");
  });
  it("exige ano explícito para competência legada", () => {
    expect(previewRows([ENTRY_HEADERS, ["Jul", ...row.slice(1)]]).errors[0].field).toBe("Mês");
    expect(previewRows([ENTRY_HEADERS, ["Jul", ...row.slice(1)]], "2025").records[0].month).toBe("2025-07");
  });
  it("meta desconhecida não vira falso; vazia permanece nula", () => {
    expect(previewRows([ENTRY_HEADERS, [...row.slice(0, 6), "talvez", "", ""]]).errors[0].field).toBe("Meta batida");
    expect(previewRows([ENTRY_HEADERS, [...row.slice(0, 6), "", "", ""]]).records[0].goalMet).toBeNull();
  });
  it.each(["1,234.50", "1.234", "1e3", "NaN", "1,234", "1000000000000", "=1+1"])("rejeita decimal inválido ou ambíguo %s", (production) => {
    expect(previewRows([ENTRY_HEADERS, [...row.slice(0, 5), production, ...row.slice(6)]]).records).toHaveLength(0);
  });
  it("não elimina duplicatas; relata nulos, negativos e erros por linha sem ecoar conteúdo", () => {
    const result = previewRows([ENTRY_HEADERS, row, row, [...row.slice(0, 5), "-0,10", "", "", ""], ["2026-00", ...row.slice(1)]]);
    expect(result.records).toHaveLength(3);
    expect(result).toMatchObject({ duplicateRows: 1, unknownGoals: 1, negativeRows: 1, totalProduction: "2468.90" });
    expect(result.errors[0]).toMatchObject({ line: 5, field: "Mês" });
  });
  it("rejeita contrato numérico do Excel e fórmula textual", () => {
    expect(previewRows([ENTRY_HEADERS, [...row.slice(0, 4), 1, ...row.slice(5)]]).errors[0].field).toBe("Contrato");
    expect(previewRows([ENTRY_HEADERS, [...row.slice(0, 3), "=HYPERLINK()", ...row.slice(4)]]).records).toHaveLength(0);
  });
  it("rejeita cabeçalho duplicado, ausente, estrutura excedente e limites", () => {
    expect(() => previewRows([[...ENTRY_HEADERS, "Mês"], row])).toThrow();
    expect(() => previewRows([ENTRY_HEADERS.slice(1), row])).toThrow();
    expect(() => previewRows([ENTRY_HEADERS, ...Array(MAX_ROWS + 1).fill(row)])).toThrow();
    expect(previewRows([ENTRY_HEADERS, [...row, "extra"]]).errors).toHaveLength(1);
  });
});
describe("CSV estrito", () => {
  it("lê BOM, aspas, separador e CRLF sem perder zeros", () => {
    expect(parseCsv('\ufeffa;b\r\n"0001";"nome; com ""aspas"""\r\n')).toEqual([["a", "b"], ["0001", 'nome; com "aspas"']]);
    expect(parseCsv('a,b\n"x\ny",z')).toEqual([["a", "b"], ["x\ny", "z"]]);
  });
  it.each(['a;b\n"sem fim', 'a;b\n"x"lixo;y', 'a;b\nx"y;z'])("rejeita CSV malformado", (value) => expect(() => parseCsv(value)).toThrow());
});
