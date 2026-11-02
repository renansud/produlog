"use client";

import { Bar, ComposedChart, LabelList, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PerformanceChartFrame, PerformanceChartTooltip } from "./performance-chart-frame";

export type MonthlyChartPoint = { month: string; label: string; rate: number; technicians: number; goalsMet: number; unknownGoals: number; coverage: number };
const percent = (value: number) => `${value.toFixed(2).replace(".", ",")}%`;

export function MonthlyChart({ points }: { points: MonthlyChartPoint[] }) {
  return (
    <PerformanceChartFrame label="Gráfico mensal com rolagem horizontal" minWidthRem={Math.max(16, points.length * 7)}>
      {(portal) => (
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 640, height: 320 }}>
          <ComposedChart data={points} accessibilityLayer margin={{ top: 36, right: 28, bottom: 12, left: 28 }} aria-label="Taxa de metas por mês. Use as setas para consultar os meses." className="text-sm focus-visible:outline-2 focus-visible:outline-ring">
            <XAxis dataKey="month" tickFormatter={(month: string) => `${month.slice(5)}/${month.slice(0, 4)}`} interval={0} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: "0.875rem" }} height={48} />
            <YAxis hide domain={[0, 100]} />
            <Tooltip portal={portal} wrapperStyle={{ width: "100%" }} isAnimationActive={false} cursor={false} content={({ active, label }) => {
              const point = points.find((item) => item.month === label);
              return active && point ? <PerformanceChartTooltip title={point.label} rate={point.rate} goalsMet={point.goalsMet} total={point.technicians} coverage={point.coverage} unknownGoals={point.unknownGoals} unit="técnicos" /> : null;
            }} />
            <Bar dataKey="rate" fill="#16a8e6" stroke="#000000" strokeWidth={1} maxBarSize={80} isAnimationActive={false}>
              <LabelList dataKey="rate" position="top" offset={12} fill="var(--foreground)" fontSize="0.875rem" formatter={(value) => typeof value === "number" ? percent(value) : "—"} />
            </Bar>
            <Line dataKey="rate" type="linear" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4, fill: "var(--card)", strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </PerformanceChartFrame>
  );
}
