import { redirect } from "next/navigation";
import { requireRole } from "@/modules/auth/presentation/require-role";
export default async function Admin() { await requireRole("ADMIN"); redirect("/admin/dashboard"); }
