import { createDemoProductivityPageDependencies } from "@/modules/productivity/infrastructure/productivity-page-dependencies";
import { demoRequestError } from "@/modules/productivity/infrastructure/demo-request";
import { handleProductivityExportRequest } from "@/modules/productivity/presentation/productivity-export-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const denied = demoRequestError(request);
  if (denied) return denied;
  return handleProductivityExportRequest(request, createDemoProductivityPageDependencies(), true);
}
