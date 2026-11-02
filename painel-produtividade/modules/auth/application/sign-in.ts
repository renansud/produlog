import "server-only";
import { loginSchema, dashboardPath, identityFromAuthUser } from "../domain/auth-routing";

type Dependencies = {
  signIn: (email: string, password: string) => Promise<boolean>;
  readVerifiedUser: () => Promise<unknown>;
  clearSession: () => Promise<void>;
};
export async function signIn(input: unknown, dependencies: Dependencies): Promise<{ error: string; destination?: never } | { destination: string; error?: never }> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: "Informe um e-mail válido e sua senha." };
  try {
    if (!await dependencies.signIn(parsed.data.email, parsed.data.password)) return { error: "Não foi possível entrar. Confira suas credenciais e tente novamente." };
    const identity = identityFromAuthUser(await dependencies.readVerifiedUser());
    if (!identity) {
      await dependencies.clearSession();
      return { error: "Sua conta não possui um perfil ativo. Entre em contato com o administrador." };
    }
    return { destination: dashboardPath(identity.role) };
  } catch { return { error: "Não foi possível entrar agora. Tente novamente mais tarde." }; }
}
