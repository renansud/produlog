# E08-T05 — E2E do MVP local

Data: 2026-11-01. Validação da demonstração local com dados fictícios, sem login real, banco empresarial ou deploy.

## Escopo e reprodução

Execução integral da suíte existente, sem selecionar apenas os arquivos alterados na tarefa anterior. Nenhuma regra de negócio foi modificada. Testes adicionais são necessários apenas se a execução revelar lacunas ou defeitos; não se duplicam cenários já cobertos.

Na pasta painel-produtividade, com Node disponível no PATH:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd test
npm.cmd run build
npm.cmd run test:http
npm.cmd run test:e2e -- --trace off
```

Os comandos foram executados sequencialmente, interrompendo a sequência em caso de erro. Playwright usa um worker, sem retries locais, com Desktop Chrome e Pixel 7 em Chromium. O servidor de desenvolvimento é reutilizado em http://127.0.0.1:3000. Os testes HTTP iniciam o build de produção separadamente. Traces desativados nesta execução; screenshots e relatório HTML continuam habilitados. Não foram instaladas dependências nem navegadores adicionais.

## Matriz de cobertura

| Fluxo | Evidência automatizada |
| --- | --- |
| Shell, logo, navegação e galeria | dashboard-shell e local-demo |
| Escuro inicial, tema persistido, atualizar e limpar | dashboard-actions |
| Multisseleção, pesquisa de opções, dependência de operação/supervisor | dashboard-filters |
| Cards iguais à API, estados vazios e recortes | summary-contract |
| Série mensal ignora apenas Mês; evolução em pontos percentuais | monthly-performance, chart-parity e summary-contract |
| Supervisão agrega técnico-mês, respeita filtros e ordem | supervisors-performance e chart-parity |
| Cores, proporções, rótulos, tooltips por mouse/teclado e temas | chart-consistency e chart-parity |
| Teclado, foco, contraste de tokens e reflow de 320/768/1280 px com texto ampliado | dashboard-accessibility e chart-consistency |
| Seis colunas, formatação, pesquisa, ordenação, paginação e erros | productivity-details e productivity-page-api |
| Estado compartilhado, Voltar/recarregar, saneamento de supervisor e rascunhos | dashboard-state e productivity-details |
| Download CSV completo com filtros/pesquisa/ordem e erros sem arquivo inválido | productivity-export |
| Validação de parâmetros/origem e APIs privadas fechadas | dashboard-api, productivity-page-api e testes HTTP de produção |

A cobertura visual usa verificações de geometria, estilos e texto; screenshots são evidência local, sem aprovação humana de um baseline por comparação de pixels. A verificação de contraste de tokens e teclado não equivale a certificação integral de acessibilidade ou teste com leitor de tela.

## Resultados

- npm run lint: código 0, sem erros ou avisos de lint.
- npx tsc --noEmit: código 0.
- npm test: 286 testes aprovados em 19 arquivos.
- npm run build: código 0; compilação e verificação TypeScript aprovadas.
- npm run test:http: 19 testes aprovados, sem falhas ou ignorados. APIs privadas retornam 401; demonstração e /dashboard permanecem indisponíveis em produção.
- npm run test:e2e -- --trace off: 136 testes aprovados em 15 arquivos, 68 por projeto, em 4,3 minutos. Nenhuma falha, repetição ou teste ignorado.

Total: 441 testes aprovados. A sequência completa terminou com código 0. Não foi necessário corrigir código ou alterar testes. A captura details-dark.png da tabela desktop também foi inspecionada visualmente: seis colunas, valores pt-BR, zeros de contrato e paginação íntegros. Os demais screenshots foram gerados pelos testes; não se declara revisão manual de todos eles.

Artefatos locais: painel-produtividade/playwright-report/index.html (relatório HTML) e painel-produtividade/test-results/ (capturas). Esses diretórios são ignorados pelo Git e serão sobrescritos em execuções futuras. O relatório pode ser aberto com npx playwright show-report. Não houve execução em CI remoto. O aviso NO_COLOR/FORCE_COLOR do ambiente não causou falhas.

Arquivos de documentação alterados: este relatório, docs/CHECKLIST_PARIDADE.md e painel-produtividade/README.md. Nenhuma decisão de arquitetura ou critério de negócio foi alterado; não houve necessidade de novo registro em DECISOES.md.

## Limites e aceite

A execução testa a aplicação real com adaptadores sintéticos. Não comprova login/logout/reset Supabase, sessão expirada real, RBAC em SQL, importação de planilha, snapshot de banco, concorrência empresarial, desempenho com volume real ou recuperação de produção. Os testes de acesso do domínio usam provedores sintéticos; os endpoints privados permanecem fechados sem autenticação configurada. CSV é conferido em bytes; Excel/LibreOffice não foram executados.

O arquivo original docs/etapas/08-detalhamento.md permanece ausente. BACKLOG.md será mantido sem marcação formal; o resultado da demonstração local não equivale à conclusão do MVP de produção descrito no roadmap.

Próximo passo recomendado: E10-T01 — executar/revisar a matriz de testes de métricas no escopo local. A integração Sheets (E09) é opcional e não será iniciada automaticamente. Autenticação, banco e publicação exigem uma etapa posterior com escopo próprio.
