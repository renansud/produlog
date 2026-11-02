"use client";

import { useId, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import type { ProductivityPageQuery } from "../domain/productivity-page";
import { dashboardStateQueryString } from "../domain/dashboard-state";
import { useDashboardState as useDetails } from "./dashboard-state-provider";

const wrappingButton = "h-auto min-h-8 max-w-full whitespace-normal py-1.5 aria-disabled:opacity-50";

export function DetailsControls({ children }: { children: ReactNode }) {
  const { pending, message } = useDetails();
  return (
      <div aria-label="Conteúdo do detalhamento" role="region" aria-busy={pending}>
        {message && <p role="alert" className="px-5 py-3 text-sm text-destructive">{message}</p>}
        <p role="status" aria-label="Atualização do detalhamento" className="sr-only">{pending ? "Atualizando detalhamento…" : "Detalhamento atualizado."}</p>
        {children}
      </div>
  );
}

export function DetailsSearch() {
  const { query, pending, change } = useDetails();
  const id = useId();
  return (
    <form className="flex flex-wrap items-end gap-3 px-5 py-4 sm:px-6" onSubmit={(event) => {
      event.preventDefault();
      if (pending) return;
      const value = new FormData(event.currentTarget).get("search");
      change({ type: "search", search: typeof value === "string" ? value : "" });
    }}>
      <div className="min-w-0 flex-1 space-y-2 basis-52">
        <label htmlFor={id} className="text-sm font-medium">Pesquisar no detalhamento</label>
        <Input key={dashboardStateQueryString(query)} id={id} name="search" type="search" defaultValue={query.search} maxLength={120} disabled={pending} autoComplete="off" placeholder="Técnico, supervisor, contrato…" />
      </div>
      <Button type="submit" variant="outline" className={wrappingButton} aria-disabled={pending}>Pesquisar</Button>
      <Button type="button" variant="ghost" className={wrappingButton} aria-disabled={pending || !query.search} onClick={() => { if (!pending && query.search) change({ type: "search", search: "" }); }}>Limpar pesquisa</Button>
      <p className="basis-full text-xs leading-5 text-muted-foreground">Use Pesquisar para aplicar o texto à tabela e ao CSV. Os indicadores e gráficos seguem os filtros acima.</p>
    </form>
  );
}

export function DetailsSortButton({ field, label }: { field: ProductivityPageQuery["sort"]; label: string }) {
  const { query, pending, change } = useDetails();
  const Icon = query.sort !== field ? ArrowUpDown : query.direction === "asc" ? ArrowUp : ArrowDown;
  return <Button type="button" variant="ghost" size="sm" className="aria-disabled:opacity-50" aria-label={`Ordenar por ${label}`} aria-disabled={pending} onClick={() => change({ type: "sort", field })}>{label}<Icon className="size-4" aria-hidden="true" /></Button>;
}

export function DetailsPageButton({ page, disabled, children }: { page: number; disabled?: boolean; children: ReactNode }) {
  const { pending, change } = useDetails();
  return <Button type="button" variant="outline" size="sm" className={wrappingButton} aria-disabled={pending || disabled} onClick={() => { if (!disabled) change({ type: "page", page }); }}>{children}</Button>;
}

export function DetailsPageSize() {
  const { query, pending, change } = useDetails();
  const id = useId();
  const sizes = [...new Set([5, 10, 25, 50, 100, query.pageSize])].sort((a, b) => a - b);
  return <div className="flex flex-wrap items-center gap-2 text-sm"><label htmlFor={id}>Linhas por página</label><select id={id} value={query.pageSize} disabled={pending} className="h-9 rounded-lg border border-input bg-card px-2 text-foreground focus-visible:outline-2 focus-visible:outline-ring" onChange={(event) => change({ type: "pageSize", pageSize: Number(event.target.value) })}>{sizes.map((size) => <option key={size} value={size}>{size}</option>)}</select></div>;
}

export function DetailsRows({ children }: { children: ReactNode }) {
  const { pending } = useDetails();
  if (!pending) return children;
  return <>{[0, 1, 2].map((index) => <TableRow key={index}><TableCell colSpan={6} className="px-5 py-4"><span className="sr-only">Carregando registros…</span><div aria-hidden="true" className="h-5 animate-pulse rounded bg-muted motion-reduce:animate-none" /></TableCell></TableRow>)}</>;
}

export function DetailsRetryButton() {
  const { pending, refresh } = useDetails();
  return <Button type="button" variant="outline" className={wrappingButton} aria-disabled={pending} onClick={() => { if (!pending) refresh(); }}>Tentar novamente</Button>;
}
