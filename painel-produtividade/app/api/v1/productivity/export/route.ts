import { privateProductivityPageDependencies } from "@/modules/productivity/infrastructure/productivity-page-dependencies";
import { handleProductivityExportRequest } from "@/modules/productivity/presentation/productivity-export-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { return handleProductivityExportRequest(request, privateProductivityPageDependencies); }
