import { privateDashboardDependencies } from "@/modules/productivity/infrastructure/dashboard-dependencies";
import { handleDashboardRequest } from "@/modules/productivity/presentation/dashboard-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ kind: string }> }) {
  return handleDashboardRequest(request, (await context.params).kind, privateDashboardDependencies);
}
