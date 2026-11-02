import { createDemoProductivityPageDependencies } from "@/modules/productivity/infrastructure/productivity-page-dependencies";
import { demoRequestError } from "@/modules/productivity/infrastructure/demo-request";
import { handleProductivityPageRequest } from "@/modules/productivity/presentation/productivity-page-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = demoRequestError(request);
  if (denied) return denied;
  return handleProductivityPageRequest(request, createDemoProductivityPageDependencies(), true);
}
