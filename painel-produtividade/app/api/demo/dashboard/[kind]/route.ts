import { handleDemoDashboard } from "@/modules/productivity/infrastructure/demo-dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ kind: string }> }) {
  return handleDemoDashboard(request, (await context.params).kind);
}
