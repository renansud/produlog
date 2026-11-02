# Modelo de dados PostgreSQL + Prisma ORM

## Escolha de modelagem

Versão inicial **normalizada só onde há ganho claro**. Manter dimensões de operação, supervisor e técnico com identificadores próprios; preservar o registro de origem e o histórico das importações.

| Modelo Prisma proposto | Campos centrais | Responsabilidade |
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

## Desenho Prisma sugerido (não é migração executável)

```prisma
// Trecho ilustrativo: o agente deve completar índices, relações e tabelas.
enum UserRole {
  ADMIN
  USER
}

model UserProfile {
  id        String   @id @db.Uuid
  email     String   @unique
  role      UserRole @default(USER)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
}

model ProductivityRecord {
  id             String   @id @default(uuid()) @db.Uuid
  referenceMonth DateTime @db.Date
  contract       String
  production     Decimal  @db.Decimal(14, 2)
  goalMet        Boolean?
  controller     String?
  status         String?
  sourceRowKey   String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  // Relações com Operation, Supervisor, Technician e ImportBatch na etapa 03.
}
```

## Autorização e Supabase

- Supabase Auth autentica; `UserProfile` guarda role e escopo e é consultado no servidor.
- **Prisma via conexão privilegiada não herda automaticamente as políticas RLS do JWT**. Nunca considerar RLS a única barreira. `requireRole()` e `scopeToAllowedOperations()` obrigatórios em cada caso de uso.
- Quando usar Data API do Supabase no futuro, definir RLS e políticas consistentes; no MVP, não fazer queries de produtividade pelo frontend.

## Conexões e CLI (Prisma 7 estável + Postgres Supabase)

- `DATABASE_URL`: **transaction pooler 6543** para runtime serverless Vercel, com configuração compatível (`pgbouncer=true` se indicada pela versão/driver).
- `DIRECT_URL`: conexão **direta** para migrações, ou session pooler `5432` quando necessário (por exemplo IPv4-only).
- Prisma 7: `prisma.config.ts` usa `DIRECT_URL` como `datasource.url` **para comandos de migração**; `@prisma/adapter-pg` no servidor recebe `DATABASE_URL`.
- Conferir instruções do conjunto de versões instalado antes de criar `prisma.config.ts`. Não copiar snippet de Prisma 6 sem adaptação.
- `prisma migrate dev` só local/dev; `prisma migrate deploy` em pipeline controlado para produção.

**Fontes:** https://supabase.com/docs/guides/database/prisma · https://supabase.com/docs/guides/database/connecting-to-postgres · https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7
