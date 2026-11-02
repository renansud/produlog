import { ServlogBrand } from "@/components/servlog-brand";
import { DashboardActions } from "@/components/dashboard/dashboard-actions";
import { logoutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import type { Role } from "../domain/access-policy";
import { PrivateNavigation } from "./private-navigation";

export function PrivateShell({ role, children }: { role: Role; children: React.ReactNode }) {
  return <div className="mx-auto max-w-7xl px-4 sm:px-6"><a href="#conteudo" className="sr-only rounded-lg bg-primary p-3 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50">Pular para o conteúdo</a><header className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-6"><ServlogBrand /><div className="flex flex-wrap items-center gap-3"><span className="text-sm text-muted-foreground">{role === "ADMIN" ? "Administrador" : "Usuário"}</span><DashboardActions allowRefresh={false} /><form action={logoutAction}><Button type="submit" variant="outline">Sair</Button></form></div></header><PrivateNavigation role={role} /><main id="conteudo" tabIndex={-1} className="py-8 outline-none">{children}</main></div>;
}
