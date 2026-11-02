import { MonthlyChart } from "@/components/dashboard/monthly-chart";
import type { DashboardMonthly } from "../application/dashboard-monthly-contract";
import { formatDecimalPtBr, formatReferenceMonth } from "./format-decimal";

const percent = (value: number) => `${formatDecimalPtBr(value.toFixed(2))}%`;

export function MonthlyPerformancePanel({ monthly }: { monthly: DashboardMonthly }) {
  const points = monthly.series.map(({ month, rate, technicians, goalsMet, unknownGoals, coverage }) => ({ month, rate, technicians, goalsMet, unknownGoals, coverage, label: formatReferenceMonth(month) }));
  const hasUnknown = points.some((point) => point.unknownGoals > 0);
  const hasConflict = monthly.quality.warnings.some((warning) => warning.code === "CONFLICTING_GOALS");
  return (
    <section aria-labelledby="monthly-heading" className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="space-y-2 border-b border-border px-5 py-5 sm:px-6">
        <h2 id="monthly-heading" className="font-semibold">Performance Mensal</h2>
        <p className="text-sm text-muted-foreground">Metas por competência · {points.length ? `${formatReferenceMonth(points[0].month)} a ${formatReferenceMonth(points.at(-1)!.month)}` : "Sem competências disponíveis"}</p>
        <p className="text-xs leading-5 text-muted-foreground">Mês não altera este histórico. Operação e Supervisor são respeitados. Cada técnico é contado uma vez por mês; a linha conecta os meses com dados.</p>
      </div>
      <div className="space-y-4 p-4 sm:p-6">
        {points.length === 0 ? <p role="status" aria-label="Sem histórico mensal" className="py-12 text-center text-sm text-muted-foreground">Nenhum histórico mensal disponível para as operações e supervisores selecionados.</p> : <>
          {(hasUnknown || hasConflict) && <p role="status" aria-label="Ressalvas do histórico mensal" className="rounded-lg border border-amber-700/30 bg-amber-100 p-3 text-sm text-amber-900 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-200">{hasUnknown && "Metas indeterminadas permanecem no denominador; consulte a cobertura por mês. "}{hasConflict && "Há marcações divergentes de meta; uma confirmação positiva prevalece por técnico e mês."}</p>}
          <MonthlyChart points={points} />
          <details className="rounded-lg border border-border">
            <summary className="cursor-pointer rounded-lg px-4 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring">Consultar dados da Performance Mensal</summary>
            <div role="region" aria-label="Dados mensais com rolagem horizontal" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Taxas de metas por competência, contagens e cobertura de marcações conhecidas</caption>
                <thead><tr className="border-y border-border text-muted-foreground">{["Competência", "Técnicos", "Metas batidas", "Indeterminadas", "Taxa", "Cobertura"].map((title) => <th key={title} scope="col" className="whitespace-nowrap px-4 py-3 font-medium">{title}</th>)}</tr></thead>
                <tbody>{points.map((point) => <tr key={point.month} className="border-b border-border last:border-0"><th scope="row" className="whitespace-nowrap px-4 py-3 font-medium">{point.label}</th>{[point.technicians, point.goalsMet, point.unknownGoals, percent(point.rate), percent(point.coverage)].map((value, index) => <td key={index} className="whitespace-nowrap px-4 py-3 tabular-nums">{value}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </details>
        </>}
      </div>
    </section>
  );
}
