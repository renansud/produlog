"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/auth/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { error: "" });
  return <form action={action} aria-busy={pending} className="space-y-5">
    <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">E-mail</label><Input className="h-11" id="email" name="email" type="email" autoComplete="username" required maxLength={254} disabled={pending} aria-describedby={state.error ? "login-error" : undefined} /></div>
    <div className="space-y-2"><label htmlFor="password" className="text-sm font-medium">Senha</label><Input className="h-11" id="password" name="password" type="password" autoComplete="current-password" required maxLength={1024} disabled={pending} aria-describedby={state.error ? "login-error" : undefined} /></div>
    {state.error && <p id="login-error" role="alert" className="text-sm text-destructive">{state.error}</p>}
    <Button type="submit" className="h-11 w-full" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</Button>
    <p role="status" className="sr-only">{pending ? "Validando acesso…" : ""}</p>
    <p className="text-sm leading-6 text-muted-foreground">O acesso é exclusivo para contas autorizadas. Para solicitar acesso ou recuperar sua senha, entre em contato com o administrador.</p>
  </form>;
}
