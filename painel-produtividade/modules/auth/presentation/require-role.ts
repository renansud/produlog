import "server-only";
import { redirect } from "next/navigation";
import { getCurrentAccess } from "../infrastructure/current-access";
import { dashboardPath } from "../domain/auth-routing";
import type { Role } from "../domain/access-policy";

export async function requireRole(role: Role) {
  const identity = await getCurrentAccess();
  if (!identity) redirect("/");
  if (identity.role !== role) redirect(dashboardPath(identity.role));
  return identity;
}
