# E00-T04 — Fixtures e checklist de paridade

Data: 2026-10-31. Escopo de preparação local concluído.

## Entrega

- Fixtures sintéticas separadas do código de produção, com schema Zod.
- Base de 15 linhas: junho 3/7, julho 3/8, diferença exata −75/14 p.p. e exibição −5,36%.
- Cenários de duplicidade, conflito true/false, metas nulas, vazio, evolução positiva, anos distintos e técnico em múltiplos escopos.
- Entradas brutas de importação, códigos inválidos, snapshot repetido, filtros, ordenação, busca, exportação de todas as páginas e textos para testar CSV injection.
- Contratos fictícios de acesso restrito e usuário desativado, sem contas reais.
- Checklist RN-01 a RN-19, com resultados esperados e etapas responsáveis, em `docs/CHECKLIST_PARIDADE.md`.

## Arquivos

`painel-produtividade/tests/fixtures/productivity.ts`, `painel-produtividade/tests/fixtures/README.md`, `painel-produtividade/tests/unit/productivity-fixtures.test.ts`, `painel-produtividade/README.md`, `docs/CHECKLIST_PARIDADE.md` e `docs/DECISOES.md`.

## Verificação

`npm run check` passou:

- Lint e TypeScript sem erros ou avisos.
- Vitest: 16 testes passaram, incluindo 14 de integridade das fixtures e 2 da galeria existente.
- Build: compilação, TypeScript e geração de páginas concluídos.
- HTTP: 5 testes passaram.
- Playwright: 6 testes desktop/mobile passaram.
- Total: 27 testes passaram; sem testes ignorados.

A primeira verificação TypeScript rejeitou literais BigInt por causa do target ES2017. Os testes passaram a usar `BigInt(...)`, preservando a precisão e a configuração da aplicação. Os testes de integridade validam schema, chaves, quantidade de registros, totais exatos, duplicidades, conflitos e o caso racional de evolução. Não comprovam a execução das métricas ou filtros pela aplicação.

## Critérios e limites

Dados fictícios e checklist prontos, sem dependências novas ou dados reais. As fixtures não foram conectadas à UI, usadas em banco nem publicadas. Os aceites funcionais RN-01 a RN-19 continuam pendentes da implementação real. E00-T01/T02/T03 seguem pendentes, especialmente ano/metas da origem e identidade entre escopos.

O roteiro original `docs/etapas/00-descoberta.md` continua ausente, portanto o backlog não foi marcado sem conferir seus critérios completos. Próximo passo local proposto: E05-T01 — domínio puro de metas e deduplicação contra as fixtures, mantendo serviços externos adiados.
