"use client";

import { useEffect, useRef, useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function CsvExportAction({ href, disabled = false }: { href: string; disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; controller.current?.abort(); }; }, []);
  useEffect(() => () => controller.current?.abort(), [href]);

  async function download() {
    if (disabled || busy || controller.current) return;
    const current = new AbortController();
    controller.current = current;
    setBusy(true); setFailed(false); setMessage("Preparando CSV…");
    try {
      const response = await fetch(href, { credentials: "same-origin", signal: current.signal });
      if (!response.ok || !response.headers.get("content-type")?.startsWith("text/csv")) {
        const reason = response.status === 413 ? "O resultado excede o limite de exportação. Reduza o recorte." : response.status === 409 ? "Os dados mudaram. Tente exportar novamente." : response.status === 401 || response.status === 403 ? "Exportação não autorizada." : "Não foi possível exportar. Tente novamente.";
        throw new Error(reason);
      }
      const blob = await response.blob();
      if (!mounted.current || current.signal.aborted) return;
      const filename = response.headers.get("content-disposition")?.match(/filename="([A-Za-z0-9._-]+\.csv)"/)?.[1] ?? "servlog-produtividade.csv";
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl; anchor.download = filename;
      document.body.append(anchor);
      anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setMessage("CSV preparado para download.");
    } catch (error) {
      if (!mounted.current) return;
      setFailed(true);
      setMessage(current.signal.aborted ? "Exportação cancelada porque o recorte foi alterado." : error instanceof Error && ["O resultado excede o limite de exportação. Reduza o recorte.", "Os dados mudaram. Tente exportar novamente.", "Exportação não autorizada.", "Não foi possível exportar. Tente novamente."].includes(error.message) ? error.message : "Não foi possível exportar. Tente novamente.");
    } finally {
      if (controller.current === current) controller.current = null;
      if (mounted.current) setBusy(false);
    }
  }
  const Icon = busy ? LoaderCircle : Download;
  return <TooltipProvider><div className="flex max-w-full flex-col gap-2"><Tooltip><TooltipTrigger asChild><Button type="button" variant="outline" size="icon-lg" aria-label="Exportar CSV" aria-disabled={disabled || busy || undefined} aria-busy={busy || undefined} className="aria-disabled:opacity-50" onClick={download}><Icon aria-hidden="true" className={busy ? "animate-spin motion-reduce:animate-none" : undefined} /></Button></TooltipTrigger><TooltipContent>{busy ? "Preparando CSV…" : "Exportar todos os registros do detalhamento aplicado"}</TooltipContent></Tooltip>{message && <p role={failed ? "alert" : "status"} aria-label="Estado da exportação" className={`max-w-64 text-xs leading-5 [overflow-wrap:anywhere] ${failed ? "text-destructive" : "text-muted-foreground"}`}>{message}</p>}</div></TooltipProvider>;
}
