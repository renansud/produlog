"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { dashboardPath } from "../domain/auth-routing";
import type { Role } from "../domain/access-policy";

export function PrivateNavigation({ role }: { role: Role }) {
  const pathname = usePathname();
  const links = [{ href: dashboardPath(role), label: "Dashboard" }, ...(role === "ADMIN" ? [{ href: "/admin/dados", label: "Inserção de dados" }, { href: "/admin/usuarios", label: "Usuários" }] : [])];
  return <nav aria-label="Navegação principal" className="flex flex-wrap gap-2 border-b border-border py-4">{links.map((link) => <Button key={link.href} asChild variant={pathname === link.href ? "secondary" : "ghost"} className="h-auto min-h-11 whitespace-normal px-3 py-2"><Link href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link></Button>)}</nav>;
}
