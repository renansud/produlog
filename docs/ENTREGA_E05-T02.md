# E05-T02 — Evolução e KPIs

Data: 2026-10-31. Escopo local de domínio concluído e validado.

## Entrega

- Card Técnicos: identidade distinta entre as linhas fornecidas, usando a regra de ID/fallback da E05-T01.
- Produção total: soma de todas as linhas, inclusive duplicidades de técnico.
- Média de produção: soma dividida pelo número de linhas, preservando razão exata; não é média por técnico.
- Taxas mensais: metas deduplicadas por técnico-mês, quantidade de indeterminados, cobertura e avisos de qualidade.
- Evolução: taxa do último mês menos taxa do penúltimo mês cronologicamente disponível, sem regressão, variação relativa ou arredondamento prévio das taxas.
- Saídas decimais textuais com duas casas, razões exatas serializáveis em JSON e direção da evolução. A apresentação pt-BR será responsabilidade da UI.
- Base vazia: total zero, média null, série vazia e evolução null. Com apenas um mês, evolução null.

## Precisão e limites

Produção normalizada compatível com Decimal(14,2): texto com até 12 dígitos inteiros e zero a duas casas; formato pt-BR bruto, números JS, notação exponencial e mais de duas casas são rejeitados. Centésimos e operações racionais usam BigInt, sem float financeiro. Totais agregados podem ultrapassar a magnitude de um registro individual sem perda de precisão.

Razões reduzidas preservam numerador/denominador exatos. Apenas a saída decimal é arredondada em half-up, com empate para longe de zero e sem zero negativo. Decisão e testes foram registrados antes da implementação.

O histórico deve chegar autorizado por operação/supervisor, sem filtro Mês; os cards de produção recebem todas as restrições aplicáveis. A aplicação desses filtros e RBAC pertence à E05-T03. Metas nulas ficam no denominador documentado, com cobertura e avisos; a UI não pode tratar cobertura zero como sucesso confirmado.

## Arquivos

Em `painel-produtividade/`: `modules/productivity/domain/exact-ratio.ts`, `modules/productivity/domain/productivity-metrics.ts`, `tests/unit/productivity-metrics.test.ts`, `modules/productivity/README.md` e `README.md`. Também `docs/DECISOES.md` e `docs/CHECKLIST_PARIDADE.md`.

## Validação

`npm run check` terminou com código 0:

- Lint e TypeScript: sem erros ou avisos.
- Vitest: 87 testes passaram, incluindo 21 novos de métricas.
- Build: compilação, TypeScript e geração de páginas concluídos.
- HTTP: 5 testes passaram.
- Playwright: 6 testes desktop/mobile passaram.
- Total: 98 testes passaram; nenhum ignorado.

Referências verificadas: junho 42,86%, julho 37,50%, evolução exata −75/14 p.p. exibida −5,36; caso 1/6 → 1/3 exibido +16,67 sem subtrair valores previamente arredondados; evolução positiva/zero, taxas anteriores zero, meses com lacunas, anos distintos, entradas vazias, cobertura nula/parcial, médias com empates, negativos e totais grandes.

## Pendências

Sem dependências novas, UI conectada, filtros, RBAC, consultas, banco ou publicação. O CI remoto não foi executado. E00-T01/T02/T03 continuam pendentes. O roteiro original `docs/etapas/05-metricas.md` ainda não está disponível, portanto o backlog permanece sem marcação até conferir todos os critérios formais.

Próximo passo recomendado: E05-T03 — filtros e escopo de acesso para validação local, sem autenticação real.
