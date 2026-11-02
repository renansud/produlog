"use server";
import { revalidatePath } from "next/cache";
import { AuthorizationError } from "@/modules/auth/application/require-permission";
import { createManagedUser } from "@/modules/users/application/manage-users";
import { usersDependencies } from "@/modules/users/infrastructure/supabase-users";
import type { CreateUserResult } from "@/modules/users/domain/users";

export async function createUserAction(form: FormData): Promise<CreateUserResult> {
  const keys = ["email", "role", "password", "passwordConfirmation"];
  const input = Object.fromEntries(keys.map((key) => [key, form.getAll(key).length === 1 ? form.get(key) : null]));
  let result: CreateUserResult;
  try { result = await createManagedUser(usersDependencies, input); }
  catch (error) {
    return { ok: false, code: error instanceof AuthorizationError ? "FORBIDDEN" : "FAILED", message: error instanceof AuthorizationError ? "Sua sessão não permite criar usuários. Entre novamente como administrador." : "Não foi possível confirmar o cadastro. Consulte a lista antes de tentar novamente." };
  }
  if (result.ok) revalidatePath("/admin/usuarios");
  return result;
}
