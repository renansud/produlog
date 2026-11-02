# E02-T02 — Clientes Supabase SSR e proxy

Data: 2026-11-01. Configuração local solicitada; sem criação de usuários, alteração remota, banco ou deploy.

## Entrega

Dependências já instaladas: supabase-js 2.118.0 e ssr 0.12.7. Bloco revisado com npx shadcn@latest view @supabase/supabase-client-nextjs e instalado com npx shadcn@latest add @supabase/supabase-client-nextjs --yes. A tentativa inicial de rede falhou com EACCES; execução com acesso autorizado concluiu. O registro criou arquivos em lib/, reorganizados em lib/supabase para seguir a arquitetura.

Clientes de navegador/servidor, configuração Zod com erro sanitizado e helper de sessão via getClaims/cookies. Servidor usa cookies assíncronos e cliente por requisição, com server-only. proxy.ts atende somente /auth/* no Next.js 16; sem redirect amplo para login inexistente. Matcher deverá acompanhar futuras rotas protegidas com testes. Cookies renovados seguem para request/response, com cache privado/no-store.

.env.local recebe os valores públicos fornecidos sem reproduzi-los na documentação e preservando outras variáveis. O .gitignore da raiz já ignora .env*. .env.example tem somente placeholders. subaps.txt não foi copiado/alterado. Skills opcionais não foram instaladas, pois não são necessárias à aplicação.

APIs privadas continuam sem sessão/perfil reais e bloqueadas; proxy não autoriza consultas. Nenhum dado de produtividade foi conectado à Data API. A demo permanece sem login real.

## Arquivos

lib/supabase/{client,server,session,env}.ts; proxy.ts; .env.example e .env.local (local/ignorado); components.json com registro @supabase; package.json/package-lock.json conforme instalação do registro; tests/unit/supabase-config.test.ts e supabase-session.test.ts; README.md, modules/auth/README.md; docs/DECISOES.md e este relatório.

## Validação

Lint, TypeScript (npx tsc --noEmit inicialmente e npm run typecheck na repetição), build e HTTP concluídos com código 0. Vitest: 356 testes aprovados em 22 arquivos, incluindo oito novos casos de configuração e sessão. HTTP de produção: 20 aprovados. Playwright: oito cenários de shell/API em desktop/mobile aprovados em 19,7 segundos; demo acessível e APIs privadas bloqueadas. Total da seleção final: 384 testes, sem ignorados. Não se repetiu a suíte integral de navegador sem relação com esta mudança.

O teste inicial de URL malformada detectou que o refinamento lançava Invalid URL antes do erro sanitizado. Corrigido com captura no refinamento e repetida a sequência; não havia valores reais nos testes. Verificado que ambas as variáveis de .env.local estão preenchidas sem exibi-las e que .gitignore ignora .env* e permite somente .env.example como modelo.

Testes usam configuração/cookies sintéticos, sem login ou chamada remota. Não foi comprovada sessão real, renovação de tokens do projeto, conectividade ou signup desabilitado. Relatório Playwright local em painel-produtividade/playwright-report/index.html, sobrescrito em próximas execuções. CI remoto não executado. Aviso NO_COLOR/FORCE_COLOR do ambiente não causou falhas.

## Pendências

docs/etapas/02-autenticacao.md ausente; BACKLOG.md sem marcação formal. E02-T01 remoto, E02-T03 telas, E02-T04 perfil e E02-T05 escopo reais continuam pendentes. Nenhum usuário, tabela, RLS, migration ou deploy alterado.

Referências: [SSR oficial](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs), [bloco oficial](https://supabase.com/library/docs/nextjs/client) e documentação instalada do Next.js para proxy/cookies.

Próximo passo recomendado: E02-T03 — login/logout/reset privados, sem signup público, mantendo a demo isolada.
