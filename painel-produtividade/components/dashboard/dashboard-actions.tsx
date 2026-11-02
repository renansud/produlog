"use client";

import { useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CsvExportAction } from "./csv-export-action";
import { useTheme } from "next-themes";
import { Download, Moon, RefreshCw, RotateCcw, Sun, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function IconAction({ label, tooltip = label, icon: Icon, disabled = false, busy = false, onClick }: {
  label: string; tooltip?: string; icon: LucideIcon; disabled?: boolean; busy?: boolean; onClick?: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="outline" size="icon-lg" aria-label={label} aria-disabled={disabled || undefined} aria-busy={busy || undefined} className="aria-disabled:opacity-50" onClick={() => { if (!disabled) onClick?.(); }}>
          <Icon aria-hidden="true" className={busy ? "animate-spin motion-reduce:animate-none" : undefined} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function DashboardActions({ allowRefresh = true }: { allowRefresh?: boolean }) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [pending, startTransition] = useTransition();
  const light = mounted && resolvedTheme === "light";
  const themeLabel = mounted ? light ? "Ativar tema escuro" : "Ativar tema claro" : "Alternar tema";
  return (
    <TooltipProvider>
      <div role="group" aria-label="Ações do painel" className="flex items-center gap-2">
        {allowRefresh && <IconAction label="Atualizar dados" tooltip={pending ? "Atualizando dados…" : "Atualizar dados"} icon={RefreshCw} disabled={pending} busy={pending} onClick={() => startTransition(() => router.refresh())} />}
        <IconAction label={themeLabel} icon={light ? Moon : Sun} disabled={!mounted} onClick={() => setTheme(light ? "dark" : "light")} />
        <span role="status" aria-label="Estado de atualização" className="sr-only">{pending ? "Atualizando dados…" : ""}</span>
      </div>
    </TooltipProvider>
  );
}

export function DashboardFilterActions({ pending, canClear, onClear, csvHref }: { pending: boolean; canClear: boolean; onClear: () => void; csvHref?: string }) {
  return (
    <TooltipProvider>
      <div role="group" aria-label="Ações dos filtros" className="flex items-start gap-2 pb-0.5">
        <IconAction label="Limpar filtros" tooltip={canClear ? "Limpar filtros" : "Nenhum filtro selecionado"} icon={RotateCcw} disabled={pending || !canClear} onClick={onClear} />
        {csvHref ? <CsvExportAction key={csvHref} href={csvHref} disabled={pending} /> : <IconAction label="Exportar CSV" tooltip="Detalhamento indisponível para exportação." icon={Download} disabled />}
      </div>
    </TooltipProvider>
  );
}
