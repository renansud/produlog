# E10-T01 — Matriz de testes de métricas

Data: 2026-11-01. Escopo: domínio, aplicação, contratos e frontend local com dados sintéticos. Sem conexão a Supabase/PostgreSQL, importação ou deploy.

## Revisão

As regras documentadas foram confrontadas com as asserções existentes, não apenas com nomes de testes. Os valores de referência incluem junho 3/7 (42,86%), julho 3/8 (37,50%), evolução exata −75/14 p.p. (−5,36%), produção 1.500,00, média por linha 100,00 e oito técnicos. Supervisão B agrega 2/7 (28,57%), em vez da média simples das taxas mensais.

Os testes de produção preservam centavos exatos e valores além do inteiro seguro de Number; negativos, empate de arredondamento, vazio, cronologia e evolução sem arredondamento intermediário estão cobertos. A decisão anterior de razões exatas continua válida: nenhuma alteração do critério de cálculo.

## Matriz rastreável

Os caminhos abreviados abaixo referem-se a painel-produtividade/tests/unit/. “Coberto” significa somente o limite sintético indicado; não é aceite de produção.

| Caso | Evidência revisada | Resultado / limite |
| --- | --- | --- |
| RN-01 | productivity-metrics, chart-parity | Contagens e taxas mensais cobertas no domínio e handlers |
| RN-02 | productivity-metrics, chart-parity, summary-indicators | Diferença exata em p.p., sinal e formatação cobertos |
| RN-03 | productivity-metrics | Evolução positiva, neutra e taxa anterior zero cobertas |
| RN-04 | goal-domain, productivity-metrics, chart-parity | Meta deduplicada, produção de todas as linhas preservada |
| RN-05 | goal-domain, chart-parity | true prevalece; conflito propagado em qualidade; persistência pendente |
| RN-06 | productivity-filters, chart-parity | Mês afeta cards/supervisão, preserva mensal/evolução |
| RN-07 | productivity-filters, chart-parity | AND/OR, operações e descarte de supervisor incompatível cobertos |
| RN-08 | productivity-filters, dashboard-http | Escopo sintético bloqueado; sessão e predicado SQL pendentes da E10-T02/infraestrutura |
| RN-09 | goal-domain, productivity-fixtures, productivity-page, format-decimal | Normalização de meta e saída cobertas; parser de número pt-BR/importação ainda ausente |
| RN-10 | productivity-export, productivity-page, productivity-csv | Busca, ordem e todas as páginas cobertas; download também validado na E08-T05 |
| RN-11 | productivity-fixtures | Somente contrato da fixture; importação idempotente ainda ausente |
| RN-12 | goal-domain, productivity-metrics, chart-parity, summary-indicators | Indeterminados no denominador, cobertura/avisos cobertos; decisão de negócio antes do lançamento pendente |
| RN-13 | goal-domain, productivity-metrics, chart-parity | Anos separados e cronologia cobertos; atribuição de ano na importação pendente |
| RN-14 | productivity-csv, productivity-export | Proteção textual e produção negativa cobertas no arquivo; Excel/LibreOffice não executados |
| RN-15 | productivity-filters, productivity-export | Revogação sintética coberta; sessão e perfil persistido pendentes |
| RN-16 | productivity-metrics, summary-indicators, chart-parity | Vazio sem NaN/Infinity, média/evolução indisponíveis; mês sem linhas preserva histórico aplicável |
| RN-17 | productivity-metrics, chart-parity | Evolução indisponível com um único mês |
| RN-18 | goal-domain, productivity-fixtures | Meta desconhecida rejeitada; pipeline de importação/quarentena e ano explícito pendentes |
| RN-19 | goal-domain, summary-indicators | Identidades e múltiplos escopos sinalizados; confirmação da identidade e auditoria persistente pendentes |

## Novas verificações

Três testes acrescentados a chart-parity.test.ts percorrem os handlers reais de summary/monthly/supervisors com repositório sintético:

1. Inverter a ordem de todas as linhas preserva os três contratos, inclusive ordenação das séries.
2. Duplicar todas as linhas com novas chaves gera 30 registros e produção 3.000,00, mantendo oito técnicos, média 100,00, taxas mensais 42,86/37,50, supervisão 50/28,57 e evolução −5,36.
3. Pares de produção +0,10/−0,10 por registro resultam em total e média 0,00, preservando metas e evolução. Isso detecta acoplamento indevido entre valor de produção e alcance de meta.

Valores esperados são fixos; os testes não calculam os resultados esperados chamando funções de métricas do produto. A execução isolada dos 15 testes de chart-parity passou.

## Validação final

- npm run lint e npx tsc --noEmit: código 0.
- npm test: 289 testes aprovados em 19 arquivos, incluindo os três novos casos.
- npm run build: código 0, compilação e TypeScript aprovados.
- npm run test:http: 19 testes aprovados, sem falhas ou ignorados.
- npm run test:e2e -- e2e/chart-parity.spec.ts e2e/summary-contract.spec.ts e2e/monthly-performance.spec.ts e2e/supervisors-performance.spec.ts --trace off: 44 cenários aprovados, 22 desktop e 22 mobile Chromium, em 1,2 minuto. Sem falhas, testes ignorados ou retries locais.

Total desta seleção: 352 testes aprovados. Os 15 testes isolados iniciais pertencem à suíte unitária e não são somados novamente. A suíte integral de 136 cenários de navegador havia passado na E08-T05; nesta tarefa foi repetida somente a seleção de métricas, pois não houve alteração no produto. Não se declara uma nova execução integral dos 136 cenários.

Artefatos locais: painel-produtividade/playwright-report/index.html e painel-produtividade/test-results/, ignorados pelo Git e sobrescritos a cada execução. Avisos NO_COLOR/FORCE_COLOR do ambiente não causaram falhas. CI remoto não executado.

## Arquivos e pendências

Alterados: painel-produtividade/tests/unit/chart-parity.test.ts, painel-produtividade/README.md, docs/CHECKLIST_PARIDADE.md e este relatório. Nenhuma alteração de código do produto, dependências, métricas ou arquitetura; não há nova decisão de critério para DECISOES.md.

docs/etapas/10-qualidade.md permanece ausente. O backlog formal continua sem marcação. A comparação com o legado empresarial exige amostra autorizada e anonimizada, confirmação de identidade/metas e infraestrutura real. Não se declara release candidate ou prontidão para produção.

Próximo passo recomendado: E10-T02 — validar autorização e vazamento de dados no escopo local; testes reais de Supabase/SQL continuarão explicitamente pendentes.
