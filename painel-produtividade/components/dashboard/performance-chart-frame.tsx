"use client";

import { useState, type ReactNode } from "react";

/** Mantém o tooltip fora da rolagem SVG, inclusive ao navegar por referências fora da tela. */
export function PerformanceChartFrame({ label, minWidthRem, children }: {
  label: string; minWidthRem: number; children: (portal: HTMLElement | undefined) => ReactNode;
}) {
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);
  return (
    <>
      <div role="region" aria-label={label} tabIndex={0} className="overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
        <div className="h-80" style={{ minWidth: `${minWidthRem}rem` }}>{children(portal ?? undefined)}</div>
      </div>
      <div ref={setPortal} aria-live="polite" aria-atomic="true" className="mt-3 min-h-32" />
    </>
  );
}

export function PerformanceChartTooltip({ title, rate, goalsMet, total, coverage, unknownGoals, unit }: {
  title: string; rate: number; goalsMet: number; total: number; coverage: number; unknownGoals: number; unit: "técnicos" | "técnicos-mês";
}) {
  const percent = (value: number) => `${value.toFixed(2).replace(".", ",")}%`;
  return (
    <div role="tooltip" className="w-full max-w-md rounded-lg border border-border bg-popover p-3 text-sm text-popover-foreground shadow-sm [overflow-wrap:anywhere]">
      <p className="font-semibold">{title}</p>
      <p>{percent(rate)} · {goalsMet} de {total} {unit}</p>
      <p>Cobertura: {percent(coverage)}</p>
      <p>Metas indeterminadas: {unknownGoals}</p>
    </div>
  );
}
