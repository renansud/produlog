import type { LucideIcon } from "lucide-react";

export function KpiCard({ id, title, value, caption, icon: Icon, tone = "default" }: {
  id: string; title: string; value: string; caption: string; icon: LucideIcon; tone?: "default" | "positive" | "negative" | "neutral";
}) {
  const valueColor = tone === "positive" ? "text-emerald-700 dark:text-emerald-400" : tone === "negative" ? "text-rose-700 dark:text-rose-400" : "text-foreground";
  return (
    <article aria-labelledby={`${id}-title`} className="min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 id={`${id}-title`} className="text-sm font-medium text-muted-foreground">{title}</h3>
        <span className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="size-4" aria-hidden="true" /></span>
      </div>
      <p className={`mt-5 break-words text-3xl font-semibold tracking-tight tabular-nums ${valueColor}`}>{value}</p>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">{caption}</p>
    </article>
  );
}
