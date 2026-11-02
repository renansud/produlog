# E08-T02 — Tabela do detalhamento

Data: 2026-11-01. Demonstração local com dados fictícios.

## Entrega

- Tabela shadcn com as seis colunas previstas, valores pt-BR, zeros de contrato preservados e meta Sim/Não/—.
- Linhas lidas/renderizadas em RSC pelo caso de uso paginado, sem HTTP interno e sem ordenar/filtrar linhas no browser. Apenas a página solicitada atravessa a apresentação.
- Botões de cabeçalho com teclado, ícone e aria-sort. Pesquisa de até 120 caracteres, limpar pesquisa, contagem/tamanho de página e primeira/anterior/próxima/última.
- URL reproduzível, Voltar/recarregar e retorno à primeira página ao mudar busca/ordem/tamanho. Mudar filtros globais redefine o detalhamento. Pesquisa da tabela não altera cards/gráficos.
- Transição com skeleton, aria-busy/status e bloqueio de ações duplicadas; vazio, página excedida e erros próprios com recuperação. Falha/parâmetro exclusivo inválido da tabela não esconde os cards.
- Scroll horizontal nomeado e focável, tema claro/escuro. Componente Table puro sem diretiva cliente desnecessária.

## Arquivos

Em painel-produtividade: app/page.tsx; components/ui/table.tsx; modules/productivity/domain/productivity-page.ts; application/read-productivity-page.ts; presentation/local-preview.tsx, productivity-details.tsx e productivity-details-controls.tsx; tests/unit/productivity-details.test.tsx; e2e/productivity-details.spec.ts; README.md e modules/productivity/README.md. Também CONTRATOS_API.md, docs/DECISOES.md, docs/CHECKLIST_PARIDADE.md e este relatório.

## Validação

Nove novos testes unitários passaram. O ensaio inicial identificou diferença entre jsdom e Chromium no nome acessível do cabeçalho com botão; os seletores de navegador passaram a localizar o th pelo botão descendente, mantendo a checagem de aria-sort, sem mudar a semântica para adaptar o produto ao teste.

No primeiro ensaio de navegador, pesquisa/paginação, filtros, erro/página excedida e skeleton/tema passaram em desktop/mobile. As verificações dos seletores de cabeçalho foram corrigidas antes da execução final. Captura desktop da tabela no tema claro inspecionada visualmente.

Primeira validação após correção dos seletores: lint/TypeScript aprovados, 246 testes Vitest, build, 17 testes HTTP de produção e 72 cenários de navegador passaram, código 0.

A conferência adicional a 320 px/fonte 200% identificou corte de controle dentro do painel: Limpar pesquisa ultrapassava a borda (316,59 px contra limite 288 px), apesar da largura da página estar correta. Foram ajustadas quebra de texto/largura dos botões e navegação do rodapé, preservando a rolagem das colunas. Os dois novos cenários de reflow dos controles passaram em desktop/mobile. Controles indisponíveis também têm indicação visual de opacidade.

Validação final após o ajuste visual: concluída com código 0.

- Lint e TypeScript (`tsc --noEmit`): aprovados, sem avisos.
- Vitest: 246 testes passaram em 15 arquivos.
- Build: compilação, TypeScript e geração de páginas concluídos.
- HTTP de produção: 17 testes passaram, mantendo o bloqueio de raiz/demo e APIs privadas.
- Navegador: os 72 cenários da seleção inicial passaram; após acrescentar dois cenários de controles a 320 px/fonte 200%, os 32 cenários de tabela/acessibilidade passaram novamente em desktop/mobile. Execuções com `--trace off`, sem instâncias Playwright concorrentes.

Consolidado da seleção desta tarefa: 337 testes distintos aprovados (246 Vitest + 17 HTTP + 74 navegador), nenhum ignorado. Não é uma execução de toda a suíte visual do projeto; os gráficos não modificados conservaram sua cobertura anterior. Avisos de ambiente NO_COLOR/FORCE_COLOR não causaram falhas. Capturas desktop clara e 320 px/fonte 200% escura foram inspecionadas visualmente; o corte dos controles foi corrigido e permanece coberto por regressão.

## Limites

Não houve CSV, autenticação/banco reais, novas dependências ou deploy. Raiz/demo continuam fechadas em produção. A API conserva padrão de 50 linhas; a UI inicia com 10. A política de estado da tabela implementada aqui é necessária à navegação; a revisão/unificação mais ampla permanece na E08-T04. Não há comparação com origem empresarial ou validação de repositório SQL real. Artefatos em test-results são ignorados pelo Git; CI remoto não executado.

docs/etapas/08-detalhamento.md continua ausente; o aceite formal do backlog não foi marcado. Próximo passo recomendado: E08-T03 — CSV seguro, respeitando filtros, pesquisa, ordenação e todas as páginas.
