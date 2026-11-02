# E06-T02 — Filtros multisseleção

Data: 2026-10-31. Escopo de demonstração local concluído e validado.

## Entrega

- Menus Mês, Operação e Supervisor com pesquisa, checkbox, selecionar tudo, limpar seleção e indicador de escolhas.
- Seleção vazia mantém o significado documentado de todos os resultados permitidos. Selecionar tudo abrange todas as opções disponíveis do campo, independentemente do termo de pesquisa.
- Estado persistido na URL, leitura por Server Component e navegação sem salto de rolagem. Recarregar e Voltar recuperam o recorte.
- Feedback visual imediato da seleção via useOptimistic; atualização anunciada e controles temporariamente desabilitados durante a transição. O servidor continua validando a entrada e recalculando os indicadores.
- Supervisores dependentes das operações selecionadas. Associações múltiplas são preservadas por operationIds autorizados; escolhas incompatíveis são removidas no cliente e no servidor.
- URLs com supervisores descartados são redirecionadas aos filtros efetivos. Entrada inválida ou operação não autorizada apresenta alerta reduzido e ação de retorno, sem indicadores.
- Cards, período e contagens atualizados. Mês não altera Evolução ou o conjunto histórico mensal.
- Parser/serializador de URL compartilhado com os endpoints. Sem identidade ou permissões no payload do browser.

## Arquivos

Em `painel-produtividade/`: `app/page.tsx`, `components/dashboard/multi-select-filter.tsx`, `modules/productivity/domain/filter-query.ts`, `modules/productivity/domain/productivity-filters.ts`, `modules/productivity/presentation/dashboard-filters.tsx`, `modules/productivity/presentation/format-decimal.ts`, `modules/productivity/presentation/local-preview.tsx`, `modules/productivity/presentation/dashboard-http.ts`, `tests/unit/filter-query.test.ts`, `e2e/dashboard-filters.spec.ts`, `modules/productivity/README.md` e `README.md`. Também CONTRATOS_API.md, docs/DECISOES.md e docs/CHECKLIST_PARIDADE.md.

## Validação

Pipeline final `npm run check`: código 0.

- Lint e TypeScript sem erros ou avisos.
- Vitest: 141 testes passaram, incluindo cinco novos de query, associações e competência.
- Build: compilação, TypeScript e geração de páginas concluídos.
- HTTP de produção: 14 testes passaram; bloqueios de páginas/demo e 401 privado preservados.
- Playwright/API: 22 testes passaram, incluindo oito cenários novos distribuídos entre desktop e mobile.
- Total: 177 testes passaram, nenhum ignorado.

Casos reais de navegador: julho gera 800,00 e mantém −5,36%; trocar A por B remove supervisor A e gera 700,00/−8,33%; selecionar tudo/limpar; recarregar/Voltar; link incompatível saneado; role forjado na URL não produz indicadores. A captura desktop atualizada foi conferida visualmente; os testes responsivos também passaram em mobile.

Na primeira execução, o checkbox só mostrava o estado após a resposta do servidor. Foi corrigido com seleção otimista e o teste original passou sem reduzir a asserção. Uma segunda falha vinha da ambiguidade entre o alerta da página e o anunciador do Next; o alerta recebeu nome acessível e o teste passou a identificá-lo pelo nome. O pipeline completo foi executado após as correções.

## Limites e pendências

Dados são fictícios e continuam restritos ao desenvolvimento. Não há autenticação real, banco, consulta Prisma ou publicação. A associação de supervisores enviada ao cliente contém somente operações do conjunto autorizado. Nenhuma dependência nova. CI remoto não executado.

Gráficos, detalhamento, exportação, botões globais, tema e testes completos de acessibilidade permanecem nas tarefas correspondentes. A integração com a API privada real da E06-T03 também permanece pendente; o recorte atual usa o caso de uso no servidor com adaptador sintético.

O roteiro original docs/etapas/06-interface.md segue ausente, portanto o backlog não foi marcado sem conferir os critérios formais. Próximo passo recomendado: E06-T03 — integração dos cards aos contratos de leitura, mantendo o modo local e a produção fechada.
