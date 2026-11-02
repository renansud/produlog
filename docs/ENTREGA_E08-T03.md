# E08-T03 — Exportação CSV

Data: 2026-11-01. Demonstração local com dados fictícios; sem login/banco reais ou deploy.

## Entrega

- GET privado /api/v1/productivity/export (401 sem sessão real) e GET local /api/demo/productivity/export (404 em produção).
- Filtros, pesquisa e ordenação do recorte aplicado, incluindo todas as páginas. page/pageSize são validados e depois ignorados para delimitar o arquivo.
- Seis colunas, BOM UTF-8, ponto e vírgula, CRLF, aspas/escape, mês/ano consistente com UI, produção decimal com vírgula e Sim/Não/—.
- Proteção de campos textuais com operadores, controles/espaços iniciais e variantes full-width; produção numérica negativa não recebe prefixo de texto. Zeros de contrato preservados nos bytes do CSV.
- Lotes de 100, autorização/identidade/papel/escopo revalidados e coerência de seleção/total entre lotes. Limites de 10.000 linhas e 5 MiB com 413, sem truncamento; alteração detectada de dados gera 409. Falha/revogação não envia anexo parcial.
- Botão junto aos filtros recebe href do estado aplicado pelo servidor, prepara download via Blob, bloqueia repetição, anuncia estado/erro e permite nova tentativa. Mudança do recorte aplicado cancela a requisição pendente; trocar só página/tamanho não altera o conteúdo exportado.
- Produção continua protegida; sem nova dependência ou alteração de métrica.

## Arquivos

Em painel-produtividade: app/api/{v1,demo}/productivity/export/route.ts; modules/productivity/domain/productivity-csv.ts e reference-month.ts; application/export-productivity-csv.ts; presentation/productivity-export-http.ts, format-decimal.ts, dashboard-filters.tsx e local-preview.tsx; components/dashboard/csv-export-action.tsx e dashboard-actions.tsx; tests/unit/productivity-csv.test.ts, productivity-export.test.ts e csv-export-action.test.tsx; tests/unit/dashboard-actions.test.tsx; tests/integration/production.test.mjs; e2e/productivity-export.spec.ts e dashboard-actions.spec.ts; README.md e modules/productivity/README.md. Também CONTRATOS_API.md, docs/DECISOES.md, docs/CHECKLIST_PARIDADE.md e este relatório.

## Validação

32 novos testes unitários passaram na execução isolada. O teste de BOM foi ajustado para comparar bytes como array comum, evitando diferença de realm Node/jsdom; o teardown de mocks de fetch foi limitado ao próprio fetch para não remover ResizeObserver do setup. Não eram falhas do serializador ou do navegador. TypeScript aprovado e 12 cenários iniciais de navegador passaram.

Validação da seleção completa: código 0. Vitest: 278 testes passaram em 18 arquivos. Build aprovado. HTTP de produção: 19 testes passaram, incluindo CSV privado 401, demo 404, HEAD sem arquivo e POST 405. Playwright: 62 cenários passaram em desktop/mobile, com --trace off, incluindo exportação, tabela, filtros, acessibilidade e APIs afetadas. O download do navegador teve BOM e as quatro linhas esperadas do recorte, embora a tabela exibisse apenas duas na página atual. O caso de 205 linhas confirmou leitura de três lotes, sem deduplicação nem limitação pela página solicitada.

O lint inicial apontou um parâmetro sem uso em teste; removido. Lint e TypeScript finais foram repetidos e passaram sem avisos, código 0. Total da seleção: 359 testes aprovados, nenhum ignorado. Não representa execução de toda a suíte visual do projeto; gráficos sem alteração mantêm cobertura anterior. Avisos de ambiente NO_COLOR/FORCE_COLOR não causaram falhas. CI remoto não executado.

## Limites

O arquivo completo é montado sob os limites antes de enviar headers, priorizando não liberar dados parciais em falha. O adaptador é sintético: snapshot transacional de SQL, rate limit distribuído e auditoria persistente ainda dependem da infraestrutura real. Coerência de contagem/seleção não detecta toda mutação de valores com contagem igual; não é garantia de snapshot de banco. A exportação privada continua bloqueada até a integração real.

Excel/LibreOffice não foram executados. A proteção do arquivo gerado é testada; não se declara garantia universal após regravação/reabertura em todos os leitores. CSV não define tipos de coluna; importe Contrato como Texto para manter zeros na planilha. Referência de segurança registrada em docs/DECISOES.md.

Nenhum dado empresarial, usuário real, migração ou publicação. docs/etapas/08-detalhamento.md permanece ausente e o checklist formal do backlog não foi marcado. Próximo passo recomendado: E08-T04 — unificação/revisão do estado de filtros e detalhamento.
