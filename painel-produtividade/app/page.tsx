import Link from "next/link";
import { redirect } from "next/navigation";
import { ServlogBrand } from "@/components/servlog-brand";
import { DashboardActions } from "@/components/dashboard/dashboard-actions";
import { LoginForm } from "@/modules/auth/presentation/login-form";
import { getCurrentAccess } from "@/modules/auth/infrastructure/current-access";
import { dashboardPath } from "@/modules/auth/domain/auth-routing";

export const dynamic = "force-dynamic";
export default async function Login() {
  const identity = await getCurrentAccess();
  if (identity) redirect(dashboardPath(identity.role));
  return <main className="flex min-h-svh items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--color-primary)/8,transparent_60%)] px-4 py-10 sm:px-6"><div className="w-full max-w-md space-y-8"><div className="flex items-center justify-between gap-4"><ServlogBrand /><DashboardActions allowRefresh={false} /></div><section aria-labelledby="login-heading" className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8"><p className="text-xs font-semibold uppercase tracking-widest text-primary">Produtividade Servlog</p><h1 id="login-heading" className="mt-3 text-3xl font-semibold tracking-tight">Entre na sua conta</h1><p className="mb-7 mt-3 text-sm leading-6 text-muted-foreground">Acesse seu painel para acompanhar os resultados da equipe.</p><LoginForm /></section><footer className="space-y-3 text-center text-xs text-muted-foreground"><p>Servlog · Acesso restrito</p>{process.env.NODE_ENV === "development" && <Link href="/demo" className="inline-block rounded-md p-2 text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring">Explorar demonstração com dados fictícios</Link>}</footer></div></main>;
}
