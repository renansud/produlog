# Fixtures sintéticas de produtividade — E00-T04

`productivity.ts` contém somente dados fictícios para testes. Não importar em produção, usar como seed empresarial ou publicar em `public/`.

- `baseline`: 15 linhas, junho 3/7 e julho 3/8, mesmo conjunto de técnicos entre meses.
- `duplicateTrue`, `conflictingGoals`, `unknownGoals`: repetição, divergência e ausência de meta.
- `differentYears`, `positiveEvolution`, `empty`: cronologia, evolução positiva e ausência de base.
- `crossScopeTechnician`: qualidade e ambiguidade entre escopos; não aprova regra de identidade.
- `filterCases`, `exportCase`: oráculos literais de filtros e exportação de todas as páginas.
- `rawImportCases`, `invalidImportCases`: entradas brutas separadas do formato normalizado.
- `repeatedImport`: duas cargas idênticas para futura verificação de idempotência.
- `accessCases`: contratos de autorização; não são usuários ou permissões de frontend.
- `unsafeCsvTexts`: expressões artificiais para testar neutralização em planilhas, sem links ou comandos externos.

Produção normalizada fica como string decimal; testes de integridade somam centésimos com BigInt. As competências e identificadores são arbitrários e não permitem inferir o ano ou formato da base real. O schema Zod é exclusivo das fixtures, não substitui o parser/importador de produção.

`tests/unit/productivity-fixtures.test.ts` valida a integridade desses exemplos. Não implementa nem comprova o motor de métricas. Critérios e procedimentos futuros estão em [docs/CHECKLIST_PARIDADE.md](../../../docs/CHECKLIST_PARIDADE.md).
