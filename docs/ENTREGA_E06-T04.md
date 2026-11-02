# E06-T04 — Ações compactas e tema

Data: 2026-10-31. Escopo local implementado e validado; exportação preparada e indisponível até E08-T03.

## Entrega

- Botões de atualizar e tema no cabeçalho, com nomes acessíveis, tooltips e estado ocupado.
- Atualizar usa router.refresh para nova leitura do servidor, preservando URL e recorte; não reimporta dados.
- Tema escuro inicial e alternativa clara com preferência persistida em localStorage (`servlog-theme`). Cards, menus, avisos e notificações seguem o tema. Sistema não determina a preferência inicial.
- Tokens CSS reorganizados para claro/escuro, mantendo a identidade Servlog e cores de sinal dos KPIs adequadas aos fundos.
- Limpar filtros junto aos campos, usando o fluxo existente e removendo todas as seleções da URL.
- Botão Exportar CSV preparado, semanticamente indisponível, com motivo consultável por foco/tooltip. Sem download ou implementação antecipada de CSV.
- Controles indisponíveis mantêm foco para permitir leitura do motivo; aria-disabled e guarda de ação impedem execução. Animação de atualização respeita redução de movimento.
- Provedor de tema usa classe aplicada antes da hidratação e controle com snapshot consistente; apenas html permite a diferença de atributos gerenciada pelo provedor.

## Arquivos

Em `painel-produtividade/`: `components/theme-provider.tsx`, `components/dashboard/dashboard-actions.tsx`, `components/dashboard/dashboard-shell.tsx`, `components/dashboard/kpi-card.tsx`, `components/demo/component-demo.tsx`, `app/layout.tsx`, `app/globals.css`, `modules/productivity/presentation/dashboard-filters.tsx`, `modules/productivity/presentation/summary-indicators.tsx`, `tests/setup.ts`, `tests/unit/dashboard-actions.test.tsx`, `e2e/dashboard-actions.spec.ts`, `modules/productivity/README.md` e `README.md`. Também docs/DECISOES.md e docs/CHECKLIST_PARIDADE.md.

## Validação

Pipeline final `npm run check`: código 0.

- Lint e TypeScript sem erros ou avisos.
- Vitest: 160 testes passaram, incluindo cinco novos de ações.
- Build: compilação, TypeScript e geração de páginas concluídos.
- HTTP de produção: 14 testes passaram.
- Playwright/API: 36 testes passaram, incluindo seis novos distribuídos entre desktop e mobile.
- Total: 210 testes passaram, nenhum ignorado.

Testes reais verificam claro/escuro, persistência após reload, valores e filtros preservados, menus no tema claro, nova requisição RSC ao atualizar, recorte intacto, remoção de todos os filtros e ausência de download pela ação indisponível. A captura desktop do tema claro foi inspecionada visualmente. Artefatos permanecem ignorados pelo Git.

A primeira execução unitária revelou ausência de ResizeObserver no jsdom, necessária para tooltips Radix; foi acrescentado substituto somente de ambiente, sem simular posicionamento. A validação real de layout/interações ocorre no Chromium. Não houve liberação adicional de scripts ou instalação de dependências.

## Limites e critérios pendentes

A exportação funcional continua na E08-T03 e não foi marcada como pronta. Nenhum arquivo CSV ou endpoint foi criado. Acessibilidade completa e responsividade detalhada ficam para E06-T05; os testes atuais não equivalem a auditoria WCAG ou teste de leitores de tela.

Dados continuam fictícios, sem autenticação Supabase ou banco real. Produção permanece bloqueada para páginas/demo e as APIs privadas continuam 401. Não houve publicação, alteração de regra de negócio ou dependência nova. CI remoto não executado.

O roteiro original docs/etapas/06-interface.md permanece ausente, portanto o backlog não foi marcado sem conferir os critérios formais. Próximo passo recomendado: E06-T05 — acessibilidade e responsividade da interface local.
