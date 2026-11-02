"use client";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createUserSchema, type CreateUserResult, type NewUserInput } from "../domain/users";

export type CreateUserAction = (form: FormData) => Promise<CreateUserResult>;
const actionClass = "h-auto min-h-11 min-w-0 max-w-full whitespace-normal px-4 py-2";
export function UsersActions({ createUser, available, demo = false }: { createUser: CreateUserAction; available: boolean; demo?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<CreateUserResult | null>(null);
  const [success, setSuccess] = useState(false);
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [pending, startTransition] = useTransition();
  const [refreshing, refresh] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  function changeOpen(value: boolean) {
    if (pending) return;
    formRef.current?.reset();
    setResult(null);
    setVisiblePassword(false);
    setOpen(value);
  }
  const focusError = () => requestAnimationFrame(() => errorRef.current?.focus());
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!available || pending) return;
    const form = new FormData(event.currentTarget);
    const input = Object.fromEntries(["email", "role", "password", "passwordConfirmation"].map((key) => [key, form.get(key)]));
    const parsed = createUserSchema.safeParse(input);
    if (!parsed.success) {
      const fields: Partial<Record<keyof NewUserInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof NewUserInput;
        if (key) fields[key] = issue.message;
      }
      setResult({ ok: false, code: "INVALID_INPUT", message: "Revise os campos indicados.", fields });
      focusError();
      return;
    }
    setResult(null);
    setSuccess(false);
    startTransition(async () => {
      let response: CreateUserResult;
      try { response = await createUser(form); }
      catch { response = { ok: false, code: "FAILED", message: "Não foi possível confirmar o cadastro. Consulte a lista antes de tentar novamente." }; }
      // Never keep submitted credentials in component state or a result payload.
      for (const name of ["password", "passwordConfirmation"]) {
        const control = formRef.current?.elements.namedItem(name);
        if (control instanceof HTMLInputElement) control.value = "";
        form.delete(name);
      }
      if (response.ok) {
        formRef.current?.reset();
        setVisiblePassword(false);
        setOpen(false);
        setSuccess(true);
        if (!demo) router.refresh();
      } else { setResult(response); focusError(); }
    });
  }
  const fieldError = (name: keyof NewUserInput) => result && !result.ok ? result.fields?.[name] : undefined;
  return <div className="min-w-0 space-y-3">
    <div className="flex flex-wrap gap-3">
      {!demo && <Button variant="outline" className={actionClass} disabled={refreshing || pending} aria-busy={refreshing} onClick={() => refresh(() => router.refresh())}>{refreshing ? "Atualizando…" : "Atualizar lista"}</Button>}
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogTrigger asChild><Button className={actionClass}>Novo usuário</Button></DialogTrigger>
        <DialogContent className="max-h-[calc(100dvh-2rem)] min-w-0 overflow-y-auto [overflow-wrap:anywhere] [&>*]:min-w-0 [&>[data-slot=dialog-close]]:min-h-11 [&>[data-slot=dialog-close]]:min-w-11 sm:max-w-lg" showCloseButton={!pending} onEscapeKeyDown={(event) => { if (pending) event.preventDefault(); }} onInteractOutside={(event) => { if (pending) event.preventDefault(); }}>
          <DialogHeader><DialogTitle className="pr-12 leading-normal">Criar novo usuário</DialogTitle><DialogDescription>O administrador define a senha inicial e o perfil de acesso. Nenhum convite por e-mail será enviado.</DialogDescription></DialogHeader>
          {demo && <Alert role="note"><AlertTitle>Somente demonstração</AlertTitle><AlertDescription>Use e-mails fictícios terminados em @example.invalid e uma senha fictícia. Nenhuma conta real será criada.</AlertDescription></Alert>}
          {!available && <Alert role="note"><AlertTitle>Cadastro indisponível</AlertTitle><AlertDescription>A configuração administrativa precisa ser concluída para cadastrar usuários.</AlertDescription></Alert>}
          <form ref={formRef} onSubmit={submit} noValidate aria-busy={pending} className="min-w-0 space-y-4" onChange={() => setResult(null)}>
            <fieldset disabled={pending} className="min-w-0 space-y-4">
              <div className="space-y-2"><Label htmlFor="new-user-email">E-mail</Label><Input id="new-user-email" name="email" type="email" required maxLength={254} autoComplete="off" className="h-auto min-h-11 py-2 text-base" aria-invalid={!!fieldError("email")} aria-describedby="new-user-email-error" /><p id="new-user-email-error" className="text-sm text-destructive">{fieldError("email")}</p></div>
              <div className="space-y-2"><Label htmlFor="new-user-role">Perfil de acesso</Label><NativeSelect id="new-user-role" name="role" defaultValue="USER" className="w-full [&_select]:h-auto [&_select]:min-h-11 [&_select]:text-base" aria-describedby="new-user-role-hint"><NativeSelectOption value="USER">Usuário</NativeSelectOption><NativeSelectOption value="ADMIN">Admin</NativeSelectOption></NativeSelect><p id="new-user-role-hint" className="text-sm text-muted-foreground">Usuário tem acesso de leitura. Admin gerencia dados e usuários. A conta começa sem operações atribuídas; o acesso aos dados depende dessa atribuição.</p></div>
              {(["password", "passwordConfirmation"] as const).map((name) => <div key={name} className="space-y-2"><Label htmlFor={`new-user-${name}`}>{name === "password" ? "Senha inicial" : "Confirmar senha inicial"}</Label><Input id={`new-user-${name}`} name={name} type={visiblePassword ? "text" : "password"} required minLength={name === "password" ? 12 : undefined} maxLength={128} autoComplete="new-password" className="h-auto min-h-11 py-2 text-base" aria-invalid={!!fieldError(name)} aria-describedby={`new-user-${name}-hint`} /><p id={`new-user-${name}-hint`} className={`text-sm ${fieldError(name) ? "text-destructive" : "text-muted-foreground"}`}>{fieldError(name) ?? (name === "password" ? "Use de 12 a 72 caracteres; acentos e emojis podem reduzir o limite máximo. Entregue a senha por um canal seguro." : "")}</p></div>)}
              <Button type="button" variant="outline" className={actionClass} aria-pressed={visiblePassword} onClick={() => setVisiblePassword((value) => !value)}>{visiblePassword ? "Ocultar senhas" : "Mostrar senhas"}</Button>
            </fieldset>
            {result && !result.ok && <Alert ref={errorRef} tabIndex={-1} variant="destructive" className="outline-none focus-visible:ring-2 focus-visible:ring-ring"><AlertTitle>Não foi possível concluir</AlertTitle><AlertDescription>{result.message}</AlertDescription></Alert>}
            <div className="flex flex-wrap gap-3"><Button type="submit" disabled={!available || pending} className={actionClass}>{pending ? "Criando…" : demo ? "Criar usuário fictício" : "Criar usuário"}</Button><Button type="button" variant="outline" disabled={pending} onClick={() => changeOpen(false)} className={actionClass}>Cancelar</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    {success && <Alert role="status"><AlertTitle>{demo ? "Usuário fictício adicionado" : "Usuário criado"}</AlertTitle><AlertDescription>{demo ? "A alteração existe apenas nesta tela e será descartada ao recarregar. Nenhuma conta real foi criada." : "A conta foi cadastrada. Entregue a senha inicial por um canal seguro; o acesso aos dados depende da atribuição de operações."}</AlertDescription></Alert>}
  </div>;
}
