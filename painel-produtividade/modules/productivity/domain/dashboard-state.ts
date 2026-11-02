import { filterQueryString } from "./filter-query";
import { productivityPageInputFromQuery, productivityPageQuerySchema, productivityPageQueryString, type ProductivityPageQuery } from "./productivity-page";

export const dashboardStateSchema = productivityPageQuerySchema.extend({ pageSize: productivityPageQuerySchema.shape.pageSize.default(10) });
export type DashboardState = ProductivityPageQuery;
type Filters = Pick<DashboardState, "months" | "operations" | "supervisors">;
export type DashboardChange =
  | { type: "filters"; filters: Filters } | { type: "clear" }
  | { type: "search"; search: string } | { type: "sort"; field: DashboardState["sort"] }
  | { type: "pageSize"; pageSize: number } | { type: "page"; page: number };

export function transitionDashboardState(input: DashboardState, change: DashboardChange): DashboardState {
  const current = dashboardStateSchema.parse(input);
  switch (change.type) {
    case "filters": return dashboardStateSchema.parse({ ...current, ...change.filters, page: 1 });
    case "clear": return { ...current, months: [], operations: [], supervisors: [], search: "", page: 1 };
    case "search": return dashboardStateSchema.parse({ ...current, search: change.search, page: 1 });
    case "sort": return dashboardStateSchema.parse({ ...current, sort: change.field, direction: current.sort === change.field && current.direction === "asc" ? "desc" : "asc", page: 1 });
    case "pageSize": return dashboardStateSchema.parse({ ...current, pageSize: change.pageSize, page: 1 });
    case "page": return dashboardStateSchema.parse({ ...current, page: change.page });
  }
}

export function dashboardStateQueryString(input: unknown): string {
  const state = dashboardStateSchema.parse(input);
  const params = new URLSearchParams(productivityPageQueryString(state));
  if (state.pageSize === 10) params.delete("pageSize");
  return params.toString();
}

export function reconcileDashboardState(params: URLSearchParams, filters: Filters): string {
  const next = new URLSearchParams(params);
  for (const key of ["months", "operations", "supervisors"]) next.delete(key);
  for (const [key, value] of new URLSearchParams(filterQueryString(filters))) next.append(key, value);
  next.delete("page");
  const parsed = dashboardStateSchema.safeParse(productivityPageInputFromQuery(next));
  return parsed.success ? dashboardStateQueryString(parsed.data) : next.toString();
}

export function hasDashboardFilters(state: DashboardState): boolean {
  return Boolean(state.months.length || state.operations.length || state.supervisors.length || state.search);
}

export function dashboardCsvQueryString(input: DashboardState): string {
  return productivityPageQueryString({ ...dashboardStateSchema.parse(input), page: 1, pageSize: 100 });
}
