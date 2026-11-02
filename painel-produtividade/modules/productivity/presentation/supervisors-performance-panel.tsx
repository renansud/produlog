import { SupervisorsChart } from "@/components/dashboard/supervisors-chart";
import type { DashboardSupervisors } from "../application/dashboard-supervisors-contract";
import { formatDecimalPtBr, formatReferenceMonth } from "./format-decimal";

const percent = (value: number) => `${formatDecimalPtBr(value.toFixed(2))}%`;

export function SupervisorsPerformancePanel({ supervisors, months }: { supervisors: DashboardSupervisors; months: string[] }) {
  const points = supervisors.series;
  const hasUnknown = points.some((point) => point.unknownGoals > 0);
  const hasConflict = supervisors.quality.warnings.some((warning) => warning.code === "CONFLICTING_GOALS");
  return (
    <section aria-labelledby="supervisors-heading" className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="space-y-2 border-b border-border px-5 py-5 sm:px-6">
        <h2 id="supervisors-heading" className="font-semibold">Performance Mensal Supervisão</h2>
        <p className="text-sm text-muted-foreground">{months.length ? `Competências selecionadas: ${months.map(formatReferenceMonth).join(", ")}` : "Todas as competências do escopo autorizado"}</p>
        <p className="text-xs leading-5 text-muted-foreground">Aplica Mês, Operação e Supervisor. Cada combinação de supervisor, técnico e mês é contada uma vez. Taxas em ordem decrescente, com desempate alfabético.</p>
      </div>
      <div className="space-y-4 p-4 sm:p-6">
        {points.length === 0 ? <p role="status" aria-label="Sem resultados de supervisão" className="py-12 text-center text-sm text-muted-foreground">Nenhum resultado de supervisão disponível para os filtros selecionados.</p> : <>
          {(hasUnknown || hasConflict) && <p role="status" aria-label="Ressalvas da supervisão" className="rounded-lg border border-amber-700/30 bg-amber-100 p-3 text-sm text-amber-900 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-200">{hasUnknown && "Metas indeterminadas permanecem no denominador; consulte a cobertura por supervisor. "}{hasConflict && "Há marcações divergentes de meta; uma confirmação positiva prevalece na combinação de supervisor, técnico e mês."}</p>}
          <SupervisorsChart points={points} />
          <details className="rounded-lg border border-border">
            <summary className="cursor-pointer rounded-lg px-4 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring">Consultar dados da Performance Mensal Supervisão</summary>
            <div role="region" aria-label="Dados de supervisão com rolagem horizontal" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Taxas por supervisor, contagens de técnicos-mês e cobertura de marcações conhecidas</caption>
                <thead><tr className="border-y border-border text-muted-foreground">{["Supervisor", "Técnicos-mês", "Metas batidas", "Indeterminadas", "Taxa", "Cobertura"].map((title) => <th key={title} scope="col" className="whitespace-nowrap px-4 py-3 font-medium">{title}</th>)}</tr></thead>
                <tbody>{points.map((point) => <tr key={point.supervisorId} className="border-b border-border last:border-0"><th scope="row" className="whitespace-nowrap px-4 py-3 font-medium">{point.supervisor}</th>{[point.technicianMonths, point.goalsMet, point.unknownGoals, percent(point.rate), percent(point.coverage)].map((value, index) => <td key={index} className="whitespace-nowrap px-4 py-3 tabular-nums">{value}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </details>
        </>}
      </div>
    </section>
  );
}
