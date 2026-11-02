"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ENTRY_HEADERS, previewRows, type EntryPreview } from "../domain/data-entry";
import { readEntryFile } from "../infrastructure/read-entry-file";

const fields = [
  { name: "month", label: "Mês", type: "month", hint: "Informe mês e ano da competência." },
  { name: "operation", label: "Operação" },
  { name: "supervisor", label: "Supervisor" },
  { name: "technician", label: "Técnico" },
  { name: "contract", label: "Contrato", hint: "Mantenha os zeros iniciais, se houver." },
  { name: "production", label: "Produção", hint: "Até duas casas decimais. Exemplo: 1.234,50." },
  { name: "controller", label: "Controlador", optional: true },
  { name: "status", label: "Status", optional: true },
];
const inputClass = "h-auto min-h-11 min-w-0 py-2 text-base";
const buttonClass = "h-auto min-h-11 whitespace-normal px-4 py-2";

function downloadTemplate() {
  const csv = `\ufeff${ENTRY_HEADERS.join(";")}\r\n`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "modelo-produtividade.csv";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function DataEntry({ demo = false }: { demo?: boolean }) {
  const [preview, setPreview] = useState<EntryPreview | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const clear = () => { setPreview(null); setError(""); };
  const focusReport = () => requestAnimationFrame(() => reportRef.current?.focus());
  function manual(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const row = ["month", "operation", "supervisor", "technician", "contract", "production", "goalMet", "controller", "status"].map((key) => form.get(key) ?? "");
    setPreview(previewRows([ENTRY_HEADERS, row]));
    setError("");
    focusReport();
  }
  async function spreadsheet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    clear();
    if (!(file instanceof File) || !file.size) { setError("Selecione uma planilha para conferir."); focusReport(); return; }
    setBusy(true);
    try {
      const rows = await readEntryFile(file);
      setPreview(previewRows(rows, String(form.get("year") ?? "")));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Não foi possível conferir a planilha. Revise o arquivo.");
    } finally { setBusy(false); focusReport(); }
  }
  return <section className="min-w-0 space-y-6" aria-labelledby="entry-title">
    <div className="space-y-2"><p className="text-sm text-primary">Administração · Produtividade</p><h1 id="entry-title" className="text-2xl font-semibold sm:text-3xl">Inserção de dados</h1><p className="text-muted-foreground">Preencha um registro ou confira uma planilha antes do envio.</p></div>
    <Alert role="note"><AlertTitle>{demo ? "Demonstração local" : "Conferência disponível"}</AlertTitle><AlertDescription>{demo ? "Use somente dados fictícios para testar os formulários. " : ""}A conferência acontece neste navegador. Nenhum registro é salvo ou enviado. O envio definitivo ainda não está disponível.</AlertDescription></Alert>
    <Tabs defaultValue="manual" onValueChange={clear} className="min-w-0 gap-5">
      <TabsList aria-label="Forma de inserção" className="grid h-auto! w-full grid-cols-2 sm:w-fit"><TabsTrigger value="manual" className={buttonClass}>Formulário</TabsTrigger><TabsTrigger value="spreadsheet" className={buttonClass}>Planilha</TabsTrigger></TabsList>
      <TabsContent value="manual" forceMount className="min-w-0 data-[state=inactive]:hidden"><Card><CardHeader><CardTitle>Registro de produtividade</CardTitle><CardDescription>Campos obrigatórios, exceto os marcados como opcionais. A meta pode ficar não informada.</CardDescription></CardHeader><CardContent>
        <form noValidate onSubmit={manual} onChange={clear} onReset={clear} className="space-y-5">
          <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">{fields.map((field) => {
            const issue = preview?.errors.find((item) => item.field === field.label);
            return <div key={field.name} className="min-w-0 space-y-2"><Label htmlFor={`entry-${field.name}`} className="flex-wrap leading-normal">{field.label}{field.optional ? " (opcional)" : " *"}</Label><Input id={`entry-${field.name}`} name={field.name} type={field.type ?? "text"} inputMode={field.name === "production" ? "decimal" : undefined} required={!field.optional} maxLength={200} className={inputClass} aria-invalid={!!issue} aria-describedby={`${field.name}-hint`} /><p id={`${field.name}-hint`} className={`text-sm ${issue ? "text-destructive" : "text-muted-foreground"}`}>{issue?.message ?? field.hint}</p></div>;
          })}<div className="min-w-0 space-y-2"><Label htmlFor="entry-goal">Meta batida</Label><NativeSelect id="entry-goal" name="goalMet" className="w-full [&_select]:h-auto [&_select]:min-h-11 [&_select]:text-base" aria-invalid={preview?.errors.some((item) => item.field === "Meta batida")}><NativeSelectOption value="">Não informada</NativeSelectOption><NativeSelectOption value="SIM">Sim</NativeSelectOption><NativeSelectOption value="NÃO">Não</NativeSelectOption></NativeSelect></div></div>
          <p className="text-sm text-muted-foreground">Operação, supervisor e técnico serão conferidos com os cadastros existentes antes do envio definitivo.</p>
          <div className="flex flex-wrap gap-3"><Button type="submit" className={buttonClass}>Conferir registro</Button><Button type="reset" variant="outline" className={buttonClass}>Limpar formulário</Button></div>
        </form>
      </CardContent></Card></TabsContent>
      <TabsContent value="spreadsheet" forceMount className="min-w-0 data-[state=inactive]:hidden"><Card><CardHeader><CardTitle>Importar planilha</CardTitle><CardDescription>CSV UTF-8 ou Excel XLSX com uma aba, até 1 MiB e 1.000 linhas de dados.</CardDescription></CardHeader><CardContent className="space-y-5">
        <Button type="button" variant="outline" onClick={downloadTemplate} className={buttonClass}>Baixar modelo CSV</Button>
        <p className="text-sm leading-6 text-muted-foreground">Colunas: {ENTRY_HEADERS.join(", ")}. Controlador e Status são opcionais. No Excel, use o tipo Texto para Contrato, preservando os zeros. Não inclua fórmulas. Mês deve conter AAAA-MM ou o nome do mês com o ano de referência abaixo.</p>
        <form noValidate onSubmit={spreadsheet} onChange={clear} onReset={clear} aria-busy={busy}>
          <fieldset disabled={busy} className="min-w-0 space-y-5"><div className="min-w-0 space-y-2"><Label htmlFor="entry-file">Arquivo da planilha *</Label><Input id="entry-file" name="file" type="file" accept=".csv,.xlsx" required className={`${inputClass} w-full file:mr-2 file:whitespace-normal`} aria-describedby="file-hint" /><p id="file-hint" className="text-sm text-muted-foreground">O arquivo será lido apenas neste navegador. XLS antigo não é aceito.</p></div>
          <div className="space-y-2"><Label htmlFor="entry-year">Ano de referência (opcional)</Label><Input id="entry-year" name="year" inputMode="numeric" maxLength={4} placeholder="AAAA" className={`${inputClass} max-w-64`} aria-describedby="year-hint" /><p id="year-hint" className="text-sm text-muted-foreground">Obrigatório se o mês vier sem ano, por exemplo Jul. Não altera competências já completas.</p></div>
          <div className="flex flex-wrap gap-3"><Button type="submit" className={buttonClass}>{busy ? "Conferindo…" : "Conferir planilha"}</Button><Button type="reset" variant="outline" className={buttonClass}>Limpar seleção</Button></div></fieldset>
        </form>
      </CardContent></Card></TabsContent>
    </Tabs>
    <div ref={reportRef} role="region" tabIndex={-1} className="min-w-0 space-y-4 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Resultado da conferência" aria-live="polite" aria-busy={busy}>
      {busy && <p role="status">Lendo e conferindo a planilha…</p>}
      {error && <Alert variant="destructive"><AlertTitle>Revise a planilha</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
      {preview && <PreviewResult preview={preview} />}
    </div>
  </section>;
}

