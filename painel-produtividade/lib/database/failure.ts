import { DatabaseConfigurationError } from "./env.ts";
/** Public diagnostics are an allowlist, never the provider's message/stack/URL. */
export function describeDatabaseFailure(error: unknown): string {
  if (error instanceof DatabaseConfigurationError) return error.message;
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
  const messages: Record<string, string> = {
    "28P01": "Credenciais PostgreSQL não foram aceitas. Confira usuário e senha do banco.",
    ENOTFOUND: "Host PostgreSQL não encontrado. Confira a URI copiada do painel.",
    ENETUNREACH: "Rede do banco indisponível. A conexão direta pode exigir IPv6; confira o pooler.",
    ECONNREFUSED: "Conexão PostgreSQL recusada. Confira host e porta.",
    ETIMEDOUT: "Tempo esgotado na conexão PostgreSQL. Confira rede e disponibilidade.",
    SELF_SIGNED_CERT_IN_CHAIN: "Verificação TLS falhou. Configure o certificado CA confiável do Supabase; a validação não foi desabilitada.",
    DEPTH_ZERO_SELF_SIGNED_CERT: "Verificação TLS falhou. Configure o certificado CA confiável do Supabase; a validação não foi desabilitada.",
    UNABLE_TO_VERIFY_LEAF_SIGNATURE: "Verificação TLS falhou. Configure o certificado CA confiável do Supabase; a validação não foi desabilitada.",
    CERT_HAS_EXPIRED: "Certificado TLS expirado. Verifique a configuração do servidor.",
    XX000: "O servidor rejeitou a conexão. Confira projeto, usuário e pooler.",
  };
  return typeof code === "string" && Object.hasOwn(messages, code) ? messages[code] : "Falha na conexão PostgreSQL. Confira configuração, rede e certificado TLS; detalhes sensíveis foram omitidos.";
}
