import { requireRole } from "@/modules/auth/presentation/require-role";
import { PrivateShell } from "@/modules/auth/presentation/private-shell";
export default async function UserLayout({ children }: { children: React.ReactNode }) {
  await requireRole("USER");
  return <PrivateShell role="USER">{children}</PrivateShell>;
}
