import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/modules/auth/presentation/require-role";
import { listManagedUsers } from "@/modules/users/application/manage-users";
import { usersDependencies } from "@/modules/users/infrastructure/supabase-users";
import { usersPageSchema } from "@/modules/users/domain/users";
import { UsersDirectory } from "@/modules/users/presentation/users-directory";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { createUserAction } from "./actions";

export const dynamic = "force-dynamic";
export default async function UsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireRole("ADMIN");
  const params = await searchParams;
  const input = usersPageSchema.safeParse({ page: params.page ?? 1 });
  if (!input.success) return <Alert><AlertTitle>Página inválida</AlertTitle><AlertDescription>Use a navegação para consultar as contas.</AlertDescription><Button asChild variant="link" className="h-auto min-h-11 whitespace-normal"><Link href="/admin/usuarios">Voltar à lista de usuários</Link></Button></Alert>;
  const list = await listManagedUsers(usersDependencies, input.data);
  if (list.kind === "ready" && list.page > list.lastPage) redirect(`/admin/usuarios?page=${list.lastPage}`);
  return <UsersDirectory list={list} createUser={createUserAction} />;
}
