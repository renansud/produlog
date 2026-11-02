"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signIn } from "@/modules/auth/application/sign-in";

export type LoginState = { error: string };
export async function loginAction(_previous: LoginState, form: FormData): Promise<LoginState> {
  const result = await signIn({ email: form.get("email"), password: form.get("password") }, {
    signIn: async (email, password) => { const client = await createClient(); return !(await client.auth.signInWithPassword({ email, password })).error; },
    readVerifiedUser: async () => { const client = await createClient(); const result = await client.auth.getUser(); return result.error ? null : result.data.user; },
    clearSession: async () => { const client = await createClient(); await client.auth.signOut({ scope: "local" }); },
  });
  if (result.destination) redirect(result.destination);
  return { error: result.error ?? "Não foi possível entrar." };
}
export async function logoutAction() {
  const client = await createClient();
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) redirect("/auth/logout-error");
  redirect("/");
}
