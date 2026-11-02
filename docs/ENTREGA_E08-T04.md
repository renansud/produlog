# E08-T04 — Estado compartilhado do painel

Data: 2026-11-01. Escopo: frontend local com dados fictícios, sem login real ou publicação.

## Mudanças

- A URL validada no servidor define filtros, pesquisa aplicada, ordem, tamanho e página.
- Mudar filtros globais preserva pesquisa/ordem/tamanho, volta à primeira página e remove supervisores incompatíveis.
- Limpar filtros remove dimensões e pesquisa, preservando ordem/tamanho. Pesquisa/ordem/tamanho reiniciam página; paginação preserva o recorte.
- Um provider compartilha a transição entre filtros e tabela e bloqueia CSV durante a atualização. As linhas continuam renderizadas e consultadas no servidor.
- Correção de supervisor incompatível por URL preserva parâmetros válidos do detalhamento. Parâmetros desconhecidos continuam rejeitados; erros exclusivos da tabela permanecem isolados.
- Rascunhos só são aplicados com Pesquisar e são descartados ao navegar. CSV usa somente o estado aplicado, incluindo todas as páginas.
- UI conserva padrão de 10 linhas e URL inicial limpa; API conserva padrão de 50.

## Arquivos

Em painel-produtividade: app/page.tsx; modules/productivity/domain/dashboard-state.ts; presentation/dashboard-state-provider.tsx, dashboard-filters.tsx, productivity-details-controls.tsx, productivity-details.tsx e local-preview.tsx; tests/unit/dashboard-state.test.ts e productivity-details.test.tsx; e2e/dashboard-state.spec.ts e productivity-details.spec.ts; README.md e modules/productivity/README.md. Na raiz: CONTRATOS_API.md, docs/DECISOES.md, docs/CHECKLIST_PARIDADE.md e este relatório.

## Validação

Lint e npx tsc --noEmit aprovados. Vitest: 286 testes em 19 arquivos, incluindo oito novos testes da política e nove testes do detalhamento adaptados ao provider. Build de produção aprovado. HTTP: 19 testes aprovados, preservando 401 das APIs privadas e 404 da demonstração em produção.

Playwright: 58 cenários distintos aprovados em desktop/mobile, cobrindo filtros, ações, tabela, transição, reflow, histórico, estado compartilhado, CSV e acessibilidade. A rodada complementar inicialmente apontou dois erros do novo teste de rascunho (desktop/mobile): tbody selecionava também as tabelas dos gráficos. O seletor foi limitado ao painel de detalhamento e os seis cenários de estado passaram na repetição. Não houve correção adicional no produto. Total da seleção final: 363 testes aprovados (286 unitários + 19 HTTP + 58 navegador), sem ignorados. Não representa execução de todos os testes visuais de gráficos sem alteração. Avisos NO_COLOR/FORCE_COLOR do ambiente não causaram falhas. CI remoto não executado.

## Limites e critérios

Não houve mudança de métricas, autorização, infraestrutura ou dependências. Os adaptadores são sintéticos; integração real de autenticação/banco e snapshot SQL continuam pendentes. Não houve deploy para Vercel/Supabase, criação de usuário ou uso de dados empresariais.

O arquivo original docs/etapas/08-detalhamento.md continua ausente. A política local foi implementada e testada; a conferência dos critérios formais da fase permanece pendente e BACKLOG.md não foi marcado.

Próximo passo recomendado: E08-T05 — executar o E2E do MVP local.
