# Prisma e PostgreSQL

Prisma CLI, Client e adapter-pg fixados em 7.10.1. Modelo canônico em schema.prisma; SQL inicial em migrations/20261102000000_initial/migration.sql. O schema auth pertence ao Supabase Auth e não é gerenciado por estas migrations.

## Comandos locais (na pasta painel-produtividade)

- `npm run db:validate`: validação estrutural do schema, sem conexão.
- `npm run db:generate`: gera o cliente em generated/prisma, ignorado pelo Git.
- `npm run db:format`: formata schema.
- `npm run db:check`: usa PrismaPg + Prisma Client para executar somente SELECT 1 no destino runtime.
- `npm run db:check -- --direct`: mesma consulta de leitura no destino de migrations.
- `npm run build`: gera cliente e compila Next; não aplica migrations nem precisa conectar ao banco.
- `npm ci` gera cliente no postinstall; arquivos gerados não devem ser commitados.

## Variáveis privadas

Use .env.local localmente e variáveis privadas no servidor: DATABASE_URL, DIRECT_URL e DATABASE_POOL_MAX (padrão 5, intervalo 1–20). Não use NEXT_PUBLIC para credenciais PostgreSQL. O usuário do runtime deve ter privilégios mínimos; a conta de migração é separada quando disponível.

Runtime serverless: pooler transacional Supabase (6543). Migrations: conexão direta ou pooler de sessão (5432), nunca o pooler transacional. Não existe fallback automático entre as URLs. Postgres remoto exige TLS; local pode funcionar sem TLS. As URLs não aparecem em respostas/logs.

TLS foi configurado localmente com `sslmode=verify-full&sslrootcert=prisma/certs/supabase-prod-ca-2021.crt`. A CA é pública e está versionada; foi obtida no endereço usado pelo Studio oficial, não de uma conexão não verificada ao banco. O Next inclui o certificado no rastreamento de arquivos do servidor. Prisma CLI adapta sslrootcert para sslcert (caminho absoluto) e exige sslaccept=strict; não desliga validação de certificado/hostname. Confira a CA oficial em caso de rotação/expiração. Não use rejectUnauthorized=false, sslmode=no-verify ou NODE_TLS_REJECT_UNAUTHORIZED=0.

Referência pública da CA: https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt .
SHA-256: 807025AD50D4ED219D2C9C7D299C004F824EB00CF7F65AFEF607D07B72E6CAFA.
Válida até 2031-04-26, conforme certificado verificado em 2026-11-02.

## Uso no servidor

Importe `getPrisma` de `@/lib/prisma` somente em infraestrutura server-side, depois de autorização no caso de uso. O cliente é inicializado sob demanda, reutilizado por processo e HMR. Não desconecte a cada requisição; o check CLI é um processo isolado e desconecta ao terminar.

UserProfile usa UUID do Auth, sem senha; não é provisionado automaticamente nesta entrega. Papéis ainda vêm da fonte transitória app_metadata. Os repositórios de produtividade/CRUD continuam pendentes; instalar Prisma não conecta automaticamente as telas aos dados reais.

## Migration preparada, não aplicada

O SQL foi gerado offline, revisado com transação, RLS sem políticas públicas, revogação de grants PUBLIC/anon/authenticated quando existirem, FKs/índices/Decimal e checks de competência no primeiro dia e contagens não negativas. Não apaga/recria auth.users nem cadastra contas.

A consulta somente de leitura de status confirmou a migration inicial pendente. Aplicar primeiro em banco isolado de desenvolvimento/homologação, inspecionar objetos existentes e privilégios, revisar backup/rollback e ter autorização específica antes de qualquer execução em produção. Não usar db push ou migrate reset em produção.
