# E00-T04 — Fixtures e checklist de paridade

## Rotas de login e dashboards — E02-T03 (2026-11-01)

Login inicial /, /admin/dashboard e /user/dashboard protegidos; demo migrada para /demo somente em desenvolvimento. Suíte integral: 144 cenários E2E aprovados, 388 unitários e 26 HTTP de produção; lint/TypeScript/build aprovados. Guard de sessão/perfil, identidade divergente, papel cruzado e user_metadata não autoritativa cobertos com dependências sintéticas. Sem login ou perfil real provisionado durante testes. [Relatório, contrato transitório e limites](ENTREGA_E02-T03.md).

## Preparação de release — E10-T05 (2026-11-01)

[Checklist de release e migração](CHECKLIST_RELEASE_MIGRACAO.md) preparado com evidências locais, dependências abertas, ensaio/reconciliação, backup/restauração, critérios de interrupção e registro de aceite. Nenhuma publicação ou migração executada. Ver [relatório E10-T05](ENTREGA_E10-T05.md). Os aceites reais continuam pendentes; os relatórios locais não liberam produção.

## Performance e responsividade locais — E10-T04 (2026-11-01)

Método, resultados e limites em [ENTREGA_E10-T04.md](ENTREGA_E10-T04.md). Novo teste registra três navegações/pesquisas e cinco chamadas por endpoint, em desktop/mobile Chromium; revalidações de responsividade abrangem temas, 320/768/1280 px, texto ampliado, tooltips e detalhamento. Validação: 348 unitários, 20 HTTP e 48 cenários de navegador aprovados; lint, TypeScript e build aprovados. Medianas locais de UI pronta: desktop 608 ms/mobile emulado 597 ms; pesquisa: 228/212 ms. Medições da demo com 15 linhas em desenvolvimento não são SLA nem evidência de escalabilidade SQL.

## Revisão de upload e CSV — E10-T03 (2026-11-01)

Evidências e limites em [ENTREGA_E10-T03.md](ENTREGA_E10-T03.md): matriz de 112 prefixos/operadores de fórmula, fronteira de 5 MiB após UTF-8/escape e cancelamento entre lotes. RN-10/RN-14 ampliados no limite sintético. Upload ainda não existe; teste HTTP verifica GET 404 e POST multipart rejeitado com 409 pelo Next.js na rota prevista de importação, sem declarar validação de parser ou ingestão. Validação: 348 unitários, 20 HTTP e seis cenários CSV de navegador aprovados; lint, TypeScript e build com código 0.

## Autorização local — E10-T02 (2026-11-01)

Matriz comum de 54 testes dos seis handlers em [ENTREGA_E10-T02.md](ENTREGA_E10-T02.md): sessão ausente, perfil/papel inválidos, operação adulterada, três papéis com escopo limitado, retorno indevido de adaptador, erros sanitizados e cache privado. Validação: 343 unitários, 19 HTTP e 24 cenários de navegador aprovados; lint, TypeScript e build com código 0. RN-08/RN-15 têm evidência sintética; Supabase, revogação persistida e isolamento SQL/RLS continuam pendentes.

## Revisão da matriz de métricas — E10-T01 (2026-11-01)

Rastreabilidade atual por RN-01 a RN-19 em [ENTREGA_E10-T01.md](ENTREGA_E10-T01.md). A revisão separa regras comprovadas com adaptadores sintéticos de pendências de importação, identidade, sessão e SQL reais. Três novos testes nos handlers verificam invariância à ordem das linhas, duplicação integral sem duplicar metas e cancelamento decimal sem alterar metas. Validação: 289 unitários, 19 HTTP e 44 cenários de métricas no navegador aprovados; lint, TypeScript e build com código 0. As anotações históricas abaixo não representam o estado atual de todas as camadas.

## Execução completa do frontend local — E08-T05 (2026-11-01)

Suíte integral aprovada: 136 cenários Playwright (68 desktop + 68 mobile Chromium), 286 unitários e 19 HTTP de produção; lint, TypeScript e build com código 0. Inclui a paridade dos gráficos, cards/API, filtros, histórico, detalhamento e CSV após a unificação de estado. Nenhum teste ignorado, retry local ou correção de produto. Matriz e limites em [ENTREGA_E08-T05.md](ENTREGA_E08-T05.md). Essa evidência sintética não conclui os aceites de autenticação, importação, SQL ou comparação com dados empresariais. As ressalvas históricas abaixo descrevem o estado na data de cada entrega.

