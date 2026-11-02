import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Renova sessão; layouts, páginas, ações e casos de uso continuam responsáveis por autorizar.
export const config = { matcher: ["/", "/auth/:path*", "/admin/:path*", "/user/:path*", "/dashboard"] };
