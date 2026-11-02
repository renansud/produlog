import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DemoUsers } from "@/modules/users/presentation/demo-users";

export default function UsersDemoPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <DashboardShell view="users"><DemoUsers /></DashboardShell>;
}
