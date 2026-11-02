# E07-T01 — Performance Mensal

Implementação: 2026-10-31. Revisão e validação final: 2026-11-01. Escopo local com dados fictícios, sem login real, banco ou deploy.

## Entrega

- Gráfico composto Recharts: colunas #16a8e6 com borda preta, percentuais de duas casas no topo e linha linear ligando meses reais. Sem grade, eixo percentual lateral ou legenda; escala fixa 0–100.
- Série já calculada no domínio, respeitando Operação/Supervisor e ignorando somente Mês. Meses/anos cronológicos, sem preencher lacunas ou calcular regressão.
- Contrato mensal Zod compartilhado por API/página, preservando o formato anterior e validando coerência de taxas, razão, contagens e cobertura. Não altera critérios de cálculo.
- Painel e tabela acessível como RSC; apenas renderização interativa do gráfico usa cliente, recebendo agregados sem identidades ou linhas de origem.
- Tooltip por mouse/setas, cores por tema, animações desativadas e regiões com rolagem interna/foco. Tabela consultável mostra técnicos, metas batidas, indeterminadas, taxa e cobertura.
- Estado vazio e ressalvas de metas indeterminadas/conflitantes. Denominador documentado e preservado.

## Arquivos

Em painel-produtividade: app/page.tsx; modules/productivity/application/dashboard-monthly-contract.ts; modules/productivity/presentation/dashboard-http.ts, local-preview.tsx e monthly-performance-panel.tsx; components/dashboard/monthly-chart.tsx; tests/unit/monthly-performance.test.tsx; e2e/monthly-performance.spec.ts; README.md e modules/productivity/README.md. Também docs/DECISOES.md, docs/CHECKLIST_PARIDADE.md e este relatório.

## Evidências

14 testes unitários novos verificam projeção segura, precisão final, rejeição de inconsistências, ordem/duplicidade de competências, resumo textual, referências entre anos, histórico vazio e indeterminados/cobertura zero. 10 testes novos de navegador comparam SVG/tabela com API em quatro recortes e verificam tooltip por teclado/tema em desktop e mobile. Execuções isoladas passaram. Captura desktop no tema claro inspecionada visualmente; artefatos em test-results são ignorados pelo Git.

Na revisão de 2026-11-01, foram conferidos contrato, projeção API/RSC, cálculo no domínio, estados de apresentação e testes existentes. Não foram identificadas divergências que exigissem mudança adicional de código. O último resultado salvo do Playwright indicava aprovação, mas a sessão original do pipeline já não estava disponível; o pipeline completo foi iniciado novamente para registrar sua conclusão.

Pipeline de revisão `npm run check`, executado em 2026-11-01: concluído com código 0.

- `npm run lint`: aprovado, sem erros ou avisos de lint.
- `npm run typecheck` (`tsc --noEmit`): aprovado.
- `npm test`: 174 testes passaram em 11 arquivos.
- `npm run build`: compilação, TypeScript e geração de páginas concluídos.
- `npm run test:http`: 14 testes passaram, incluindo bloqueio da demo e APIs privadas em produção.
- `npm run test:e2e`: 64 testes passaram em desktop/mobile.

Total: 252 testes passaram, nenhum ignorado. Avisos de ambiente NO_COLOR/FORCE_COLOR não impediram a execução. CI remoto não foi executado. Escopo local concluído e revisado; aceite formal do backlog permanece pendente pelo roteiro ausente.

Após o último cenário aprovado, o processo ficou aguardando o encerramento do servidor de desenvolvimento iniciado pelo Playwright no Windows. Foi necessário encerrar somente os processos identificados desse servidor; em seguida o runner emitiu `64 passed (7.4m)` e retornou código 0. Não houve interrupção de testes ou alteração de configuração para ocultar falhas. A finalização automática do servidor permanece uma limitação operacional a investigar se voltar a ocorrer.

## Limites

Não foram implementados gráfico de supervisão, tabela detalhada real, exportação ou integração Supabase. A matriz completa de paridade/temas/tooltips entre gráficos pertence às E07-T03/T04. Os testes Chromium não substituem leitores de tela ou outros motores. Sem novas dependências ou publicação.

O roteiro original docs/etapas/07-graficos.md não está disponível; BACKLOG.md permanece sem marcação até conferir os critérios formais. Próximo passo recomendado: E07-T02 — Performance Mensal Supervisão local.
