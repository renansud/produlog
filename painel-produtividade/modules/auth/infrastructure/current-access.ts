import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { identityFromAuthUser } from "../domain/auth-routing";

// cache do React deduplica somente na requisição RSC, sem estado global de usuário.
export const getCurrentAccess = cache(async () => {
  try {
    const client = await createClient();
    const claims = await client.auth.getClaims();
    if (claims.error || !claims.data?.claims.sub) return null;
    const result = await client.auth.getUser();
    if (result.error || result.data.user?.id !== claims.data.claims.sub) return null;
    return identityFromAuthUser(result.data.user);
  } catch { return null; }
});
