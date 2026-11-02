# E03 — Prisma instalado, schema e conexões preparadas

Solicitação de 2026-11-02 autorizou instalar Prisma, montar schema e conexões. E03-T01 e E03-T02 concluídas; parte de E03-T04 (cliente server-only) preparada. A fase completa não está concluída: migrations aplicadas em desenvolvimento, repositórios de domínio, provisioning UserProfile e seeds continuam pendentes. O documento original docs/etapas/03-banco.md não foi fornecido.

## Entregue

- Prisma CLI, Client e adapter-pg 7.10.1 alinhados. npm latest apontava para 8 release candidate, evitada. pg, dotenv e tipos instalados; ESM explícito no pacote e imports TS habilitados para código gerado/CLI.
- Oito modelos: UserProfile, UserOperationAccess, Operation, Supervisor, Technician, ProductivityRecord, ImportBatch e AuditLog. Roles ADMIN/USER, valores Decimal(14,2), meta nullable, competência Date, UUIDs, índices/FKs e identidade única source + sourceRowKey.
- Homônimos preservados: nomes de técnicos/supervisores não são únicos. externalId deve ser uma identidade opaca com namespace quando necessário. source identifica origem estável; não deduplica produção por nome.
- Prisma Client gerado em generated/prisma (ignorado), postinstall/build com geração offline, getPrisma lazy/server-only/singleton para HMR e produção, pool padrão 5 e timeouts limitados. Sem log de query/credenciais.
- Variáveis críticas validadas com Zod. DATABASE_URL é só runtime; DIRECT_URL é só CLI. Sem conexão inventada nem fallback de credencial. Rejeita pooler transacional para migrations, queryparams que substituem host/porta/TLS e URLs PostgreSQL públicas.
- Certificado CA público obtido por HTTPS no endereço confirmado no código oficial do Studio, validado e incluído no rastreamento Next. URLs locais configuradas com verify-full/sslrootcert; CLI adapta para sslcert/sslaccept=strict. Nenhuma confiança global ou configuração remota de SSL enforcement alterada.
- Migration SQL gerada offline, com transação, RLS sem políticas públicas, proteção de grants, FK/index/Decimal e checks de competência/contagens. Nenhuma migration, db push, seed, tabela, usuário ou dado remoto foi criado/alterado.
- Auditoria de publicação corrigida para ler .env com dotenv (espaços, aspas, export e comentários), com regressão nativa. Nenhuma credencial real foi incluída no código ou commit.

## Verificação real de conexão, somente leitura

`npm run db:check` e `npm run db:check -- --direct` passaram usando o Prisma Client gerado, adapter-pg e SELECT 1. Clientes desconectados ao final. Consulta de status de migrations pela CLI também alcançou o banco com TLS; retornou código 1 por migration inicial pendente, sem código de erro Prisma. SQL da migration não foi executado. Não foram consultadas linhas de colaboradores ou tabelas Auth.

## Testes

- Prisma format/validate/generate aprovados; instalação e geração sem depender de conexão.
- npm run lint, npm run typecheck (tsc --noEmit), npm test, npm run build e npm run test:http aprovados.
- 460 testes unitários, 35 arquivos: inclui URLs inválidas/sanitização, pool, TLS, roteamento, separação migration/runtime, configuração do adapter e inicialização/reutilização lazy.
- 30 testes HTTP de produção aprovados: login e rotas privadas preservados, demos fechadas em produção.
- 18 E2E aprovados em 46,5 s (desktop/mobile): login/navegação e administração fictícia, incluindo 320/768/1280 px, temas e texto ampliado. Nenhuma conta real criada.
- 5 testes nativos da política de publicação aprovados; auditoria de candidatos passou sem valores reais do ambiente ou padrões de credencial. É heurística, não análise universal de histórico/PII.
- npm audit da instalação manteve 21 alertas (2 baixos, 19 moderados) na árvore já existente de ferramentas; não foi usado audit fix --force.

## Arquivos

App: package.json/lock, prisma/schema.prisma, prisma.config.ts, prisma/migrations/20261102000000_initial/migration.sql, prisma/migrations/migration_lock.toml, prisma/certs/supabase-prod-ca-2021.crt, prisma/README.md, lib/prisma.ts, lib/database/{env.ts,cli-url.ts,failure.ts}, scripts/check-database.mjs, .env.example, tsconfig.json, eslint.config.mjs e next.config.ts. .env.local foi ajustado somente localmente e está ignorado.

Testes: tests/unit/{database-env,database-cli-url,database-failure,prisma-client}.test.ts; scripts/{check-publication,publication-policy}.mjs e tests/integration/publication.test.mjs. Raiz: .gitignore, MODELO_DADOS, BACKLOG, docs/DECISOES, docs/PUBLICACAO_PRODUTIVA e README do app.

## Pendências

- E03-T03: aplicar a migration revisada em desenvolvimento/homologação e testar integridade/rollback; nenhuma aplicação automática em produção.
- E03-T04/T05: repositórios, filtros/escopo SQL, provisioning de UserProfile, seeds e testes de persistência. getPrisma não substitui autorização; RLS do arquivo SQL só entra em vigor quando a migration for aplicada.
- As telas de entrada continuam em conferência local; não salvam produtividade real só porque a conexão foi instalada.
- Primeiro ADMIN continua pendente: a variável Auth administrativa preenchida não passou na validação de formato. Não foi exibida nem alterada. Não tem relação com a senha PostgreSQL/conexão Prisma já validada.

Fontes: [Prisma 7](https://www.prisma.io/docs/orm/v7), [conector PostgreSQL](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql), [Supabase Prisma](https://supabase.com/docs/guides/database/prisma), [SSL Supabase](https://supabase.com/docs/guides/platform/ssl-enforcement), [endereço oficial da CA no Studio](https://github.com/supabase/supabase/blob/master/apps/studio/hooks/custom-content/custom-content.json).
