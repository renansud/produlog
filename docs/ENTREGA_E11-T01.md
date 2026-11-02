# E11-T01 — Preparação local de publicação

Data: 2026-11-01. Escopo autorizado: preparar GitHub, Vercel e conexão Supabase; nome informado produtiva e Supabase classificado como produção. Sem criação remota, push, deploy, usuário, schema ou migração.

## Mudanças

Git inicializado na raiz com branch main, sem commit/remote. Ignorados subaps.txt, .env*, artefatos, .vercel e certificados; exemplo público permitido. Adicionados .gitattributes, configuração Next.js Vercel, engines Node 24.x e auditoria de publicação com quatro testes. Workflow existente habilitado em push main/PR/manual, incluindo auditoria e seus testes. Caminho de Root Directory e pendências em [PUBLICACAO_PRODUTIVA.md](PUBLICACAO_PRODUTIVA.md).

Supabase Auth health respondeu HTTP 200 via GET somente leitura, sem exibir URL/chave em logs e sem consultar tabelas. Clientes SSR já estavam configurados. Isso não valida login, signup desabilitado, RLS ou acesso ao banco.

GitHub, Vercel e Supabase encontrados como integrações disponíveis, ainda sem conexão confirmada. Conta/organização GitHub pendente. Nenhuma identidade de commit inventada. Acesso e destinos remotos são necessários para prosseguir com o envio e a vinculação.

## Arquivos

.gitignore, .gitattributes, .github/workflows/quality.yml; painel-produtividade/.vercelignore, vercel.json, package.json/package-lock.json, scripts/check-publication.mjs, publication-policy.mjs, tests/integration/publication.test.mjs; README.md da raiz/aplicação, docs/DECISOES.md e estes documentos. .git criado localmente.

## Validação

Auditoria de publicação aprovada. Os quatro testes da política passaram; uma assinatura fictícia literal de chave privada no novo teste havia sido detectada pelo próprio scanner e a fixture foi ajustada para construção em runtime, sem afrouxar a política. Nenhuma credencial real estava na fixture.

Lint, TypeScript (npm run typecheck, tsc --noEmit), 356 testes Vitest em 22 arquivos, build e 20 testes HTTP de produção aprovados. Total da seleção: 380 testes (356 + 20 + quatro), sem ignorados. Não houve mudança de UI ou lógica do produto; suíte de navegador não foi repetida. Nenhuma execução em CI remoto. Workflow YAML validado com js-yaml instalado, JSON Vercel e engines/lockfile conferidos. Primeiro parser tentado (yaml) não estava instalado; não foi adicionada dependência, usando o parser já disponível. O lockfile teve somente engines de raiz alinhado, sem atualização de dependências.

Verificado git check-ignore para subaps.txt, .env.local e .tools. Git no sandbox exigiu safe.directory por diferença de proprietário; usado apenas -c por comando, sem mudar configuração global. Arquivos candidatos preparados no índice para revisão, sem commit e sem envio. A auditoria é heurística e não substitui revisão humana/segredos do GitHub ou análise de dados pessoais.

## Limites

Next.js em produção ainda retorna 404 para a demo e 401 para APIs privadas; o dashboard utilizável depende de E02-T03/T04/T05, E03/E04 e aceites. Não foi declarada liberação de produção ou removida proteção para facilitar deploy. CI remoto e publicação não executados. docs/etapas/11-publicacao.md ausente; BACKLOG.md sem marcação formal.

Próximo passo: confirmar acesso/destino GitHub e revisar o candidato privado; para disponibilizar dashboard real, E02-T03 (login/logout/reset), mantendo as demais dependências e produção isolada.
