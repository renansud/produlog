# E08-T01 — API paginada do detalhamento

Data: 2026-11-01. Escopo local com dados fictícios.

## Entrega

- GET privado /api/v1/productivity, bloqueado em 401 até sessão real; GET demo /api/demo/productivity somente em desenvolvimento local, 404 em produção.
- Filtros Mês/Operação/Supervisor, busca pt-BR de até 120 caracteres, ordenação por seis colunas, page/pageSize validados (máximo 100 linhas por resposta).
- Produção ordenada em centésimos BigInt, sem float; mês inclui ano; textos preservam zeros; indeterminados ao final e desempate por chave interna estável.
- Consulta, contagem e paginação no servidor. DTO com somente seis colunas, produção textual com duas casas, seleções efetivas e metadados. Sem deduplicar linhas.
- Acesso revalidado antes da entrada/consulta, rejeição de operação não autorizada, escopo vazio sem leitura e defesa contra retorno inconsistente/off-scope do adaptador. Supervisores incompatíveis são descartados seguindo o dashboard.
- Contrato de repositório preparado para SQL paginado; adaptador implementado somente para 15 linhas sintéticas. Guard de acesso/origem compartilhado com o dashboard.
- Respostas privadas sem cache, erros sanitizados, HEAD protegido e POST não suportado. Tabela/CSV ficam nas tarefas seguintes.

## Arquivos

Em painel-produtividade: app/api/v1/productivity/route.ts e app/api/demo/productivity/route.ts; módulos de produtividade: application/productivity-access.ts, read-productivity-dashboard.ts e read-productivity-page.ts; domain/productivity-page.ts e productivity-metrics.ts; infrastructure/demo-request.ts, demo-dashboard.ts e productivity-page-dependencies.ts; presentation/productivity-page-http.ts; tests/unit/productivity-page.test.ts; tests/integration/production.test.mjs; e2e/productivity-page-api.spec.ts; README.md e modules/productivity/README.md. Também CONTRATOS_API.md, docs/DECISOES.md, docs/CHECKLIST_PARIDADE.md e este relatório.

## Validação

Execução isolada: 35 novos testes Vitest passaram; TypeScript aprovado. Cobrem limites/query, busca/ordem/páginas, precisão, metadados, preservação de linhas/zeros, autorização, saneamento de supervisor e retornos inválidos do repositório.

Validação dos comandos de código/build/HTTP e testes das APIs afetadas concluída com código 0:

- Vitest: 237 testes passaram em 14 arquivos.
- TypeScript (`tsc --noEmit`): aprovado.
- Build: compilação, TypeScript e geração de páginas concluídos, incluindo as duas novas rotas dinâmicas.
- HTTP de produção: 17 testes passaram.
- Playwright das APIs de dashboard/detalhamento: 10 testes passaram em desktop/mobile (`--trace off`).

O lint inicial apontou somente um import de teste sem uso; removido, com lint/TypeScript repetidos ao final e aprovados sem avisos, código 0.

Total da seleção executada: 264 testes aprovados, nenhum ignorado. A suíte visual completa não foi repetida: não houve alteração de componentes ou fluxos da interface. A instabilidade da execução longa registrada na E07-T04 não está declarada resolvida por esta tarefa. Avisos de ambiente NO_COLOR/FORCE_COLOR não causaram falhas.

## Limites

Não há Prisma/SQL, sessão Supabase ou uso de dados empresariais. Eficiência e predicados do repositório SQL só poderão ser verificados quando conectado; o adaptador sintético não prova paginação no banco. O total é confiado ao contrato do repositório, com verificações de coerência da página; isolamento de escopo do COUNT deverá ser testado na integração real. O identificador interno deve ser persistente e único. Sem novas dependências, migrations ou deploy. CI remoto não executado.

docs/etapas/08-detalhamento.md permanece ausente e o checklist formal do backlog não foi marcado. Próximo passo recomendado: E08-T02 — tabela com ordenação por coluna, ainda em demonstração local.
