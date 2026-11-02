import Link from "next/link";
import { logoutAction } from "../actions";
import { Button } from "@/components/ui/button";
export default function LogoutError() { return <main className="mx-auto max-w-lg space-y-5 px-6 py-16"><h1 className="text-2xl font-semibold">Não foi possível encerrar sua sessão</h1><p>Tente novamente antes de sair deste dispositivo.</p><form action={logoutAction}><Button type="submit">Tentar sair novamente</Button></form><Link href="/">Voltar ao início</Link></main>; }
