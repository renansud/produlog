# E07-T04 — Paridade matemática e visual

Data: 2026-11-01. Validação local com dados sintéticos e regras documentadas.

## Entrega

Oráculo fixo independente do cálculo do produto e da API para sete recortes:

| Recorte | Mensal jun/jul | Supervisão A/B | Evolução | Produção |
| --- | --- | --- | --- | --- |
| Todos | 42,86% / 37,50% | 50,00% / 28,57% | −5,36 p.p. | 1.500,00 |
| Junho | 42,86% / 37,50% | 50,00% / 33,33% | −5,36 p.p. | 700,00 |
| Julho | 42,86% / 37,50% | 50,00% / 25,00% | −5,36 p.p. | 800,00 |
| Operação A | 50,00% / 50,00% | A: 50,00% | 0,00 p.p. | 800,00 |
| Operação B | 33,33% / 25,00% | B: 28,57% | −8,33 p.p. | 700,00 |
| Julho + operação/equipe B | 33,33% / 25,00% | B: 25,00% | −8,33 p.p. | 400,00 |
| Mês inexistente | 42,86% / 37,50% | vazio | −5,36 p.p. | 0,00 |

Doze novos testes de integração atravessam os handlers e conferem também duplicidade positiva, conflito com aviso preservado, indeterminados no denominador/cobertura zero, competências de anos distintos e evolução exata de 16,67 para 33,33 exibindo diferença 16,67 p.p. Supervisão ponderada nesse último exemplo: 2/9 = 22,22%, sem média simples mensal.

Quatorze novos testes de navegador conferem API e interface contra os valores fixos, temas claro/escuro, rótulos acima das colunas, azul #16a8e6/borda preta, proporção das alturas, linha apenas no mensal e ausência de grades/eixo lateral/legenda. Conferem nomes/ordem na tabela de supervisão e o card Evolução. Capturas dos dois gráficos são geradas para o conjunto completo em cada tema/projeto.

Capturas desktop do mensal escuro e da supervisão clara foram inspecionadas visualmente, com percentuais/nomes e elementos correspondentes à especificação documentada. Não são comparação com uma imagem original do legado.

## Arquivos

Em painel-produtividade: tests/fixtures/chart-parity.ts; tests/unit/chart-parity.test.ts; e2e/chart-parity.spec.ts; README.md. Documentação: docs/DECISOES.md, docs/CHECKLIST_PARIDADE.md e este relatório. Nenhum arquivo do produto ou dependência foi alterado.

## Validação

Execução isolada dos novos testes de integração: 12 passaram. O primeiro teste visual media caixas de grupos SVG durante o layout; passou a medir apenas as formas numa mesma leitura, aguardando estabilização, sem ampliar a tolerância. O caso corrigido passou isoladamente.

A execução `npm run check` aprovou lint, TypeScript, 202 testes Vitest em 13 arquivos, build e 14 testes HTTP de produção. A etapa E2E terminou com 95 aprovados e 9 falhas em 104 cenários. Os 14 novos cenários de paridade passaram nessa execução. Uma falha foi ENOENT por colisão de trace ao sobrepor duas instâncias Playwright; oito foram timeouts em testes existentes de acessibilidade, tema, limpeza e navegação. A causa de todos os timeouts não foi estabelecida, portanto não foram classificados como defeitos resolvidos do produto.

Após o ajuste do teste visual, lint e TypeScript foram repetidos e passaram. A repetição isolada `npm run test:e2e -- --last-failed --trace off` executou os nove cenários afetados: 9 passaram, código 0, em 1,6 minuto. Foram mantidas as mesmas asserções e limites de tempo; somente a gravação de trace foi desativada nessa repetição para reduzir seu custo. Nenhuma instância Playwright concorrente estava em execução.

Resultado consolidado: 320 testes distintos aprovados (202 Vitest + 14 HTTP + 104 E2E), considerando a repetição dos nove cenários. Não houve uma execução completa E2E limpa nesta interação; a instabilidade da execução longa permanece risco operacional registrado. Não se declara `npm run check` integralmente aprovado em uma única execução. CI remoto não executado.

## Limites

Paridade local com regras e fixtures, não validação contra origem empresarial real. Sem amostra anonimizada autorizada ou imagens de referência do legado, não se declara igualdade com dados reais ou comparação pixel a pixel. As capturas não são baselines visuais aprovadas. Testes Chromium não cobrem todos os motores, leitores de tela, integração de banco ou persistência de logs. Artefatos em test-results são ignorados pelo Git.

O roteiro docs/etapas/07-graficos.md permanece ausente; o checklist formal do backlog não foi marcado. Sem novas regras, dados reais, autenticação, banco ou deploy. Próximo passo recomendado: E08-T01 — API paginada do detalhamento no ambiente local.
