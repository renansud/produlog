# Estratégia de testes e validação de paridade

## Pirâmide sugerida

- **Unitários (Vitest):** funções puras de normalização de dados, filtros, cálculo de meta, evolução, ordenação, CSV.
- **Integração:** Prisma com banco de testes independente; endpoints protegidos; RBAC e importação idempotente.
- **E2E (Playwright):** login, filtros, gráficos, tabela, download, tema, comportamento sem dados, logout e 403.
- **Snapshot visual/manual:** comparações com interface legado, desktop/mobile/tema escuro.

## Matriz mínima de casos de domínio

| ID | Cenário | Esperado |
|---|---|---|
| RN-01 | Mês Jun: 3 de 7 técnicos bateram; Jul: 3 de 8 | 42,86%; 37,50% |
| RN-02 | Evolução Jun 42,86 → Jul 37,50 | −5,36 p.p.; UI `-5,36%`, vermelho |
| RN-03 | Evolução Jun 40,00 → Jul 50,00 | +10,00 p.p.; verde |
| RN-04 | Técnico duplicado com duas linhas SIM no mesmo mês | conta uma pessoa, não duas |
| RN-05 | Técnico com um SIM e um NÃO no mês | conta como SIM (legado) |
| RN-06 | Somente filtro Mês = Jul | Performance Mensal ainda inclui Jun |
| RN-07 | Operação X selecionada | Supervisor mostra só nomes ligados a X e autorizados |
| RN-08 | Usuário sem acesso a operação Y consulta API/Y | 403 ou interseção vazia; nunca dados de Y |
| RN-09 | Produção decimal 1.234,50 | número 1234.50 no banco, exibição 1.234,50 |
| RN-10 | Busca, filtro e classificação + export | CSV contém mesmos resultados, todas as páginas |
| RN-11 | Reimportar mesmo arquivo/competência | não duplica |
| RN-12 | Meta vazia para todos os técnicos | estado sem dados/cobertura baixa; nunca taxa como sucesso confirmado |
| RN-13 | Janeiro 2025 e janeiro 2026 | meses separados |
| RN-14 | String exportada `=HYPERLINK(...)` | texto inofensivo no CSV |
| RN-15 | Login e acesso desativado | logout/revogação; nenhum acesso à API |

## Comandos desejados no package.json

```bash
npm run lint
npx tsc --noEmit
npm test -- --run
npm run test:e2e
npm run build
```

Os scripts são metas de implementação. A Etapa 01/10 deve adicioná-los; podem não existir no scaffold inicial.

## Gate antes de deploy

- `lint`, typecheck, testes unitários e build passam.
- Integração com banco de teste passa; falhas simuladas de importação não deixam metade dos registros.
- E2E com contas admin/gestor/visualizador passa; nenhuma rota privada pública.
- Paridade de cinco filtros/cenários com o dashboard legado registrada em `docs/DECISOES.md`.
- Teste de desempenho com base representativa e paginação server-side; nenhuma consulta traz todos os registros para browser sem necessidade.
- Links de produção publicados após aprovação do responsável, sem exposição de dados reais durante desenvolvimento.
