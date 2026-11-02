import { CircleGauge, Layers3, Minus, TrendingDown, TrendingUp, Users } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import type { DashboardSummary } from "../application/dashboard-summary-contract";
import { formatDecimalPtBr } from "./format-decimal";

const qualityMessages = {
  NAME_BASED_IDENTITY: "Parte da identificação usa nomes; homônimos precisam de revisão.",
  MIXED_IDENTIFICATION: "Há registros com identificação mista que precisam de revisão.",
  HOMONYM: "Há nomes iguais vinculados a identificadores distintos.",
  MULTIPLE_SCOPES: "Há técnicos em mais de uma operação ou supervisão no mesmo mês.",
  CONFLICTING_GOALS: "Há marcações de meta divergentes. A consolidação preservou os avisos para revisão.",
  UNKNOWN_GOAL: "Há metas indeterminadas. A taxa e a Evolução precisam ser interpretadas com essa ressalva.",
} as const;

export function SummaryIndicators({ summary }: { summary: DashboardSummary }) {
  const evolution = summary.evolution;
  const difference = evolution ? `${evolution.direction === "positive" ? "+" : ""}${formatDecimalPtBr(evolution.differencePercentagePoints.toFixed(2))}%` : "—";
  const comparison = evolution ? `${evolution.previousMonth.slice(5)}/${evolution.previousMonth.slice(0, 4)}: ${formatDecimalPtBr(evolution.previousPercent.toFixed(2))}% → ${evolution.currentMonth.slice(5)}/${evolution.currentMonth.slice(0, 4)}: ${formatDecimalPtBr(evolution.currentPercent.toFixed(2))}%` : "Sem meses suficientes para comparar";
  const codes = [...new Set([...summary.quality.warnings, ...summary.quality.evolutionWarnings].map((warning) => warning.code))];
  const hasUnknown = codes.includes("UNKNOWN_GOAL");
  const hasConflicts = codes.includes("CONFLICTING_GOALS");

  return (
    <div className="space-y-4">
      {summary.rowCount === 0 && <p role="status" aria-label="Sem registros no recorte" className="rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">Nenhum registro corresponde aos filtros atuais. A Evolução considera o histórico sem o filtro Mês.</p>}
      {(hasUnknown || hasConflicts) && <p role="status" aria-label="Ressalvas das metas" className="rounded-xl border border-amber-700/30 bg-amber-100 px-5 py-4 text-sm leading-6 text-amber-900 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-200">{hasUnknown && qualityMessages.UNKNOWN_GOAL}{hasUnknown && hasConflicts && " "}{hasConflicts && qualityMessages.CONFLICTING_GOALS}</p>}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Indicadores de produtividade">
        <KpiCard id="technicians" title="Técnicos" value={String(summary.technicians)} caption="Técnicos distintos no período" icon={Users} />
        <KpiCard id="evolution" title="Evolução" value={difference} caption={`Diferença em pontos percentuais. ${comparison}`} icon={evolution?.direction === "positive" ? TrendingUp : evolution?.direction === "negative" ? TrendingDown : Minus} tone={evolution?.direction ?? "neutral"} />
        <KpiCard id="average" title="Média de produção" value={formatDecimalPtBr(summary.averageProduction)} caption={summary.rowCount === 0 ? "Sem registros para calcular a média" : "Média por registro de produção"} icon={CircleGauge} />
        <KpiCard id="production" title="Produção total" value={formatDecimalPtBr(summary.totalProduction)} caption="Soma de todos os registros do período" icon={Layers3} />
      </section>
      {codes.length > 0 && <details className="rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground"><summary className="cursor-pointer font-medium text-foreground">Qualidade dos dados</summary><ul className="mt-3 list-disc space-y-2 pl-5 leading-6">{codes.map((code) => <li key={code}>{qualityMessages[code]}</li>)}</ul></details>}
    </div>
  );
}

export function SummaryUnavailable() {
  return <section role="alert" aria-labelledby="summary-unavailable-title" className="space-y-3 rounded-xl border border-border bg-card p-6"><h2 id="summary-unavailable-title" className="text-lg font-semibold">Indicadores indisponíveis</h2><p className="text-sm leading-6 text-muted-foreground">Não foi possível carregar os indicadores. Tente acessar a demonstração novamente.</p></section>;
}
