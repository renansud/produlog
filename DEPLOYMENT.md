# Deploy Vercel + Supabase — operação

## Ambientes

- **Local:** `localhost:3000`; Supabase projeto de desenvolvimento ou instância local; `.env.local` no `.gitignore`.
- **Preview/homologação:** Vercel Preview, **Supabase homologação separado** da produção. URLs de retorno Auth configuradas para previews permitidos.
- **Produção:** projeto Vercel Production + Supabase Production + domínio personalizado (opcional), acesso só autenticado.

## Antes do primeiro deploy

1. Projeto Git privado e revisado, `package-lock.json` commitado.
2. Criar projetos Supabase separados dev/homolog/prod; configurar Auth e perfis iniciais.
3. Conferir versão estável do Prisma e Next travadas no lockfile; testar build local.
4. Configurar variáveis `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `DATABASE_URL` (transaction pooler runtime), `DIRECT_URL` (migrations).
5. Aplicar migrations de produção em **etapa controlada** (`npx prisma migrate deploy`) com credenciais apropriadas e backup.
6. Conectar repositório GitHub à Vercel e criar projeto Next.js com runtime Node.
7. Configurar env vars por ambiente, redirects Auth, HTTPS, headers, logs sem PII e alertas.
8. Definir política de domínio e autorização (nunca dashboard público por engano).
9. Subir dados via importação administrada após aprovação e comparar indicadores.
10. Testar login/logout, filtragem por perfil, dados por operação, CSV e dark mode em URL `/exec` antiga? Não: o novo app terá URL própria Vercel; a antiga continua separada até cutover.

## Banco Supabase na Vercel

- Runtime serverless: pooler transaction `:6543`, driver adaptado e limites de conexões.
- CLI migrations: direct ou session pooler `:5432`, **não transaction pooling**.
- Senha em URL deve ser escapada corretamente; armazenar em env vars privadas.
- Prisma geração de client no build (`postinstall` ou script de build conforme versão instalada); migrations fora de builds de PR.

## Produção empresarial e custo

**Vercel Hobby não pode ser usado comercialmente**. Para ambiente empresarial, avaliar Vercel Pro ou Enterprise. Conferir preços, consumo, retenção de logs e governança antes da ativação: https://vercel.com/docs/plans/hobby e https://vercel.com/docs/limits/fair-use-guidelines.

Supabase também pode ter custos por banco, Auth, storage/egress e backup; dimensionar após estimar usuários simultâneos, frequência de sync e quantidade de registros. Não presumir hospedagem gratuita em produção empresarial.

## Backup, rollback e observabilidade

- Backups/restauração da base testados; guardar cópia segura do lote de importação.
- Rollback de código via deploy anterior Vercel; rollback de schema exige plano separado (migrations são progressivas).
- Logs sem nomes/CPF, sem tokens, com requestId, userId pseudo/ID interno, erro e origem da sincronização.
- Alertar sobre falhas de login, importação, sincronização, consulta e tempos de resposta.
- Migrations revisadas e agendadas; validar mudança de schema antes de deploy que depende dela.
- Após cutover, desativar dashboard Apps Script somente quando aceite formal, sem perder histórico.

## Referências

- https://vercel.com/docs/deployments/environments
- https://vercel.com/docs/cron-jobs
- https://supabase.com/docs/guides/database/connecting-to-postgres
- https://www.prisma.io/docs/guides/v7/frameworks/nextjs