Todos os dados são fictícios. O ano 2026 é uma referência de teste, não uma atribuição de ano à base real. Rótulos TEC-01 etc. não identificam colaboradores. Arquivos em `painel-produtividade/tests/fixtures/`; não são dados públicos nem seeds de produção.

## Oráculo de referência

E07-T04: `tests/fixtures/chart-parity.ts` fixa os valores esperados de sete recortes para a conferência conjunta. `tests/unit/chart-parity.test.ts` atravessa os handlers reais com dependências sintéticas, cobrindo RN-01/RN-02/RN-03, RN-04/RN-05, RN-06/RN-07, RN-12/RN-13 e RN-17 nesse limite. `e2e/chart-parity.spec.ts` verifica os números fixos e a geometria/cores dos dois gráficos nos dois temas em desktop/mobile. RN-16 tem estado vazio de supervisão com histórico mensal preservado ao selecionar mês inexistente. Cobertura complementar já descrita nas E07-T01/T02/T03 permanece válida. Isso não conclui os aceites de importação, autenticação, banco, CSV ou comparação com origem empresarial.

`baseline` tem 15 linhas, 8 técnicos distintos, produção de 100,00 por linha, total 1.500,00 e média por linha 100,00. Junho: 7 técnicos e 3 metas (300/7% → 42,86%); julho: 8 técnicos e 3 metas (37,50%). Evolução exata: −75/14 p.p., exibida como −5,36%. Não subtrair os percentuais previamente arredondados.

Operação/Equipe A: 4 técnicos por mês, 2 metas, taxa 50,00% em ambos. Operação/Equipe B: junho 1/3 (33,33%), julho 1/4 (25,00%), evolução −8,33 p.p. Supervisão no conjunto completo: A = 4/8 (50,00%); B = 2/7 (28,57%). Não calcular média simples das taxas mensais.

`duplicateTrue`: 8 linhas em junho, 7 técnicos, 3 metas; produção 725,50, média por linha 90,69. `conflictingGoals`: 8 linhas, 7 técnicos, 3 metas; produção 710,25, média 88,78; conflito true/false deve permanecer no relatório de qualidade. Preservar todas as linhas de produção.

## Matriz para execução nas tarefas de implementação

A tabela abaixo cataloga os critérios originais. O estado atual e as camadas verificadas estão na matriz E10-T01 acima; as atualizações por entrega preservam o histórico. Os aceites dependentes da origem empresarial e da infraestrutura real continuam pendentes.

Atualização E05-T01: `tests/unit/goal-domain.test.ts` agora executa o domínio real para normalização e deduplicação. RN-04 e a precedência de RN-05 têm evidência unitária; contagens de RN-01, ausência de metas em RN-12, separação de RN-13 e alertas de RN-19 também estão cobertos nessa camada. Percentuais, evolução, persistência dos avisos, filtros e apresentação permanecem pendentes. A matriz abaixo continua sendo checklist de aceite completo, não é marcada como concluída só por um teste parcial de domínio.

Atualização E05-T02: `tests/unit/productivity-metrics.test.ts` valida taxas e evolução reais do domínio para RN-01/RN-02/RN-03, além de produção/média por linha, cobertura de RN-12, cronologia RN-13 e estados RN-16/RN-17. Inclui um caso em que subtrair taxas exibidas daria resultado incorreto (16,66 em vez de 16,67 p.p.). Filtros, RBAC, endpoints, persistência, formatação pt-BR e componentes de métricas ainda não foram integrados; os aceites completos continuam pendentes.

Atualização E05-T03: `tests/unit/productivity-filters.test.ts` verifica RN-06/RN-07 na seleção pura e composição das métricas, e RN-08/RN-15 no caso de uso com provedor de acesso e repositório sintéticos. Nenhum teste comprova sessão Supabase, predicado SQL/Prisma ou proteção de endpoint real, ainda ausentes. Escopo vazio não consulta dados; operação não autorizada ou perfil revogado bloqueiam a leitura; as opções também são restritas ao conjunto autorizado.

Atualização E05-T04: testes de handler, HTTP de produção e API de desenvolvimento verificam os quatro contratos de leitura. Supervisão agrega 4/8 e 2/7 no conjunto completo, ou 2/4 e 1/4 em julho. Endpoints privados retornam 401 sem provedor real; demo responde apenas localmente em desenvolvimento e retorna 404 em produção. Esses testes não comprovam autenticação Supabase ou escopo SQL; a apresentação dos indicadores ainda não foi conectada.

