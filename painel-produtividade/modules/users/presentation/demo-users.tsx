"use client";
import { useState } from "react";
import { createUserSchema, type CreateUserResult, type UserItem } from "../domain/users";
import { UsersDirectory } from "./users-directory";

const examples: UserItem[] = Array.from({ length: 21 }, (_, index) => ({
  id: `40000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  email: `sintetico.${String(index + 1).padStart(2, "0")}@example.invalid`,
  role: index === 0 ? "ADMIN" : index === 3 ? null : "USER",
  status: index === 1 ? "INACTIVE" : index === 2 ? "PENDING" : index === 3 ? "NO_PROFILE" : "ACTIVE",
  createdAt: "2026-07-01T12:00:00Z",
}));
export function DemoUsers() {
  const [users, setUsers] = useState(examples);
  const [page, setPage] = useState(1);
  async function createUser(form: FormData): Promise<CreateUserResult> {
    const parsed = createUserSchema.safeParse(Object.fromEntries(["email", "role", "password", "passwordConfirmation"].map((key) => [key, form.get(key)])));
    if (!parsed.success) return { ok: false, code: "INVALID_INPUT", message: "Revise os campos indicados." };
    if (!parsed.data.email.toLowerCase().endsWith("@example.invalid")) return { ok: false, code: "INVALID_INPUT", message: "Na demonstração, use somente e-mails fictícios terminados em @example.invalid." };
    if (users.some((user) => user.email?.toLowerCase() === parsed.data.email.toLowerCase())) return { ok: false, code: "DUPLICATE", message: "Já existe uma conta fictícia com esse e-mail." };
    const user: UserItem = { id: crypto.randomUUID(), email: parsed.data.email, role: parsed.data.role, status: "ACTIVE", createdAt: new Date().toISOString() };
    setUsers((current) => [user, ...current]);
    setPage(1);
    return { ok: true };
  }
  return <UsersDirectory demo createUser={createUser} list={{ kind: "ready", users: users.slice((page - 1) * 20, page * 20), total: users.length, page, lastPage: Math.max(1, Math.ceil(users.length / 20)) }} onPageChange={setPage} />;
}
