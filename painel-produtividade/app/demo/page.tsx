import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LocalPreview } from "@/modules/productivity/presentation/local-preview";
import { createDemoDependencies } from "@/modules/productivity/infrastructure/demo-dashboard";
import { ProductivityAccessError, ProductivityInputError, readProductivityDashboard } from "@/modules/productivity/application/read-productivity-dashboard";
import { dashboardStateSchema, reconcileDashboardState } from "@/modules/productivity/domain/dashboard-state";
import { dashboardInputFromPageQuery, productivityPageInputFromQuery } from "@/modules/productivity/domain/productivity-page";
import { readProductivityPage, type ProductivityPage } from "@/modules/productivity/application/read-productivity-page";
import { createDemoProductivityPageDependencies } from "@/modules/productivity/infrastructure/productivity-page-dependencies";
import type { DetailsError } from "@/modules/productivity/presentation/productivity-details";
import { buildDashboardSummary } from "@/modules/productivity/application/dashboard-summary-contract";
import { SummaryUnavailable } from "@/modules/productivity/presentation/summary-indicators";
import { buildDashboardMonthly } from "@/modules/productivity/application/dashboard-monthly-contract";
import { buildDashboardSupervisors } from "@/modules/productivity/application/dashboard-supervisors-contract";

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.NODE_ENV !== "development") notFound();

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value]) params.append(key, item);
  }
  let data;
  let summary;
  let monthly;
  let supervisors;
  try {
    data = await readProductivityDashboard(createDemoDependencies(), dashboardInputFromPageQuery(params));
    summary = buildDashboardSummary(data.summary);
    monthly = buildDashboardMonthly(data.monthly);
    supervisors = buildDashboardSupervisors(data.supervisors);
  } catch (error) {
    if (!(error instanceof ProductivityInputError || error instanceof ProductivityAccessError)) return <DashboardShell><SummaryUnavailable /></DashboardShell>;
    return <DashboardShell><section role="alert" aria-labelledby="filter-error-title" className="space-y-3 rounded-xl border border-border bg-card p-6"><h2 id="filter-error-title" className="text-lg font-semibold">Filtros não disponíveis</h2><p className="text-sm text-muted-foreground">Revise as seleções ou retorne à demonstração completa.</p><Link href="/demo" className="inline-block rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Limpar filtros</Link></section></DashboardShell>;
  }
  if (data.discardedSupervisorIds.length > 0) {
    const query = reconcileDashboardState(params, data.filters);
    redirect(query ? `/demo?${query}` : "/demo");
  }
  let details: ProductivityPage | null = null;
  let detailsError: DetailsError | undefined;
  const parsedState = dashboardStateSchema.safeParse({ ...productivityPageInputFromQuery(params), ...data.filters });
  let state = parsedState.success ? parsedState.data : dashboardStateSchema.parse(data.filters);
  if (!parsedState.success) detailsError = "invalid";
  else {
    try {
      details = await readProductivityPage(createDemoProductivityPageDependencies(), parsedState.data);
      state = dashboardStateSchema.parse({ ...details.selected, page: details.pagination.page, pageSize: details.pagination.pageSize });
    } catch (error) {
      detailsError = error instanceof ProductivityInputError ? "invalid" : "unavailable";
    }
  }
  return <LocalPreview summary={summary} monthly={monthly} supervisors={supervisors} details={details} detailsError={detailsError} state={state} filters={data.filters} options={data.options} />;
}
