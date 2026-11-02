import Link from "next/link";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ProductivityPage } from "../application/read-productivity-page";
import type { ProductivityPageQuery } from "../domain/productivity-page";
import type { DashboardState } from "../domain/dashboard-state";
import { filterQueryString } from "../domain/filter-query";
import { formatDecimalPtBr, formatReferenceMonth } from "./format-decimal";
import { DetailsControls, DetailsPageButton, DetailsPageSize, DetailsRetryButton, DetailsRows, DetailsSearch, DetailsSortButton } from "./productivity-details-controls";

export type DetailsError = "invalid" | "unavailable";
const columns: { field: ProductivityPageQuery["sort"]; label: string }[] = [
  { field: "month", label: "Mês" }, { field: "supervisor", label: "Supervisor" }, { field: "technician", label: "Técnico" },
  { field: "contract", label: "Contrato" }, { field: "production", label: "Produção" }, { field: "goalMet", label: "Meta Batida" },
];

export function ProductivityDetails({ data, query, error }: { data: ProductivityPage | null; query: DashboardState; error?: DetailsError }) {
  const resetQuery = filterQueryString({ months: query.months, operations: query.operations, supervisors: query.supervisors });
  const resetHref = resetQuery ? `/demo?${resetQuery}` : "/demo";
  const { items = [], pagination } = data ?? {};
  const outside = pagination !== undefined && pagination.page > Math.max(1, pagination.totalPages);
  const first = pagination && items.length ? (pagination.page - 1) * pagination.pageSize + 1 : 0;
  return (
    <section aria-labelledby="details-heading" className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card [overflow-wrap:anywhere]">
      <div className="border-b border-border px-5 py-5 sm:px-6"><h2 id="details-heading" className="font-semibold">Detalhamento</h2><p className="mt-1 text-sm text-muted-foreground">Registros de produtividade do período</p></div>
      <DetailsControls>
        {error || !pagination ? <div role="alert" aria-labelledby="details-error-title" className="space-y-3 p-5 sm:p-6"><h3 id="details-error-title" className="font-semibold">{error === "invalid" ? "Parâmetros do detalhamento inválidos" : "Detalhamento indisponível"}</h3><p className="text-sm text-muted-foreground">{error === "invalid" ? "Revise pesquisa, ordenação e paginação ou redefina o detalhamento." : "Não foi possível carregar os registros. Tente novamente."}</p><div className="flex flex-wrap gap-3"><Link href={resetHref} className="min-w-0 max-w-full rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring">Redefinir detalhamento</Link>{error !== "invalid" && <DetailsRetryButton />}</div></div> : <>
          <DetailsSearch />
          <Table containerProps={{ role: "region", "aria-label": "Tabela de produtividade com rolagem horizontal", tabIndex: 0, className: "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring" }}>
            <TableCaption className="sr-only">Registros de produtividade. Seis colunas; ordenação atual por {columns.find((column) => column.field === query.sort)!.label}, {query.direction === "asc" ? "crescente" : "decrescente"}.</TableCaption>
            <TableHeader><TableRow>{columns.map(({ field, label }) => <TableHead key={field} scope="col" aria-sort={query.sort === field ? query.direction === "asc" ? "ascending" : "descending" : "none"} className="px-3 py-2"><DetailsSortButton field={field} label={label} /></TableHead>)}</TableRow></TableHeader>
            <TableBody><DetailsRows>{items.length ? items.map((row, index) => <TableRow key={`${pagination.page}-${index}`}><TableCell className="px-5 py-3">{formatReferenceMonth(row.month)}</TableCell><TableCell className="px-5 py-3">{row.supervisor}</TableCell><TableCell className="px-5 py-3">{row.technician}</TableCell><TableCell className="px-5 py-3">{row.contract}</TableCell><TableCell className="px-5 py-3 text-right tabular-nums">{formatDecimalPtBr(row.production)}</TableCell><TableCell className="px-5 py-3">{row.goalMet === null ? "—" : row.goalMet ? "Sim" : "Não"}</TableCell></TableRow>) : <TableRow><TableCell colSpan={6} className="px-5 py-10 text-center text-muted-foreground">{outside ? "Esta página não possui registros. Volte à primeira página." : "Nenhum registro encontrado para os filtros e a pesquisa aplicados."}</TableCell></TableRow>}</DetailsRows></TableBody>
          </Table>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-4 sm:px-6">
            <div role="status" aria-label="Resultados do detalhamento" className="space-y-1 text-sm text-muted-foreground"><p>{items.length ? `Exibindo ${first}–${first + items.length - 1} de ${pagination.total} registros` : `${pagination.total} registros no resultado`}</p><p>{outside ? `${pagination.totalPages} páginas disponíveis; página ${pagination.page} solicitada` : `Página ${pagination.page} de ${Math.max(1, pagination.totalPages)}`}</p></div>
            <DetailsPageSize />
            <nav aria-label="Paginação do detalhamento" className="flex min-w-0 max-w-full flex-wrap gap-2"><DetailsPageButton page={1} disabled={pagination.page === 1}>Primeira página</DetailsPageButton><DetailsPageButton page={Math.max(1, pagination.page - 1)} disabled={!pagination.hasPreviousPage}>Página anterior</DetailsPageButton><DetailsPageButton page={pagination.page + 1} disabled={!pagination.hasNextPage || pagination.page >= 1_000_000}>Próxima página</DetailsPageButton><DetailsPageButton page={Math.min(1_000_000, Math.max(1, pagination.totalPages))} disabled={!pagination.hasNextPage || pagination.page >= 1_000_000}>Última página</DetailsPageButton></nav>
          </div>
        </>}
      </DetailsControls>
    </section>
  );
}
