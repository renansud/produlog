import { requireRole } from "./require-role";
import type { Role } from "../domain/access-policy";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export async function RoleDashboard({ role }: { role: Role }) {
  await requireRole(role);
  return <div className="space-y-6"><div><p className="text-sm text-primary">{role === "ADMIN" ? "Administração" : "Visão geral"}</p><h1 className="mt-2 text-3xl font-semibold">{role === "ADMIN" ? "Dashboard do administrador" : "Meu dashboard"}</h1><p className="mt-3 text-muted-foreground">{role === "ADMIN" ? "Acompanhe os dados e gerencie os acessos da equipe." : "Consulte os resultados disponíveis para você."}</p></div>
    <section className="rounded-2xl border border-border bg-card p-6" aria-labelledby="data-heading"><h2 id="data-heading" className="font-semibold">Produtividade</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Os indicadores aparecerão aqui assim que os dados forem disponibilizados. Nenhum registro de produtividade está disponível neste painel.</p></section>
    {role === "ADMIN" && <section aria-label="Administração" className="grid gap-4 sm:grid-cols-2"><Card><CardHeader><CardTitle><h2>Gerenciamento de usuários</h2></CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Consulte as contas cadastradas e crie novos acessos.</p><Button asChild className="h-auto min-h-11 whitespace-normal py-2"><Link href="/admin/usuarios">Gerenciar usuários</Link></Button></CardContent></Card><Card><CardHeader><CardTitle><h2>Inserção de dados</h2></CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Confira registros por formulário ou planilha antes do envio.</p><Button asChild className="h-auto min-h-11 whitespace-normal py-2"><Link href="/admin/dados">Abrir inserção de dados</Link></Button></CardContent></Card></section>}
  </div>;
}
