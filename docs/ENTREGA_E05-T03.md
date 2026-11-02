# E05-T03 — Filtros e aplicação do escopo

Data: 2026-10-31. Escopo local de domínio/aplicação implementado e validado.

## Entrega

- Filtros Zod estritos de Mês, Operação e Supervisor, com UUIDs nas dimensões, seleção múltipla, remoção de repetições e limites técnicos documentados.
- AND entre campos e OR dentro das seleções. Vazio significa todo o conjunto previamente autorizado, nunca todo o banco.
- Separação de linhas filtradas para cards/detalhes e histórico por operação/supervisor para Performance Mensal/Evolução, que ignora somente Mês.
- Opções de supervisor dependentes das operações selecionadas e escolhas incompatíveis descartadas. Opções não incluem rótulos fora do escopo.
- Caso de uso server-only que revalida identidade, perfil ativo, papel e operações por meio de um provedor confiável a cada chamada.
- Contrato de consulta exige lista de operações não vazia. Escopo vazio retorna dados vazios sem consulta; operação não autorizada retorna 403 antes de consultar. Contexto ausente retorna 401; contexto inválido/desativado retorna 403.
- Retorno do repositório fora do escopo bloqueia todo o resultado como defesa adicional.
- Composição dos KPIs, evolução, série mensal, opções, filtros efetivos e linhas detalhadas no servidor, sem nova rota ou página pública.

## Arquivos

Em `painel-produtividade/`: `modules/productivity/domain/productivity-filters.ts`, `modules/productivity/application/read-productivity-dashboard.ts`, `tests/fixtures/scoped-productivity.ts`, `tests/unit/productivity-filters.test.ts`, `tests/server-only.ts`, `vitest.config.mts`, `modules/productivity/README.md` e `README.md`. Também `docs/DECISOES.md` e `docs/CHECKLIST_PARIDADE.md`.

O alias server-only é exclusivo do Vitest para permitir testes da lógica. A compilação Next continua usando o marcador nativo; o alias não existe na aplicação. Sem dependências novas.

## Validação

`npm run check` terminou com código 0:

- Lint e TypeScript sem erros ou avisos.
- Vitest: 114 testes passaram, incluindo 27 novos de filtros/escopo.
- Build: compilação, TypeScript e geração de páginas concluídos.
- HTTP: 5 testes passaram.
- Playwright: 6 testes desktop/mobile passaram.
- Total: 125 testes passaram; nenhum ignorado.

Casos incluem mês julho com 8 linhas e evolução −5,36 p.p. preservada, operação A com evolução zero, B com −8,33 p.p., multisseleção, supervisores incompatíveis, contexto ausente/inativo, três papéis, escopo vazio, revogação, parâmetros de permissão forjados, erro de repositório e ausência de mutação das entradas.

## Limites e riscos pendentes

Não existem provedor Supabase, adaptador Prisma ou handlers conectados. Os testes de autorização usam dependências sintéticas no servidor; não criam login fictício na aplicação. O futuro provedor deve validar sessão e consultar permissões atuais. Para ADMIN, resolver todas as operações no servidor e fornecê-las explicitamente; lista vazia continua sem acesso.

O futuro repositório deve aplicar `operationId IN (...)` no SQL/Prisma. O contrato e sua chamada estão testados, mas nenhum predicado SQL foi executado nesta tarefa. A validação posterior dos resultados não substitui o escopo na consulta. Paginação e otimização ficam para as tarefas correspondentes; os dados retornados pelo caso de uso são internos ao servidor e não devem virar carregamento integral no navegador.

Os handlers futuros devem mapear os erros para respostas apropriadas, sanitizar falhas Zod e configurar cache privado. A proteção de endpoints, a autenticação real, a UI de filtros e o gráfico agregado de supervisores continuam pendentes. CI remoto não executado. E00-T01/T02/T03 e o roteiro original da fase permanecem pendentes; o backlog não foi marcado sem conferir os critérios formais.

Próximo passo recomendado: E05-T04 — contratos/endpoints de leitura, preservando o modo local e a proteção de produção.
