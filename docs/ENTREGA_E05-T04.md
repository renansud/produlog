# E05-T04 — Endpoints de leitura

Data: 2026-10-31. Escopo local implementado e validado.

## Entrega

- GET `/api/v1/dashboard/{summary|monthly|supervisors|filters}`, em runtime Node e modo dinâmico. Retornam 401 enquanto a autenticação real não estiver conectada; não há bypass por query, cookie ou cabeçalho.
- Namespace separado `/api/demo/dashboard/` com os mesmos quatro contratos, exclusivamente em desenvolvimento, hostname local e origem compatível. Dados sintéticos, `demo: true` e cabeçalho X-Servlog-Demo. Em produção retorna 404.
- Parser de filtros com listas por vírgula ou parâmetros repetidos, schema estrito, limites e UUIDs. Perfis e permissões não são aceitos como entrada.
- DTOs específicos sem linhas de técnicos ou chaves internas; produção textual, percentuais convertidos apenas depois de arredondados e razões exatas textuais.
- Agregação de supervisores com todos os filtros, deduplicação supervisor-técnico-mês, contagens ponderadas e ordenação pela taxa exata, com desempate por nome/ID.
- Erros reduzidos 400/401/403/404/500 e Cache-Control private/no-store. Falhas internas não publicam mensagens ou dados do repositório.
- Contrato atualizado em CONTRATOS_API.md.

## Arquivos

Em `painel-produtividade/`: `app/api/v1/dashboard/[kind]/route.ts`, `app/api/demo/dashboard/[kind]/route.ts`, `modules/productivity/domain/supervisor-performance.ts`, `modules/productivity/application/read-productivity-dashboard.ts`, `modules/productivity/presentation/dashboard-http.ts`, `modules/productivity/infrastructure/dashboard-dependencies.ts`, `modules/productivity/infrastructure/demo-dashboard.ts`, `tests/unit/dashboard-http.test.ts`, `tests/integration/production.test.mjs`, `e2e/dashboard-api.spec.ts`, `modules/productivity/README.md` e `README.md`. Também CONTRATOS_API.md, docs/DECISOES.md e docs/CHECKLIST_PARIDADE.md.

## Validação

`npm run check` terminou com código 0:

- Lint e TypeScript sem erros ou avisos.
- Vitest: 130 testes passaram (16 novos).
- Build: compilação, TypeScript e geração das rotas concluídos.
- HTTP de produção: 13 testes passaram, incluindo quatro endpoints privados 401 e quatro endpoints demo 404.
- Playwright/API em desenvolvimento: 10 testes passaram nos perfis desktop/mobile.
- Total: 153 testes passaram, nenhum ignorado.

Casos verificam query múltipla, privilégio forjado, mês inválido, erro interno sanitizado, supervisor incompatível, pesos mensais, empates, metas nulas, duplicidades, origem externa e contratos reais servidos pelo Next.js. Julho retorna produção 800.00, evolução −5,36 p.p. com junho/julho preservados, e supervisão 50%/25%.

## Limites

Supabase Auth e Prisma não foram conectados. Os testes não comprovam sessão real, RLS ou predicado SQL; o provedor privado falha fechado. O adaptador demo não pode receber dados reais. Não há dados de funcionários, credenciais ou publicação. A interface ainda não consome os endpoints; detalhes/CSV/importação e usuários continuam pendentes. CI remoto não executado.

O roteiro original docs/etapas/05-metricas.md permanece ausente, e o backlog não foi marcado sem seus critérios completos. E05-T05 (índices/otimizações no banco) depende do adaptador real. Próximo passo local recomendado: E06-T01 — dashboard de demonstração preservando o bloqueio em produção; autenticação real continua adiada.
