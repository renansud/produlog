# E07-T03 — Tema, responsividade e tooltips

Data: 2026-11-01. Demonstração local com dados fictícios.

## Alterações

O teste inicial reproduziu corte de tooltip em 320 px: limite direito a 325 px. Os dois gráficos passaram a compartilhar PerformanceChartFrame/PerformanceChartTooltip. A região do SVG mantém rolagem própria; os detalhes usam portal Recharts numa área abaixo do gráfico, dentro da largura do painel. A área reserva altura mínima e expande para fonte ampliada. Conteúdo e cores são compartilhados, preservando unidades de cada gráfico e nomes completos com quebra de palavras longas.

Teclado/setas e mouse exibem os detalhes; Escape dispensa e mudar a referência pelas setas reabre. A área tem anúncio polite e os painéis conservam tabelas textuais alternativas. Animações continuam desativadas. Nenhum cálculo, filtro, DTO ou critério de negócio foi modificado.

## Arquivos

Em painel-produtividade: components/dashboard/performance-chart-frame.tsx, monthly-chart.tsx e supervisors-chart.tsx; e2e/chart-consistency.spec.ts; README.md; modules/productivity/README.md. Documentação: docs/DECISOES.md, docs/CHECKLIST_PARIDADE.md e este relatório.

## Validação

14 novos testes Playwright passaram na execução isolada, nos projetos desktop/mobile. Cada cenário de matriz verifica ambos os gráficos, temas claro/escuro, larguras 320/768/1280 px e fonte a 100/200%. Verifica limites horizontais dos detalhes, tokens de texto/fundo resolvidos, Escape/foco/reabertura, palavra sintética longa, rótulos preservados, ausência de transbordamento da página e erros de execução. Cenários de mouse verificam consulta e alternância de tema sem alterar rótulos.

O primeiro teste de mouse revelou leitura dos rótulos antes do layout inicial; foi corrigido para aguardar as duas etiquetas SVG antes de compará-las. O corte original foi corrigido no produto e permanece coberto por regressão.

Captura do painel de supervisão em tema escuro, 320 px e fonte a 200% inspecionada visualmente: o desenho mantém rolagem própria e o texto completo dos detalhes fica abaixo, dentro do painel, com quebra de linhas.

Pipeline completo `npm run check`: concluído com código 0.

- Lint e TypeScript (`tsc --noEmit`): aprovados.
- Vitest: 190 testes passaram em 12 arquivos.
- Build: compilação, TypeScript e geração de páginas concluídos.
- HTTP de produção: 14 testes passaram, preservando o bloqueio de demo e APIs privadas.
- Playwright: 90 testes passaram em desktop/mobile, em 4 minutos.

Total: 294 testes passaram, nenhum ignorado. Avisos de ambiente NO_COLOR/FORCE_COLOR não causaram falhas. O runner encerrou normalmente reutilizando o servidor local.

## Limites

Fonte raiz a 200% não equivale a zoom nativo. A matriz Chromium não substitui leitores de tela, outros motores ou auditoria WCAG completa. O ensaio com nomes longos altera somente o texto sintético no DOM para medir quebra, sem testar importação/consulta de nomes empresariais. Artefatos em test-results são ignorados pelo Git. Não houve instalação, dados reais, Supabase/Vercel ou deploy. CI remoto não executado.

docs/etapas/07-graficos.md não está disponível; o backlog formal permanece sem marcação. Próximo passo recomendado: E07-T04 — paridade matemática e visual dos gráficos.
