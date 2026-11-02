import { redirect } from "next/navigation";
import { requireRole } from "@/modules/auth/presentation/require-role";
export default async function User() { await requireRole("USER"); redirect("/user/dashboard"); }
