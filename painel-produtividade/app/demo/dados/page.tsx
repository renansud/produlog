import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DataEntry } from "@/modules/imports/presentation/data-entry";

export default function DataEntryDemoPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <DashboardShell view="data-entry"><DataEntry demo /></DashboardShell>;
}
