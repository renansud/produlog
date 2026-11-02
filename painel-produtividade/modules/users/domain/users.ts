import { z } from "zod";
import { roleSchema } from "@/modules/auth/domain/access-policy";

export const createUserSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido.").max(254, "Use até 254 caracteres."),
  role: roleSchema,
  password: z.string().min(12, "Use uma senha com pelo menos 12 caracteres.").max(72, "Use até 72 caracteres.").refine((value) => Array.from(value).length >= 12, "Use uma senha com pelo menos 12 caracteres.").refine((value) => new TextEncoder().encode(value).byteLength <= 72, "A senha ultrapassa o limite permitido. Reduza o tamanho; acentos e emojis podem ocupar mais espaço."),
  passwordConfirmation: z.string().max(72, "Use até 72 caracteres."),
}).strict().refine((value) => value.password === value.passwordConfirmation, { path: ["passwordConfirmation"], message: "As senhas precisam ser iguais." });
export type NewUserInput = z.infer<typeof createUserSchema>;
export const usersPageSchema = z.object({ page: z.union([z.number(), z.string().regex(/^\d{1,5}$/).transform(Number)]).pipe(z.number().int().min(1).max(10000)).default(1) }).strict();
const profileSchema = z.object({ role: roleSchema, active: z.boolean(), operation_ids: z.array(z.uuid()) });
const authUserSchema = z.object({
  id: z.uuid(), email: z.string().email().max(254).nullish(), created_at: z.iso.datetime({ offset: true }),
  email_confirmed_at: z.string().nullish(), banned_until: z.string().nullish(), app_metadata: z.unknown(),
});
export type UserItem = {
  id: string; email: string | null; role: z.infer<typeof roleSchema> | null;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "NO_PROFILE"; createdAt: string;
};
/** Deliberately strips provider metadata, identities, tokens and all other personal fields. */
export function projectAuthUser(input: unknown): UserItem {
  const user = authUserSchema.parse(input);
  const profile = profileSchema.safeParse(user.app_metadata);
  const banned = !!user.banned_until && Date.parse(user.banned_until) > Date.now();
  return {
    id: user.id, email: user.email ?? null, createdAt: user.created_at,
    role: profile.success ? profile.data.role : null,
    status: !profile.success ? "NO_PROFILE" : !profile.data.active || banned ? "INACTIVE" : !user.email_confirmed_at ? "PENDING" : "ACTIVE",
  };
}
export type UserList = { kind: "ready"; users: UserItem[]; page: number; total: number; lastPage: number } | { kind: "unavailable" };
export type CreateUserResult = { ok: true } | { ok: false; code: "INVALID_INPUT" | "UNAVAILABLE" | "DUPLICATE" | "FORBIDDEN" | "FAILED"; message: string; fields?: Partial<Record<keyof NewUserInput, string>> };
export const userRoleLabel = (role: UserItem["role"]) => role === "ADMIN" ? "Administrador" : role === "USER" ? "Usuário" : "Sem perfil";
export const userStatusLabel = (status: UserItem["status"]) => ({ ACTIVE: "Ativo", INACTIVE: "Inativo", PENDING: "E-mail pendente", NO_PROFILE: "Sem perfil de acesso" })[status];