Atualização E06-T02: `e2e/dashboard-filters.spec.ts` verifica a UI real de multisseleção, pesquisa, dependência supervisor/operação, atualização dos cards, persistência por URL, Voltar e saneamento de links. RN-06/RN-07 têm evidência na demonstração: julho totaliza 800,00 sem alterar −5,36 p.p.; operação B totaliza 700,00 e −8,33 p.p. O gráfico mensal e o detalhamento permanecem reservados; não há evidência de autenticação ou banco real.

Atualização E06-T03: `e2e/summary-contract.spec.ts` compara os quatro cards com o endpoint summary para o conjunto completo, julho, operação B e mês sem registros, em desktop/mobile. O contrato Zod é compartilhado. Os testes de apresentação também cobrem recorte vazio com evolução preservada, histórico insuficiente, ressalvas de metas nulas/conflitantes e falha de leitura sem valores. Isso não comprova sessão ou repositório reais.

Atualização E06-T04: `e2e/dashboard-actions.spec.ts` verifica escuro inicial, claro persistido, filtros/valores preservados, refresh com requisição RSC e limpeza completa em desktop/mobile. O botão de CSV é semanticamente indisponível e não dispara download; RN-10/RN-14 permanecem pendentes da implementação real da exportação.

| Caso | Fixture/entrada | Aceite esperado | Etapa responsável |
| --- | --- | --- | --- |
| RN-01 | baseline | Jun 3/7 → 42,86%; Jul 3/8 → 37,50% | E05 |
| RN-02 | expectedBaseline.evolution | −75/14 p.p. → −5,36%; meses identificados, sinal negativo | E05/E06 |
| RN-03 | positiveEvolution | 4/10 → 5/10; +10,00 p.p. | E05 |
| RN-04 | duplicateTrue | Técnico repetido conta uma vez na meta; linhas e produção preservadas | E05 |
| RN-05 | conflictingGoals | Qualquer true vence no técnico-mês; divergência visível em qualidade | E04/E05 |
| RN-06 | filterCases: Mês julho | Tabela/cards aplicáveis: 8 linhas; mensal mantém Jun e Jul; evolução −5,36% | E05/E06 |
| RN-07 | filterCases: Operação A | Só Equipe A nas opções; seleções incompatíveis removidas; gráfico mensal 50%/50% | E05/E06 |
| RN-08 | accessCases[0] | Operação B solicitada por quem só acessa A: 403 ou conjunto vazio, sem vazamento | E02/E10 |
| RN-09 | rawImportCases | 1.234,50 → 1234.50; SIM/ NÃO/ vazio → true/false/null; contrato mantém zeros | E04 |
| RN-10 | exportCase | Busca TEC-0, julho e A; desc: 04,03,02,01; pageSize 2, exporta 4 linhas; 6 colunas, BOM e ; | E08 |
| RN-11 | repeatedImport | Segundo snapshot idêntico termina com 15 linhas, sem duplicação | E04 |
| RN-12 | unknownGoals | 7 metas indeterminadas; nenhuma meta confirmada; cobertura 0 e aviso, sem sucesso indevido | E04/E05/E06 |
| RN-13 | differentYears | Janeiro/2025 e janeiro/2026 separados e em ordem cronológica | E04/E05 |
| RN-14 | unsafeCsvTexts e numericNegativeProduction | Textos com =,+,-,@ exportados inertes; produção numérica -10.25 preserva semântica | E08 |
| RN-15 | accessCases[1] | Perfil desativado perde acesso após revalidação no servidor | E02/E10 |
| RN-16 | empty | Taxa null, evolução indisponível, sem NaN/Infinity | E05/E06 |
| RN-17 | apenas june | Evolução indisponível por falta de segundo mês | E05/E06 |
| RN-18 | invalidImportCases | Valor desconhecido em meta nunca vira false silencioso; mês sem ano exige atribuição explícita | E04 |
| RN-19 | crossScopeTechnician | Sinalizar técnico no mesmo mês em escopos distintos; regra de identidade requer E00-T02 | E00/E04/E05 |

## Procedimento futuro

