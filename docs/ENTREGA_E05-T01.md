# E05-T01 — Domínio puro de metas e deduplicação

Data: 2026-10-31. Escopo local implementado e validado.

## Entrega

- Normalização dos códigos de META BATIDA documentados, incluindo booleanos, 0/1, variações de caixa, espaços e acentos. Vazio permanece null; desconhecido retorna UNKNOWN_GOAL_VALUE, sem valor bruto ou conversão silenciosa para false.
- Schema Zod para linhas com competência AAAA-MM, identidades e meta normalizada.
- Deduplicação por técnico-mês e supervisor-técnico-mês. Precedência true > false > null; divergências true/false e ausência de meta geram avisos.
- IDs estáveis têm prioridade; nomes normalizados são fallback. Homônimos, identificação mista, fallback por nome e múltiplos escopos são sinalizados.
- Referências de todas as linhas preservadas, sem modificar entradas, descartar produção ou calcular médias de linhas deduplicadas.
- Chaves compostas sem colisão por separadores e saída determinística, independente da ordem de entrada.
- Avisos somente com código, mês e quantidade de linhas. Sem escrita em logs ou persistência nesta camada.

## Arquivos

Em `painel-produtividade/`: `modules/productivity/domain/goal-normalization.ts`, `modules/productivity/domain/goal-deduplication.ts`, `tests/unit/goal-domain.test.ts`, `modules/productivity/README.md` e `README.md`. Também `docs/DECISOES.md` e `docs/CHECKLIST_PARIDADE.md`.

## Validação

`npm run check` terminou com código 0:

- ESLint: sem erros ou avisos.
- TypeScript: sem diagnósticos.
- Vitest: 66 testes passaram (50 novos: 39 casos de normalização e 11 casos de deduplicação).
- Build: compilação, TypeScript e geração de páginas concluídos.
- HTTP: 5 testes passaram.
- Playwright: 6 testes desktop/mobile passaram.
- Total: 77 testes passaram, sem ignorados.

Os testes do domínio usam as fixtures reais de teste E00-T04, incluindo 7 e 8 técnicos-mês com 3 conquistas em cada mês, repetição de linhas, conflito, metas indeterminadas e anos distintos. Há testes adicionais para IDs/homônimos, nomes variantes, entradas inválidas, mutação e ordem de entrada.

## Limites

Não foram implementados percentuais, evolução, KPIs, filtros, RBAC, importação, persistência de qualidade ou conexão à interface. As funções devem receber somente registros autorizados pelo chamador. As chaves internas de agrupamento podem conter nomes normalizados e não devem ser publicadas ou logadas. Os erros de validação devem ser tratados sem expor os dados de entrada na futura camada de aplicação.

E00-T01/T02/T03 permanecem pendentes. Identificação sem ID não resolve homônimos; o aviso mantém essa limitação visível. Não houve aprovação de critério novo nem mudança das fórmulas documentadas. Não foram adicionadas dependências.

O roteiro original `docs/etapas/05-metricas.md` não está disponível; o backlog continua sem marcação até conferir seus critérios completos. Próximo passo recomendado no fluxo local: E05-T02 — evolução e KPIs.
