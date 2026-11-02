import { CalendarDays } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { readProductivityDashboard } from "../application/read-productivity-dashboard";
import { formatReferenceMonth } from "./format-decimal";
import { DashboardFilters } from "./dashboard-filters";
import { SummaryIndicators } from "./summary-indicators";
import type { DashboardSummary } from "../application/dashboard-summary-contract";
import type { DashboardMonthly } from "../application/dashboard-monthly-contract";
import { MonthlyPerformancePanel } from "./monthly-performance-panel";
import type { DashboardSupervisors } from "../application/dashboard-supervisors-contract";
import { SupervisorsPerformancePanel } from "./supervisors-performance-panel";
import type { ProductivityPage } from "../application/read-productivity-page";
import { ProductivityDetails, type DetailsError } from "./productivity-details";
import { dashboardCsvQueryString, type DashboardState } from "../domain/dashboard-state";
import { DashboardStateProvider } from "./dashboard-state-provider";

type Data = Awaited<ReturnType<typeof readProductivityDashboard>>;

export function LocalPreview({ summary, monthly, supervisors, details, detailsError, state, filters, options }: { summary: DashboardSummary; monthly: DashboardMonthly; supervisors: DashboardSupervisors; details: ProductivityPage | null; detailsError?: DetailsError; state: DashboardState } & Pick<Data, "filters" | "options">) {
  const months = filters.months.length > 0 ? filters.months : options.months;
  const csvHref = details ? `/api/demo/productivity/export?${dashboardCsvQueryString(state)}` : undefined;
  const period = months.length === 0 ? "Sem competências disponíveis" : months.length > 2 ? `${months.length} competências` : months.map(formatReferenceMonth).join(" e ");

  return (
    <DashboardShell>
      <DashboardStateProvider query={state}>
      <section aria-labelledby="overview-title" className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Visão geral</p>
          <h2 id="overview-title" className="text-2xl font-semibold tracking-tight">Resultados do período</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Explore o painel com dados fictícios. Nenhuma base empresarial está conectada.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground"><CalendarDays className="size-4 shrink-0 text-primary" aria-hidden="true" />{period}</div>
      </section>

      <DashboardFilters options={options} csvHref={csvHref} />
      <section aria-label="Escopo da demonstração" className="flex flex-wrap gap-x-6 gap-y-2 rounded-xl border border-border bg-card/60 px-5 py-4 text-sm text-muted-foreground">
        <span>{filters.operations.length || options.operations.length} operações de exemplo</span><span>{filters.supervisors.length || options.supervisors.length} equipes fictícias</span><span>{summary.rowCount} registros no período</span>
      </section>

      <SummaryIndicators summary={summary} />

      <MonthlyPerformancePanel monthly={monthly} />

      <SupervisorsPerformancePanel supervisors={supervisors} months={filters.months} />

      <ProductivityDetails data={details} query={state} error={detailsError} />
      </DashboardStateProvider>
    </DashboardShell>
  );
}