E08-T03: os testes productivity-csv/productivity-export/csv-export-action e e2e/productivity-export verificam RN-10/RN-14 no limite sintético: arquivo com seis colunas/BOM/; e CRLF, filtros+busca+ordem, todas as páginas, escape/proteção de fórmulas, produção negativa preservada, revogação entre lotes e limites sem arquivo parcial. O download real no navegador foi lido em bytes e conferido. Isso não prova comportamento de todos os programas de planilha após regravação, nem repositório SQL/snapshot/auditoria reais.

E08-T02: `tests/unit/productivity-details.test.tsx` e `e2e/productivity-details.spec.ts` acrescentam evidência da UI real: seis colunas, Sim/Não/—, produção pt-BR/zeros, aria-sort, teclado, consulta paginada, busca sem alterar agregados, Voltar/recarregar, reset pelos filtros, skeleton em transição controlada, erros isolados, tema e rolagem horizontal. O DTO e o caso de uso são os mesmos da API, lidos diretamente no servidor. CSV e origem empresarial real continuam pendentes.

E08-T01: `tests/unit/productivity-page.test.ts` e `e2e/productivity-page-api.spec.ts` verificam filtros/pesquisa/ordem antes da paginação, total comum entre páginas, produção numérica exata, zeros de contrato, seis colunas no DTO e limites/escopo. HTTP de produção comprova 401 do detalhamento privado e 404 da demo, além de HEAD protegido/POST 405. São evidências da API sintética; tabela da UI, SQL real e CSV permanecem pendentes.

E07-T03 acrescenta `e2e/chart-consistency.spec.ts`: matriz dos dois gráficos em claro/escuro, 320/768/1280 px e fonte a 100/200%, detalhes fora da rolagem, cores do tema, Escape/setas, nomes longos e mouse/troca de tema sem mudança dos rótulos. O primeiro ensaio reproduziu corte de tooltip em 320 px; o suporte compartilhado corrige o caso. Paridade matemática e visual conjunta permanece na E07-T04.

E07-T02 acrescenta `supervisors-performance.test.tsx` e `supervisors-performance.spec.ts`: contagens ponderadas, contrato/ordenação exata inclusive com rótulos arredondados iguais, empate alfabético, metas indeterminadas/conflitantes, estado vazio e comparação SVG/tabela/API sob todos os filtros em desktop/mobile. Mês altera supervisão e não altera o histórico mensal. Não representa paridade validada contra dados empresariais reais.

E07-T01 acrescenta `e2e/monthly-performance.spec.ts`: comparação dos rótulos SVG e da tabela mensal com a API em quatro recortes, incluindo julho isolado e mês sem registros, além de Operação/Supervisor. A série conserva junho/julho quando somente Mês muda. Testes unitários verificam contrato, cronologia entre anos, estado vazio e aviso/cobertura de metas indeterminadas. Paridade matemática abrangente e gráfico de supervisão permanecem nas tarefas seguintes.

E06-T05 acrescenta evidência de interface em `e2e/dashboard-accessibility.spec.ts`: teclado/foco, rolagem acessível da tabela, reflow nos dois temas em 320/768/1280 px e fonte a 200%, além de contraste dos pares de tokens selecionados. Não altera os critérios matemáticos RN nem equivale a auditoria completa de acessibilidade.

1. Executar as fixtures contra funções puras do domínio e comparar os valores integrais e os valores de exibição separadamente.
2. Repetir cada filtro na API e na UI, sem ampliar o escopo autorizado.
3. Conferir tabela, busca, ordenação e exportação de todas as páginas.
4. Registrar evidência e tarefa executada por caso; só então marcar o aceite correspondente.
5. Para paridade com o legado, usar apenas amostra autorizada e anonimizada em ambiente restrito; não colocar dados reais no repositório ou nos logs.

## Pendências de descoberta

E00-T01 (formato/ano/metas da origem), E00-T02 (identidade e escopo) e E00-T03 (perfis/infraestrutura) continuam pendentes. Os cenários de acesso são contratos de teste, não usuários reais ou login simulado. A apresentação da cobertura de metas nulas e a identidade de técnicos em múltiplos escopos precisam de confirmação de negócio antes do lançamento.

E08-T04: dashboard-state.test e dashboard-state.spec validam preservação de pesquisa/ordem/tamanho ao mudar filtros, reset de página, limpeza explícita, histórico/reload, saneamento de supervisor e descarte de rascunho. productivity-details.spec verifica transição compartilhada e bloqueio dos filtros durante ordenação. CSV e acessibilidade foram revalidados em desktop/mobile; 58 cenários de navegador distintos passaram. Sem alteração de métricas ou validação de infraestrutura real.
