# E06-T03 — Cards integrados ao contrato de resumo

Data: 2026-10-31. Escopo local concluído e validado.

## Entrega

- DTO de summary centralizado com schema Zod e projeção única para o handler e os cards Server Components.
- Leitura da página pelo caso de uso no servidor, sem chamada HTTP ao próprio Route Handler. Os cards consomem exatamente o contrato servido pela API; não recebem o resultado interno completo.
- Contrato inclui rowCount e valida contagens, disponibilidade da média, decimais textuais, percentuais finitos, cronologia e coerência da evolução com sua razão exata/direção.
- Produção permanece como texto decimal; somente percentuais finais passam por Number. Linhas de técnicos e chaves de identificação não integram o DTO.
- Recorte vazio mostra estado próprio, média indisponível, total zero e evolução histórica quando aplicável. Sem histórico suficiente, evolução indisponível.
- Metas indeterminadas/conflitantes recebem ressalva visível. Detalhes de qualidade permitem consultar avisos reduzidos de identificação/escopo, sem dados pessoais.
- Falha de leitura ou contrato inválido apresenta indicadores indisponíveis, sem dados parciais ou detalhes internos. Erros de filtro continuam com o tratamento anterior.

## Arquivos

Em `painel-produtividade/`: `modules/productivity/application/dashboard-summary-contract.ts`, `modules/productivity/presentation/dashboard-http.ts`, `modules/productivity/presentation/summary-indicators.tsx`, `modules/productivity/presentation/local-preview.tsx`, `app/page.tsx`, `tests/unit/summary-indicators.test.tsx`, `e2e/summary-contract.spec.ts`, `modules/productivity/README.md` e `README.md`. Também CONTRATOS_API.md, docs/DECISOES.md e docs/CHECKLIST_PARIDADE.md.

## Validação

Pipeline final `npm run check`: código 0.

- Lint e TypeScript sem erros ou avisos.
- Vitest: 155 testes passaram, incluindo 14 novos de contrato e apresentação.
- Build: compilação, TypeScript e geração de páginas concluídos.
- HTTP de produção: 14 testes passaram, preservando os bloqueios de demonstração e endpoints privados.
- Playwright/API: 30 testes passaram; oito novos comparam API/HTML em desktop e mobile.
- Total: 199 testes passaram, nenhum ignorado.

Os testes rejeitam produção numérica/localizada, contagens negativas/inconsistentes, NaN/Infinity, precisão excessiva de percentuais, razões inválidas e direção incompatível. Casos de interface verificam os quatro cards, ausência de registros, evolução histórica preservada, metas desconhecidas/conflitantes e estado de falha sem valores. A primeira verificação encontrou uma opção de consulta exclusiva do Playwright aplicada por engano ao Testing Library; foi corrigida antes da execução final.

## Limites e critérios pendentes

O escopo é a demonstração sintética. O consumo do contrato seguro está implementado, mas a autenticação Supabase e o repositório Prisma reais continuam adiados; a API privada permanece 401. Não há fetch cliente, cache compartilhado, dependência nova, dado empresarial ou publicação. O estado de carregamento durante filtros continua sendo anunciado pela transição da E06-T02; não há uma segunda leitura que mantenha valores obsoletos após falha.

Gráficos e detalhamento continuam reservados. CI remoto e autenticação/RLS/SQL reais não foram validados. O roteiro original docs/etapas/06-interface.md permanece ausente, portanto o backlog não foi marcado sem conferir os critérios formais de produção.

Próximo passo recomendado: E06-T04 — ações compactas de atualizar, tema, limpar e exportar, sem antecipar a implementação de CSV da E08-T03.
