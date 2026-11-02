import { z } from "zod";
import { MAX_FILE_BYTES, MAX_ROWS, parseCsv } from "../domain/data-entry";
import { normalizeIdentityName } from "@/modules/productivity/domain/goal-normalization";

const fileSchema = z.object({
  name: z.string().max(255).regex(/\.(csv|xlsx)$/i),
  size: z.number().int().min(1).max(MAX_FILE_BYTES),
  type: z.enum(["", "text/csv", "text/plain", "application/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]),
});

/** Check ZIP directory budgets before invoking the XLSX reader. Not an upload endpoint. */
export function checkXlsxContainer(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  let end = -1;
  for (let offset = buffer.byteLength - 22; offset >= Math.max(0, buffer.byteLength - 65557); offset--) {
    if (view.getUint32(offset, true) === 0x06054b50) { end = offset; break; }
  }
  const fail = () => { throw new Error("Excel inválido ou acima dos limites. Use uma planilha simples, sem senha, com até 1.000 linhas."); };
  if (end < 0) return fail();
  const entries = view.getUint16(end + 10, true);
  if (entries < 1 || entries > 200 || view.getUint16(end + 4, true) !== 0 || view.getUint16(end + 6, true) !== 0) return fail();
  let offset = view.getUint32(end + 16, true), total = 0;
  for (let i = 0; i < entries; i++) {
    if (offset + 46 > end || view.getUint32(offset, true) !== 0x02014b50 || (view.getUint16(offset + 8, true) & 1)) return fail();
    total += view.getUint32(offset + 24, true);
    if (total > 10 * MAX_FILE_BYTES) return fail();
    offset += 46 + view.getUint16(offset + 28, true) + view.getUint16(offset + 30, true) + view.getUint16(offset + 32, true);
  }
  if (offset > end) return fail();
}

export async function readEntryFile(file: File): Promise<unknown[][]> {
  if (!fileSchema.safeParse({ name: file.name, size: file.size, type: file.type }).success) {
    throw new Error("Selecione um CSV ou XLSX de até 1 MiB. Outros formatos não são aceitos.");
  }
  const buffer = await file.arrayBuffer();
  if (buffer.byteLength !== file.size || buffer.byteLength > MAX_FILE_BYTES) throw new Error("Tamanho de arquivo inválido.");
  if (/\.csv$/i.test(file.name)) {
    try { return parseCsv(new TextDecoder("utf-8", { fatal: true }).decode(buffer)); }
    catch (error) { if (error instanceof TypeError) throw new Error("Salve o CSV em UTF-8 e tente novamente."); throw error; }
  }
  checkXlsxContainer(buffer);
  // Keep original numeric cell text: no float parsing, and no lost contract zeros accepted.
  const { default: readXlsx } = await import("read-excel-file/browser");
  let sheets;
  try { sheets = await readXlsx(buffer, { parseNumber: (numeric) => ({ numeric }), trim: false }); }
  catch { throw new Error("Não foi possível ler o Excel. Use o modelo e mantenha apenas uma aba de dados."); }
  if (sheets.length !== 1) throw new Error("Use um arquivo com apenas uma aba de dados para evitar importar uma aba incorreta.");
  const rows = sheets[0].data;
  if (!rows.length || rows.length > MAX_ROWS + 1 || rows.some((row) => row.length > 20)) throw new Error("Limite de 1.000 linhas ou 20 colunas excedido.");
  const headers = rows[0].map((cell) => typeof cell === "string" ? normalizeIdentityName(cell) : "");
  return rows.map((row, index) => headers.map((header, col) => {
    const cell = row[col] ?? "";
    if (index > 0 && typeof cell === "object" && cell !== null && "numeric" in cell && header === "PRODUCAO") return cell.numeric;
    if (index > 0 && header === "META BATIDA" && typeof cell === "boolean") return cell ? "SIM" : "NÃO";
    if (index > 0 && header === "META BATIDA" && typeof cell === "object" && cell !== null && "numeric" in cell) return cell.numeric;
    return cell;
  }));
}
