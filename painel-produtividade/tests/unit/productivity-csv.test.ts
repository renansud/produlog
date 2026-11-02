import { describe, expect, it } from "vitest";
import { csvHeader, encodeProductivityCsvRow, protectCsvText } from "@/modules/productivity/domain/productivity-csv";

const row = { month: "2026-07", supervisor: "Equipe Exemplo", technician: "TEC-01", contract: "00001", production: "-10.25", goalMet: null };

describe("CSV pt-BR e proteção de fórmulas", () => {
  it("protege operadores após espaços e controles invisíveis, inclusive combinados", () => {
    const prefixes = ["", " ", "\t", "\r\n", "\u0000", "\u007f", "\u0085", "\u00a0", "\u200b", "\u200e", "\u202e", "\u2060", "\ufeff", " \u200b\t\ufeff"];
    for (const prefix of prefixes) {
      for (const operator of ["=", "+", "-", "@", "＝", "＋", "－", "＠"]) {
        const value = `${prefix}${operator}1`;
        expect(protectCsvText(value)).toBe(`'${value}`);
        const encoded = encodeProductivityCsvRow({ ...row, supervisor: value, technician: value, contract: value });
        expect(encoded).toContain(`;"'${value}";"'${value}";"'${value}";"-10,25";`);
      }
    }
  });
  it.each(["=1+1", "+1+1", "-1+1", "@SUM(1)", "  =1+1", "\tNome", "\rNome", "\nNome", "\u200b=1+1", "＝1+1", "＋1", "－1", "＠SUM(1)"])("neutraliza texto inseguro: %j", (value) => {
    expect(protectCsvText(value)).toBe(`'${value}`);
  });
  it("não modifica texto comum nem trata produção negativa como fórmula", () => {
    expect(protectCsvText("00001")).toBe("00001");
    expect(protectCsvText("Nome comum")).toBe("Nome comum");
    expect(encodeProductivityCsvRow(row)).toBe('"Julho de 2026";"Equipe Exemplo";"TEC-01";"00001";"-10,25";"—"\r\n');
  });
  it("mantém cabeçalho, BOM, seis colunas e CRLF", () => {
    expect(csvHeader).toBe('\uFEFF"Mês";"Supervisor";"Técnico";"Contrato";"Produção";"Meta Batida"\r\n');
    expect(Array.from(new TextEncoder().encode(csvHeader).slice(0, 3))).toEqual([239, 187, 191]);
  });
  it("escapa aspas/separadores/quebras dentro da célula sem criar uma nova coluna", () => {
    const csv = encodeProductivityCsvRow({ ...row, supervisor: 'Equipe "A"; outra\r\nlinha', technician: '=1+1";=2+2', goalMet: true });
    expect(csv).toContain('"Equipe ""A""; outra\r\nlinha"');
    expect(csv).toContain('"\'=1+1"";=2+2"');
    expect(csv.endsWith(';"Sim"\r\n')).toBe(true);
  });
  it("não usa float na produção e distingue Não de indeterminado", () => {
    expect(encodeProductivityCsvRow({ ...row, production: "999999999999.99", goalMet: false })).toContain(';"999999999999,99";"Não"');
  });
});
