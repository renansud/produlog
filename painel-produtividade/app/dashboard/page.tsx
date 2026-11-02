import { redirect } from "next/navigation";
import { getCurrentAccess } from "@/modules/auth/infrastructure/current-access";
import { dashboardPath } from "@/modules/auth/domain/auth-routing";
export default async function Dashboard() { const identity = await getCurrentAccess(); redirect(identity ? dashboardPath(identity.role) : "/"); }
