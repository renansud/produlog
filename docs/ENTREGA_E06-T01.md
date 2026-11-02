# E06-T01 — Shell do dashboard local

Data: 2026-10-31. Escopo de demonstração local concluído e validado.

## Entrega

- Shell compartilhado com marca, título/subtítulo, aviso de ambiente local, navegação com aria-current, link de salto e rodapé.
- Dashboard na raiz com dados sintéticos carregados pelo caso de uso diretamente no servidor, sem roundtrip HTTP interno.
- Quatro indicadores: 8 técnicos, −5,36% de evolução (descrita em p.p.), média 100,00 por registro e total 1.500,00. Meses e taxas comparadas ficam visíveis.
- Cards puros reutilizáveis, formatação pt-BR sem float financeiro e direção da evolução com sinal/cor/ícone.
- Áreas reservadas explícitas para Performance Mensal, Performance Mensal Supervisão e detalhamento. Sem controles que aparentem implementar filtros ou exportação ainda ausentes.
- Galeria de componentes separada em `/componentes`, mantendo as interações já testadas.
- Raiz e galeria continuam 404 em produção; não foi criada rota `/dashboard` anônima. As APIs privadas continuam fechadas sem autenticação real.

## Arquivos

Em `painel-produtividade/`: `app/page.tsx`, `app/componentes/page.tsx`, `components/dashboard/dashboard-shell.tsx`, `components/dashboard/kpi-card.tsx`, `modules/productivity/presentation/local-preview.tsx`, `modules/productivity/presentation/format-decimal.ts`, `modules/productivity/infrastructure/demo-dashboard.ts`, `tests/unit/format-decimal.test.ts`, `tests/integration/production.test.mjs`, `e2e/dashboard-shell.spec.ts`, `e2e/local-demo.spec.ts`, `modules/productivity/README.md` e `README.md`. Decisão em `docs/DECISOES.md`.

## Validação

Pipeline final `npm run check`: código 0.

- Lint e TypeScript: sem erros ou avisos.
- Vitest: 136 testes passaram, incluindo seis novos casos de formatação decimal.
- Build: compilação, TypeScript e geração de páginas concluídos.
- HTTP de produção: 14 testes passaram, incluindo o bloqueio de `/componentes`.
- Playwright/API: 14 testes passaram nos perfis desktop/mobile, incluindo cards, navegação e ausência de transbordamento horizontal.
- Total: 164 testes passaram, nenhum ignorado.

Capturas `dashboard.png` em test-results foram inspecionadas em desktop e mobile. A tabela reservada possui rolagem horizontal própria; não amplia a largura da página. Artefatos de teste permanecem ignorados pelo Git. O ajuste final de ícone da evolução foi seguido por nova execução completa do pipeline.

## Critérios e pendências

O escopo entregue é o shell local em Server Components com demonstração fictícia, conforme a orientação de adiar login real. A proteção por sessão e o layout autenticado de produção dependem da Etapa 02 e não são simulados por este shell. A E06-T03 de conexão dos cards aos endpoints privados também não foi marcada como executada.

Filtros interativos, gráficos, tabela funcional, exportação, refresh, alternância de tema e testes completos de acessibilidade continuam nas tarefas correspondentes. Nenhuma dependência nova, dado empresarial ou publicação. CI remoto não executado.

O roteiro original `docs/etapas/06-interface.md` permanece ausente; o backlog continua sem marcação até conferir os critérios formais e as dependências de produção. Próximo passo local recomendado: E06-T02 — filtros multisseleção e dependência supervisor/operação.
