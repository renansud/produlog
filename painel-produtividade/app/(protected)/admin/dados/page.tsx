import { requireRole } from "@/modules/auth/presentation/require-role";
import { DataEntry } from "@/modules/imports/presentation/data-entry";

export default async function DataEntryPage() {
  await requireRole("ADMIN");
  return <DataEntry />;
}
