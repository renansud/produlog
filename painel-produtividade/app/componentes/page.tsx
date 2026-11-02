import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ComponentDemo } from "@/components/demo/component-demo";

export default function ComponentsPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <DashboardShell view="components"><ComponentDemo /></DashboardShell>;
}
