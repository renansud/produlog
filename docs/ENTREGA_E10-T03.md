# E10-T03 — Segurança de upload e CSV

Data: 2026-11-01. Revisão do código existente com dados fictícios. Sem banco/login reais, upload de dados empresariais ou deploy.

## Upload

O módulo imports contém somente README; não há parser, Route Handler de importação, input de arquivo ou Server Action de upload nos diretórios app/modules/components revisados. Foi adicionado um teste HTTP de produção que exige 404 para GET /api/v1/imports e rejeição 409 para POST multipart fictício, sem anexo ou eco do conteúdo. O Next.js 16.4.3 instalado classifica multipart como possível Server Action e retorna 409 quando não existem ações; isso foi confirmado em node_modules/next/dist/server/app-render/action-handler.js. O teste comprova apenas a rota ausente e a rejeição atual, não a segurança de um pipeline ainda não implementado.

Continuam pendentes da E04: autenticação e autorização ADMIN no servidor, origem/CSRF, limite de bytes do corpo antes de leitura completa, validação de extensão/MIME/estrutura/colunas com Zod, limites de linhas/células e descompactação de XLSX, competência/ano explícitos, tratamento de meta desconhecida, preview/quarentena, transação/idempotência e auditoria. O limite inicial sugerido em SEGURANCA.md é 10 MB; não existe hoje implementação que o imponha. Nome/MIME informados pelo navegador não devem ser usados como prova do conteúdo. Nenhum endpoint foi criado nesta revisão.

## CSV revisado

| Controle | Implementação / evidência |
| --- | --- |
| Texto que pode iniciar fórmula | Apóstrofo antes de =,+,-,@ e variantes full-width, inclusive após espaços/controles previstos no contrato |
| Separadores, aspas e novas linhas | Todos os campos entre aspas; aspas internas duplicadas; quebras permanecem na célula |
| Produção numérica | Validada e formatada separadamente; negativo preserva semântica, sem float financeiro |
| Formato e colunas | Seis colunas, BOM UTF-8, ponto e vírgula, CRLF, Sim/Não/— |
| Recorte e autorização | Filtros/pesquisa/ordem e todas as páginas; sessão e escopo revalidados entre lotes |
| Volume | Limites já definidos de 10.000 linhas e 5 MiB; erro 413 sem truncar/anexar arquivo parcial |
| Metadados mudaram | Contagem/seleção inconsistentes resultam em 409 sem anexo; não equivale a snapshot SQL |
| Transporte | MIME CSV, tamanho real UTF-8, filename constante, cache privado/no-store, Vary Cookie e nosniff |
| Browser | Só baixa resposta bem-sucedida com MIME CSV; nome restrito a caracteres previstos; cancela ao desmontar/mudar recorte e revoga Object URL |

Revisados: domain/productivity-csv.ts, application/export-productivity-csv.ts, presentation/productivity-export-http.ts, components/dashboard/csv-export-action.tsx e seus testes. A matriz de autorização E10-T02 continua aplicável.

## Cobertura adicionada

- Uma matriz de 112 combinações (14 prefixos × oito operadores) verifica o prefixo de proteção em supervisor, técnico e contrato, preservando produção negativa numérica.
- Exportação exatamente com 5 MiB é aceita; acrescentar um byte, caractere multibyte ou aspas provoca 413 sem anexo. Casos separados comprovam que tamanho UTF-8 e duplicação de aspas entram na contagem.
- Cancelamento anterior à consulta impede leitura; cancelamento após o primeiro lote impede o segundo e rejeita o resultado completo.
- GET /api/v1/imports retorna 404; POST multipart fictício é rejeitado com 409 no build de produção.

São cinco novos testes unitários (incluindo a matriz de combinações) e um novo teste HTTP. Os 33 testes isolados de serialização/exportação passaram; essa contagem inclui testes existentes.

## Validação final

Lint e npx tsc --noEmit: código 0. Vitest: 348 testes aprovados em 20 arquivos. Build: código 0. HTTP de produção: 20 testes aprovados após corrigir a expectativa do novo teste multipart (409 do Next.js, em vez de 404). Não houve alteração do produto. Playwright: seis cenários de CSV aprovados em desktop/mobile Chromium, em sete segundos. Total da seleção: 374 testes aprovados, sem testes ignorados ou retries locais. A execução inicial parou no teste HTTP com expectativa incorreta; HTTP e navegador foram executados novamente após o ajuste. Não se repetiu a suíte integral de 136 cenários da E08-T05 porque o produto permaneceu sem alteração. Avisos NO_COLOR/FORCE_COLOR não causaram falhas. Relatório HTML em painel-produtividade/playwright-report/index.html, capturas em test-results/; artefatos locais ignorados pelo Git e sobrescritos nas próximas execuções. CI remoto não executado.

## Limites e arquivos

Nenhuma falha do produto foi reproduzida nestes casos; foram ampliadas as evidências. Arquivos alterados em painel-produtividade: tests/unit/productivity-csv.test.ts, tests/unit/productivity-export.test.ts, tests/integration/production.test.mjs e README.md. Na raiz: docs/CHECKLIST_PARIDADE.md e este relatório. Nenhuma dependência ou critério mudou, sem novo registro necessário em DECISOES.md.

A proteção é do arquivo gerado; Excel/LibreOffice e regravação/reabertura nesses programas não foram testados. Contrato deve ser importado como Texto para preservar zeros na planilha. O limite de arquivo não é um limite global de memória: serialização monta strings em memória e pode alocar temporariamente um campo grande antes de rejeitá-lo. Concorrência, limites de campo na ingestão, rate limit e auditoria persistentes dependem da infraestrutura real. Snapshot SQL continua pendente e mudanças de valores com a mesma contagem não são todas detectadas.

docs/etapas/10-qualidade.md segue ausente; BACKLOG.md continua sem marcação formal. A revisão local não conclui os aceites de upload, autenticação, SQL ou produção.

Próximo passo recomendado: E10-T04 — performance e experiência responsiva no ambiente local.
