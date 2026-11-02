# E10-T02 — Autorização e vazamento de dados

Data: 2026-11-01. Revisão local com identidades e dados sintéticos; sem Supabase/PostgreSQL, criação de usuários, dados empresariais ou deploy.

## Resultado da revisão

As consultas e exportação validam usuário, papel ativo e operações no servidor, independentemente de proxy ou interface. Os providers privados continuam sem sessão (null), bloqueando leitura real. A demonstração é separada e limitada a desenvolvimento local; não é um login simulado para as APIs privadas.

Os handlers projetam DTOs, sem enviar as linhas internas do dashboard. A tabela expõe as seis colunas previstas; opções de filtros, séries e dados de qualidade são derivados do escopo autorizado. O caso de uso rejeita linhas fora do escopo devolvidas por adaptador incorreto. Isso é uma defesa adicional, sem substituir o predicado obrigatório no futuro repositório SQL.

Respostas de sucesso e erro usam private,no-store, Vary: Cookie e nosniff. Erros inesperados são sanitizados. O CSV é montado sob limites antes da resposta e revalida identidade/escopo por lote; uma falha não libera arquivo parcial.

## Matriz executada

Novo arquivo painel-produtividade/tests/unit/productivity-authorization.test.ts: 54 casos, atravessando os handlers reais de summary, monthly, supervisors, filters, detalhamento e CSV com providers/repositórios sintéticos.

| Verificação | Evidência / resultado esperado |
| --- | --- |
| Sem sessão e query role=ADMIN | 401 antes de consultar repositório, inclusive com parâmetros inválidos |
| Perfil desativado | 403 antes de consultar dados |
| Papel desconhecido | 403; não aceita ampliação de papel |
| Operação fora do escopo na URL | 403 antes do repositório, sem refletir o ID restrito na resposta |
| ADMIN, GESTOR e VISUALIZADOR | Somente operação fornecida pelo provider, inclusive ADMIN; nenhuma ampliação automática pelo cliente |
| Adaptador devolve operação indevida | 403, sem nomes/contratos/IDs restritos ou arquivo parcial |
| Erro interno contendo marcador sintético restrito | 500 sanitizado, sem marcador ou arquivo |
| Cache/DTO em todos os cenários | Headers privados; sem sourceRowKey nem identificadores da operação B |

Para os casos de sucesso, a operação B contém um marcador sintético em técnico, supervisor e contrato. As respostas completas de cada endpoint são inspecionadas para garantir ausência desse marcador e dos IDs da operação/supervisor B. Os spies comprovam que os repositórios recebem somente a operação A. Isso detecta leitura/serialização indevida no limite testado, sem afirmar ausência universal de vazamentos.

Cobertura complementar revisada: productivity-filters.test.ts (escopo vazio, três papéis, perfil revogado e retorno fora de escopo); productivity-page.test.ts (query, escopo, DTO e erros); productivity-export.test.ts (revogação/troca de escopo entre lotes e limites sem arquivo parcial); dashboard-http.test.ts (contratos, origem e ambiente demo). As rotas privadas usam providers sem sessão; os 19 testes HTTP verificam o build de produção, incluindo GET/HEAD, ausência da demo e POST não suportado. Testes E2E de API, filtros e CSV verificam a integração local e parâmetros adulterados.

## Validação

Os 54 novos casos passaram isoladamente e estão incluídos na contagem geral, sem dupla soma.

- npm run lint e npx tsc --noEmit: código 0.
- npm test: 343 testes aprovados em 20 arquivos.
- npm run build: código 0; compilação e TypeScript aprovados.
- npm run test:http: 19 testes aprovados.
- npm run test:e2e -- e2e/dashboard-api.spec.ts e2e/productivity-page-api.spec.ts e2e/productivity-export.spec.ts e2e/dashboard-filters.spec.ts --trace off: 24 cenários aprovados, 12 desktop e 12 mobile Chromium, em 26,1 segundos.

Total desta seleção: 386 testes aprovados. Nenhuma falha, teste ignorado ou retry local. A sequência completa terminou com código 0. Não foi necessário alterar o produto. A suíte integral do navegador foi executada na E08-T05; nesta tarefa foi repetida a seleção de acesso/API/filtros/CSV, sem nova execução dos 136 cenários integrais.

Artefatos locais: painel-produtividade/playwright-report/index.html e painel-produtividade/test-results/, ignorados pelo Git e sobrescritos em execuções futuras. Avisos NO_COLOR/FORCE_COLOR do ambiente não causaram falhas. CI remoto não executado.

## Arquivos e limites

Alterados: painel-produtividade/tests/unit/productivity-authorization.test.ts, painel-produtividade/README.md, docs/CHECKLIST_PARIDADE.md e este relatório. Nenhum código de produto, dependência ou política foi alterado. Sem mudança não trivial de arquitetura/critério para DECISOES.md.

Pendências explícitas: sessão/cookies reais, refresh/expiração/logout, revogação persistida, RLS/grants/Data API, privilégios Prisma e isolamento no SQL; autorização de importação/admin ainda não implementados; auditoria e rate limit persistentes. Não houve inspeção de infraestrutura externa, pentest, varredura integral de segredos em histórico Git, nem certificação LGPD. Não se afirma que private,no-store remova informações já vistas pelo usuário antes da revogação.

docs/etapas/10-qualidade.md continua ausente; BACKLOG.md permanece sem marcação formal. A tarefa valida o limite local, sem declarar prontidão para produção.

Próximo passo recomendado: E10-T03 — revisão de segurança de upload e CSV no escopo existente, registrando como pendentes os fluxos de importação ainda ausentes.
