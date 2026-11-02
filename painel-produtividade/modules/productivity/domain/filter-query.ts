import { productivityFiltersSchema } from "./productivity-filters";

/** Apenas converte a URL; o caso de uso valida depois de verificar o acesso. */
export function filterInputFromQuery(params: URLSearchParams): Record<string, unknown> {
  return Object.fromEntries([...new Set(params.keys())].map((key) => [key, params.getAll(key).flatMap((value) => value === "" ? [] : value.split(",").map((item) => item.trim()))]));
}

export function filterQueryString(input: unknown): string {
  const filters = productivityFiltersSchema.parse(input);
  const params = new URLSearchParams();
  for (const key of ["months", "operations", "supervisors"] as const) {
    if (filters[key].length > 0) params.set(key, filters[key].join(","));
  }
  return params.toString();
}
