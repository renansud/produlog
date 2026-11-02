# Comandos de instalação — para etapa 01 e posteriores

Execute **somente quando a etapa correspondente estiver aprovada**. Preferência por NPM para manter a configuração default do Next.

## Bootstrap Next (E01-T01)

```bash
npx create-next-app@latest painel-produtividade --yes
cd painel-produtividade
npm run dev
```

Depois copie `AGENTS.md`, `docs/`, `.env.example` e `referencias/` deste pacote para a raiz do app Next.

## Componentes (E01-T02)

```bash
npm install zod @supabase/supabase-js @supabase/ssr recharts lucide-react next-themes
npx shadcn@latest init
npx shadcn@latest add button card input label popover command checkbox table skeleton tooltip dropdown-menu sonner dialog separator
```

> Os componentes disponíveis e flags da CLI mudam; se um nome não for aceito, consultar https://ui.shadcn.com/docs/cli e ajustar. `init` deve reconhecer Next/Tailwind criado com defaults.

## Prisma + Supabase Postgres (E03-T01)

```bash
npm install @prisma/client@7 @prisma/adapter-pg pg dotenv
npm install -D prisma@7 @types/pg tsx
npx prisma init
```

Este conjunto fixa Prisma 7 estável e não Prisma 8 RC. Depois editar `prisma.config.ts`, `.env.local` e `prisma/schema.prisma` para usar `DIRECT_URL` em migrações e `DATABASE_URL` no runtime com driver adapter. **Não rodar `migrate` antes de revisar o schema.**

## Testes (E01-T04/E10)

```bash
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom jsdom @playwright/test
npx playwright install
```

As versões e scripts devem ser adaptados ao Next/React gerados, priorizando compatibilidade e testes executáveis.

## Banco após schema aprovado (E03-T03)

```bash
npx prisma validate
npx prisma generate
npx prisma migrate dev --name initial_schema
```

Para produção, `npx prisma migrate deploy` apenas em etapa aprovada e com backup.
