"use client";

import type { readProductivityDashboard } from "../application/read-productivity-dashboard";
import { hasDashboardFilters } from "../domain/dashboard-state";
import { useDashboardState } from "./dashboard-state-provider";
import { formatReferenceMonth } from "./format-decimal";
import { MultiSelectFilter } from "@/components/dashboard/multi-select-filter";
import { DashboardFilterActions } from "@/components/dashboard/dashboard-actions";

type Data = Awaited<ReturnType<typeof readProductivityDashboard>>;
type Filters = Data["filters"];

export function DashboardFilters({ options, csvHref }: Pick<Data, "options"> & { csvHref?: string }) {
  const { selection, pending, change: apply } = useDashboardState();

  function change(key: keyof Filters, values: string[]) {
    const next = { months: selection.months, operations: selection.operations, supervisors: selection.supervisors, [key]: values };
    if (key === "operations") {
      const valid = new Set(options.supervisors.filter((option) => values.length === 0 || option.operationIds.some((operation) => values.includes(operation))).map((option) => option.id));
      next.supervisors = next.supervisors.filter((supervisor) => valid.has(supervisor));
    }
    apply({ type: "filters", filters: next });
  }

  return (
    <section aria-label="Filtros de produtividade" aria-busy={pending} className="rounded-xl border border-border bg-card px-5 py-4">
      <div className="grid items-end gap-4 sm:grid-cols-3 xl:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
        <MultiSelectFilter label="Mês" options={options.months.map((month) => ({ id: month, label: formatReferenceMonth(month) }))} selected={selection.months} disabled={pending} onChange={(values) => change("months", values)} />
        <MultiSelectFilter label="Operação" options={options.operations} selected={selection.operations} disabled={pending} onChange={(values) => change("operations", values)} />
        <MultiSelectFilter label="Supervisor" options={options.supervisors} selected={selection.supervisors} disabled={pending} onChange={(values) => change("supervisors", values)} />
        <DashboardFilterActions pending={pending} canClear={hasDashboardFilters(selection)} onClear={() => apply({ type: "clear" })} csvHref={csvHref} />
      </div>
      <p role="status" className="mt-3 min-h-5 text-xs text-muted-foreground">{pending ? "Atualizando resultados…" : "Filtros aplicados. Mês não altera a série mensal nem a Evolução."}</p>
    </section>
  );
}
