import Link from "next/link";
import { ServlogBrand } from "@/components/servlog-brand";
import { DashboardActions } from "./dashboard-actions";

export function DashboardShell({ children, view = "dashboard" }: { children: React.ReactNode; view?: "dashboard" | "components" | "data-entry" | "users" }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <a href="#conteudo" className="sr-only rounded-lg bg-primary p-3 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50">Pular para o conteúdo</a>
      <header className="flex flex-wrap items-center justify-between gap-6 border-b border-border py-6 sm:py-8">
        <div className="flex flex-wrap items-center gap-5">
          <ServlogBrand />
          <div className="space-y-2">
            {(view === "dashboard" || view === "components") && <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{view === "dashboard" ? "Dashboard de Produtividade" : "Componentes de interface"}</h1>}
            <p className="text-sm text-muted-foreground">Acompanhamento operacional</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-amber-700/30 bg-amber-100 px-3 py-2 text-xs font-medium text-amber-900 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-200">Ambiente local · Sem login real</span>
          <DashboardActions allowRefresh={view === "dashboard"} />
        </div>
      </header>
      <nav aria-label="Navegação da demonstração" className="flex flex-wrap gap-2 border-b border-border py-3 text-sm">
        {[{ href: "/demo", label: "Dashboard", key: "dashboard" }, { href: "/componentes", label: "Componentes", key: "components" }, { href: "/demo/dados", label: "Inserção de dados", key: "data-entry" }, { href: "/demo/usuarios", label: "Usuários", key: "users" }].map((item) => (
          <Link key={item.key} href={item.href} aria-current={view === item.key ? "page" : undefined} className="rounded-lg px-4 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary">{item.label}</Link>
        ))}
      </nav>
      <main id="conteudo" tabIndex={-1} className="space-y-6 py-6 outline-none sm:py-8">{children}</main>
      <footer className="border-t border-border py-6 text-xs leading-6 text-muted-foreground">Servlog · Demonstração com dados fictícios · Nenhuma base empresarial conectada</footer>
    </div>
  );
}
