# E07-T02 — Performance Mensal Supervisão

Data: 2026-11-01. Escopo local, com dados fictícios, sem login/banco reais ou deploy.

## Entrega

- Segundo gráfico com colunas verticais #16a8e6, borda preta, percentuais com duas casas, escala 0–100; sem grade, linha temporal, legenda ou eixo percentual lateral.
- Reutiliza a agregação existente de Supervisor × Técnico × Mês. Aplica Mês, Operação e Supervisor. Ordena pelas taxas exatas, com desempate alfabético e ID para estabilidade.
- Caso de uso calcula os agregados após autorização/filtros. Contrato Zod compartilhado entre API e página preserva o DTO anterior e valida contagens, taxas, cobertura, identidades únicas e ordenação.
- Painel e tabela como RSC. Somente o gráfico interativo usa cliente, recebendo agregados e identificação de supervisores autorizados, sem linhas/identidades de técnicos.
- Período, unidade de contagem e ordenação explícitos. Tooltip por setas, tabela consultável, cobertura/indeterminados, ressalvas de conflito e estado vazio. Nomes longos abreviados somente no eixo; tooltip/tabela preservam o texto completo.
- Rolagem interna com foco e animações desativadas. Captura desktop no tema claro inspecionada visualmente.

## Arquivos

Em painel-produtividade: app/page.tsx; modules/productivity/application/read-productivity-dashboard.ts e dashboard-supervisors-contract.ts; modules/productivity/presentation/dashboard-http.ts, local-preview.tsx e supervisors-performance-panel.tsx; components/dashboard/supervisors-chart.tsx; tests/unit/supervisors-performance.test.tsx; e2e/supervisors-performance.spec.ts; README.md e modules/productivity/README.md. Também docs/DECISOES.md, docs/CHECKLIST_PARIDADE.md e este relatório.

## Validação

Execuções isoladas: TypeScript aprovado; 16 novos testes unitários passaram e 12 novos testes de navegador passaram em desktop/mobile. Verificam contrato, ordenação exata/alfabética, contagens, avisos/estado vazio, comparação SVG/tabela/API em cinco recortes e tooltip por teclado/tema. O recorte de mês sem registros esvazia supervisão e preserva os dois meses no gráfico mensal.

Pipeline completo `npm run check`: concluído com código 0.

- Lint: aprovado, sem erros ou avisos de lint.
- TypeScript (`tsc --noEmit`): aprovado.
- Vitest: 190 testes passaram em 12 arquivos.
- Build: compilação, TypeScript e geração de páginas concluídos.
- HTTP de produção: 14 testes passaram, incluindo demo indisponível e APIs privadas 401.
- Playwright: 76 testes passaram em desktop/mobile, em 2,9 minutos.

Total: 280 testes passaram, nenhum ignorado. Os avisos de ambiente NO_COLOR/FORCE_COLOR não causaram falhas. O servidor local existente foi reutilizado e o runner encerrou normalmente, sem repetir a espera de teardown observada na revisão anterior. CI remoto não executado. Artefatos visuais em test-results ficam ignorados pelo Git.

## Limites

Não houve mudança de regra de negócio, nova dependência, Supabase/Vercel, dados empresariais ou publicação. Testes Chromium não substituem auditoria com leitores de tela/outros motores. A matriz abrangente de temas/responsividade/tooltips e a paridade conjunta permanecem nas E07-T03/T04. Detalhamento/CSV seguem na E08.

docs/etapas/07-graficos.md continua ausente; o aceite formal do BACKLOG.md não foi marcado. Próximo passo recomendado: E07-T03.
