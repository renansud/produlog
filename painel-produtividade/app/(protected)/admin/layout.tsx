import { requireRole } from "@/modules/auth/presentation/require-role";
import { PrivateShell } from "@/modules/auth/presentation/private-shell";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADMIN");
  return <PrivateShell role="ADMIN">{children}</PrivateShell>;
}
