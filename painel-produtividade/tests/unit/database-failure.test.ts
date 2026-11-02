import { expect, it } from "vitest";
import { describeDatabaseFailure } from "@/lib/database/failure";
it("diagnóstico não ecoa erro de provedor ou credencial", () => {
  const raw = "synthetic-private-value";
  expect(describeDatabaseFailure({ code: "28P01", message: raw })).toContain("Credenciais PostgreSQL");
  expect(describeDatabaseFailure({ code: "SELF_SIGNED_CERT_IN_CHAIN", message: raw })).toContain("validação não foi desabilitada");
  expect(describeDatabaseFailure({ code: raw, message: raw })).not.toContain(raw);
  expect(describeDatabaseFailure(new Error(raw))).not.toContain(raw);
});
