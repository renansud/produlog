# Modelo de dados PostgreSQL + Prisma ORM

## Escolha de modelagem

Versão inicial **normalizada só onde há ganho claro**. Manter dimensões de operação, supervisor e técnico com identificadores próprios; preservar o registro de origem e o histórico das importações.

| Modelo Prisma implementado | Campos centrais | Responsabilidade |
|---|---|---|
| `UserProfile` | `id UUID` (mesmo Supabase Auth user ID), `email`, `role`, `active`, `createdAt` | autorização/identidade local; Auth gerencia senha |
| `UserOperationAccess` | `userId`, `operationId` | escopo por operação |
| `Operation` | `id`, `name`, `normalizedName`, `active` | lista de operações |
| `Supervisor` | `id`, `name`, `normalizedName`, `externalId?` | supervisor identificado |
| `Technician` | `id`, `name`, `normalizedName`, `externalId?` | técnico identificado |
| `ProductivityRecord` | `id`, `referenceMonth Date`, `operationId`, `supervisorId`, `technicianId`, `contract`, `production Decimal(14,2)`, `goalMet Boolean?`, `controller`, `status`, `sourceRowKey`, `importBatchId`, timestamps | linha de produtividade |
| `ImportBatch` | `id`, `source`, `fileName?`, `status`, `rowsReceived`, `rowsImported`, `rowsRejected`, `checksum`, `executedBy`, timestamps | rastreio e idempotência |
| `AuditLog` | `id`, `actorId?`, `action`, `entity`, `entityId`, `metadata JSONB`, `createdAt` | trilha de alterações |

## Relacionamentos sugeridos

- `UserProfile 1:N UserOperationAccess N:1 Operation`.
- `ProductivityRecord N:1 Operation, Supervisor, Technician, ImportBatch`.
- `AuditLog` referencia actor por ID, preservando a trilha quando uma conta é desativada.
- Supabase Auth permanece no schema `auth`; **não recriar senha ou tabela `auth.users` via Prisma Migrate**.
- Sincronização `auth.users` → `UserProfile`: preferir provisioning administrativo server-side; se precisar trigger, isolar SQL e testar o efeito sobre login/cadastro.

## Chaves e integridade

- `referenceMonth` obrigatório, sempre competência `AAAA-MM-01`; índice composto `[referenceMonth, operationId, supervisorId]`.
- `sourceRowKey` deve ser estável por origem; usar índice exclusivo composto `[source, sourceRowKey]` ou tabela `SourceRecordIdentity` para upsert.
- **Não deduplicar linhas de produção pelo nome apenas**: um técnico pode ter mais de um contrato/registro/mês.
- `goalMet` permite `null` (indeterminado); campos de importação guardam texto bruto e/ou avisos para auditoria.
- `production` numérico decimal, não string formatada e não JS float como fonte de verdade.
- Múltiplos homônimos são possíveis: quando não existir ID externo, revisão de correspondência de técnicos na importação é obrigatória.

## Schema implementado em 2026-11-02

Fonte canônica: [schema.prisma](painel-produtividade/prisma/schema.prisma). Prisma 7.10.1, tabelas/colunas mapeadas para snake_case, oito modelos, UUIDs, timestamps e índices/FKs completos. Migration inicial em prisma/migrations/20261102000000_initial/migration.sql, gerada offline, sem aplicação no banco. Contém RLS sem políticas públicas, grants restritos e checks de competência/contagens.

UserProfile não contém senha nem gerencia auth.users. Fonte transitória de autorização continua app_metadata até provisioning/repositório local. Operações têm normalizedName único; técnico/supervisor admitem homônimos e usam externalId opaco e único quando disponível. source é namespace de origem, separado de kind do lote; source + sourceRowKey é único. Não há importação idempotente aplicada ainda. [Entrega e limites](docs/ENTREGA_E03-T01-T02.md).

## Autorização e Supabase

- Supabase Auth autentica; `UserProfile` guarda role e escopo e é consultado no servidor.
- **Prisma via conexão privilegiada não herda automaticamente as políticas RLS do JWT**. Nunca considerar RLS a única barreira. `requireRole()` e `scopeToAllowedOperations()` obrigatórios em cada caso de uso.
- Quando usar Data API do Supabase no futuro, definir RLS e políticas consistentes; no MVP, não fazer queries de produtividade pelo frontend.

## Conexões e CLI (Prisma 7 estável + Postgres Supabase)

- `DATABASE_URL`: **transaction pooler 6543** para runtime serverless Vercel, com configuração compatível (`pgbouncer=true` se indicada pela versão/driver).
- `DIRECT_URL`: conexão **direta** para migrações, ou session pooler `5432` quando necessário (por exemplo IPv4-only).
- Prisma 7: `prisma.config.ts` usa `DIRECT_URL` como `datasource.url` **para comandos de migração**; `@prisma/adapter-pg` no servidor recebe `DATABASE_URL`.
- Versões instaladas: CLI/client/adapter-pg 7.10.1. Conferir documentação instalada ao alterar `prisma.config.ts`. Não copiar snippet de Prisma 6 sem adaptação. TLS com CA pública verificada: runtime usa sslrootcert/verify-full; CLI traduz para sslcert/sslaccept=strict. Os dois destinos passaram em SELECT 1 via Prisma, sem mutation.
- `prisma migrate dev` só local/dev; `prisma migrate deploy` em pipeline controlado para produção.

**Fontes:** https://supabase.com/docs/guides/database/prisma · https://supabase.com/docs/guides/database/connecting-to-postgres · https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7
