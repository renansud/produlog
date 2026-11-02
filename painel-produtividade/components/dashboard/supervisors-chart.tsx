"use client";

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PerformanceChartFrame, PerformanceChartTooltip } from "./performance-chart-frame";

export type SupervisorChartPoint = { supervisorId: string; supervisor: string; technicianMonths: number; goalsMet: number; unknownGoals: number; rate: number; coverage: number };
const percent = (value: number) => `${value.toFixed(2).replace(".", ",")}%`;

export function SupervisorsChart({ points }: { points: SupervisorChartPoint[] }) {
  return (
    <PerformanceChartFrame label="Gráfico de supervisão com rolagem horizontal" minWidthRem={Math.max(18, points.length * 14)}>
      {(portal) => (
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 640, height: 320 }}>
          <BarChart data={points} accessibilityLayer margin={{ top: 36, right: 28, bottom: 12, left: 28 }} aria-label="Taxa de metas por supervisor. Use as setas para consultar as equipes." className="text-sm focus-visible:outline-2 focus-visible:outline-ring">
            <XAxis dataKey="supervisorId" tickFormatter={(id: string) => { const name = points.find((point) => point.supervisorId === id)?.supervisor ?? ""; return name.length > 22 ? `${name.slice(0, 20)}…` : name; }} interval={0} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: "0.875rem" }} height={48} />
            <YAxis hide domain={[0, 100]} />
            <Tooltip portal={portal} wrapperStyle={{ width: "100%" }} isAnimationActive={false} cursor={false} content={({ active, label }) => {
              const point = points.find((item) => item.supervisorId === label);
              return active && point ? <PerformanceChartTooltip title={point.supervisor} rate={point.rate} goalsMet={point.goalsMet} total={point.technicianMonths} coverage={point.coverage} unknownGoals={point.unknownGoals} unit="técnicos-mês" /> : null;
            }} />
            <Bar dataKey="rate" fill="#16a8e6" stroke="#000000" strokeWidth={1} maxBarSize={80} isAnimationActive={false}>
              <LabelList dataKey="rate" position="top" offset={12} fill="var(--foreground)" fontSize="0.875rem" formatter={(value) => typeof value === "number" ? percent(value) : "—"} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </PerformanceChartFrame>
  );
}
