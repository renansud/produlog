import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { userRoleLabel, userStatusLabel, type UserList } from "../domain/users";
import { UsersActions, type CreateUserAction } from "./users-actions";

export function UsersDirectory({ list, createUser, demo = false, onPageChange }: { list: UserList; createUser: CreateUserAction; demo?: boolean; onPageChange?: (page: number) => void }) {
  const buttonClass = "h-auto min-h-11 whitespace-normal px-4 py-2";
  return <section className="min-w-0 space-y-6" aria-labelledby="users-title">
    <div className="space-y-2"><p className="text-sm text-primary">Administração · Acessos</p><h1 id="users-title" className="text-2xl font-semibold sm:text-3xl">Usuários</h1><p className="text-muted-foreground">Consulte as contas cadastradas e crie novos acessos para a equipe.</p></div>
    {demo && <Alert role="note"><AlertTitle>Demonstração com contas fictícias</AlertTitle><AlertDescription>Os dados desta tela são exemplos. Cadastros feitos aqui ficam somente em memória, sem criar usuários no Supabase.</AlertDescription></Alert>}
    <UsersActions createUser={createUser} available={list.kind === "ready"} demo={demo} />
    {list.kind === "unavailable" ? <Alert><AlertTitle>Listagem de usuários indisponível</AlertTitle><AlertDescription>Não foi possível consultar as contas cadastradas. Verifique a configuração administrativa e tente atualizar a lista.</AlertDescription></Alert> :
      <Card className="min-w-0"><CardHeader><CardTitle><h2>Usuários cadastrados</h2></CardTitle><CardDescription>{list.total} conta(s) cadastrada(s). Exibindo {list.users.length} nesta página.</CardDescription></CardHeader><CardContent className="min-w-0 space-y-4">
        {list.users.length ? <Table containerProps={{ role: "region", "aria-label": "Lista de usuários, role horizontalmente para ver todas as colunas", tabIndex: 0, className: "rounded-md border focus-visible:outline-2 focus-visible:outline-ring" }}><TableHeader><TableRow>{["E-mail", "Perfil", "Situação", "Cadastrado em"].map((label) => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader><TableBody>{list.users.map((user) => <TableRow key={user.id}><TableCell className="max-w-80 break-all whitespace-normal">{user.email ?? "Sem e-mail"}</TableCell><TableCell>{userRoleLabel(user.role)}</TableCell><TableCell>{userStatusLabel(user.status)}</TableCell><TableCell>{new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short" }).format(new Date(user.createdAt))}</TableCell></TableRow>)}</TableBody></Table> : <p className="py-4 text-muted-foreground">{list.total ? "Nenhum usuário nesta página. Volte à página anterior." : "Nenhum usuário cadastrado."}</p>}
        <nav aria-label="Paginação de usuários" className="flex flex-wrap items-center gap-3">
          {list.page > 1 ? onPageChange ? <Button variant="outline" className={buttonClass} onClick={() => onPageChange(list.page - 1)}>Anterior</Button> : <Button variant="outline" asChild className={buttonClass}><Link href={`/admin/usuarios?page=${list.page - 1}`}>Anterior</Link></Button> : <Button variant="outline" className={buttonClass} disabled>Anterior</Button>}
          <p className="text-sm text-muted-foreground">Página {list.page} de {list.lastPage}</p>
          {list.page < list.lastPage ? onPageChange ? <Button variant="outline" className={buttonClass} onClick={() => onPageChange(list.page + 1)}>Próxima</Button> : <Button variant="outline" asChild className={buttonClass}><Link href={`/admin/usuarios?page=${list.page + 1}`}>Próxima</Link></Button> : <Button variant="outline" className={buttonClass} disabled>Próxima</Button>}
        </nav>
      </CardContent></Card>}
  </section>;
}