function PreviewResult({ preview }: { preview: EntryPreview }) {
  const invalid = new Set(preview.errors.map((issue) => issue.line)).size;
  return <>
    <Alert role="status"><AlertTitle>Conferência concluída · Nenhum dado salvo</AlertTitle><AlertDescription>{preview.received} linha(s) recebida(s), {preview.records.length} válida(s), {invalid} com erro. Produção válida total: {preview.totalProduction.replace(".", ",")}.</AlertDescription></Alert>
    {preview.errors.length > 0 && <Alert variant="destructive"><AlertTitle>Corrija os campos indicados</AlertTitle><AlertDescription><ul className="list-inside list-disc space-y-2">{preview.errors.slice(0, 20).map((issue, index) => <li key={index}>Linha {issue.line} · {issue.field}: {issue.message}</li>)}</ul>{preview.errors.length > 20 && <p className="mt-2">Exibindo 20 de {preview.errors.length} erros. Corrija e confira novamente.</p>}</AlertDescription></Alert>}
    <Card><CardHeader><CardTitle>Prévia dos registros</CardTitle><CardDescription>{preview.records.length ? `Exibindo até 20 de ${preview.records.length} registros válidos. Revise os vínculos de operação, supervisor e técnico antes do envio.` : "Nenhum registro válido. Corrija os campos e confira novamente."}</CardDescription></CardHeader><CardContent className="min-w-0 space-y-4">
      <p className="text-sm text-muted-foreground">{preview.duplicateRows} linha(s) repetida(s), preservada(s) para revisão. {preview.unknownGoals} sem meta informada. {preview.negativeRows} com produção negativa.</p>
      {preview.records.length > 0 && <Table containerProps={{ tabIndex: 0, role: "region", "aria-label": "Registros conferidos, role horizontalmente para ver todas as colunas", className: "min-w-0 rounded-md border focus-visible:outline-2 focus-visible:outline-ring" }}><TableHeader><TableRow>{ENTRY_HEADERS.map((header) => <TableHead key={header}>{header}</TableHead>)}</TableRow></TableHeader><TableBody>{preview.records.slice(0, 20).map((record, index) => <TableRow key={index}>{[record.month, record.operation, record.supervisor, record.technician, record.contract, record.production.replace(".", ","), record.goalMet === null ? "Não informada" : record.goalMet ? "Sim" : "Não", record.controller || "—", record.status || "—"].map((value, col) => <TableCell key={col}>{value}</TableCell>)}</TableRow>)}</TableBody></Table>}
      <Button disabled className={buttonClass}>Enviar dados (em breve)</Button>
    </CardContent></Card>
  </>;
}
