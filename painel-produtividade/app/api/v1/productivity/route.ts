import { privateProductivityPageDependencies } from "@/modules/productivity/infrastructure/productivity-page-dependencies";
import { handleProductivityPageRequest } from "@/modules/productivity/presentation/productivity-page-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleProductivityPageRequest(request, privateProductivityPageDependencies);
}
