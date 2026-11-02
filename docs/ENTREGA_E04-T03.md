# E04-T03 — Formulário e conferência de planilhas

Status: parcial na etapa; frontend de conferência implementado. Solicitação adicional do responsável inclui entrada manual no mesmo fluxo da planilha. O banco descrito em MODELO_DADOS.md ainda é proposto. Não foram criadas tabelas, executadas migrations, criados usuários reais ou gravados dados no Supabase de produção.

## Disponível

- `/admin/dados`: rota protegida por ADMIN no layout e na página, com acesso pelo dashboard e navegação administrativa. USER não recebe link de inserção.
- `/demo/dados`: demonstração apenas em desenvolvimento, com instrução para usar dados fictícios, sem login real. Em produção responde 404.
- Formulário dos campos de ProductivityRecord: competência, operação, supervisor, técnico, contrato, produção, meta tri-state, controlador e status. IDs técnicos, papéis, lote e autor não são campos editáveis.
- CSV UTF-8 e XLSX de uma aba. Modelo CSV com cabeçalhos, erros por linha/campo, relatório de recebidos/válidos/inválidos, produção total decimal exata, linhas repetidas, metas indefinidas e produção negativa. Tabela mostra até 20 registros; erros mostram até 20 ocorrências, com total e orientação para corrigir e conferir novamente.
- Validação compartilhada Zod; metas seguem normalizador existente. Sem ano implícito, conversão por float, exclusão automática de duplicatas, criação implícita de dimensões ou vínculo por nome.
- Conferência exclusivamente em memória do navegador. Trocar modo/editar/limpar invalida a prévia; troca de modo preserva os campos preenchidos. Nenhum arquivo é enviado nem registro persistido. Botão de envio fica indisponível e o motivo é exposto.
- Controles shadcn/ui: Card, Tabs, Input, Label, NativeSelect, Alert, Button e Table. Não foi criada primitiva UI própria. Leitor Excel carregado sob demanda.

## Arquivos

App: `app/(protected)/admin/dados/page.tsx`, `app/demo/dados/page.tsx`, `modules/imports/{domain/data-entry.ts,infrastructure/read-entry-file.ts,presentation/data-entry.tsx,README.md}`, `modules/auth/presentation/{role-dashboard.tsx,private-shell.tsx,private-navigation.tsx}`, `components/dashboard/dashboard-shell.tsx`, `components/ui/{tabs.tsx,native-select.tsx,alert.tsx}`, `package.json`, `package-lock.json`.

Testes: `tests/unit/data-entry.test.ts`, `tests/unit/entry-file.test.ts`, `tests/fixtures/entry-workbook.ts`, `e2e/data-entry.spec.ts`, `e2e/auth-routes.spec.ts`, `tests/integration/production.test.mjs`. Documentação: este relatório e `docs/DECISOES.md`.

## Validação

- `npm run lint`: passou.
- `npm run typecheck` (tsc --noEmit): passou.
- `npm test`: 411 testes / 28 arquivos, todos aprovados.
- `npm run build`: compilação e TypeScript aprovados; rotas privadas dinâmicas, demo indisponível em produção.
- `npm run test:http`: 28 testes aprovados, incluindo redirecionamento de `/admin/dados` sem sessão e 404 de `/demo/dados` em produção.
- `npm run test:e2e -- e2e/data-entry.spec.ts e2e/auth-routes.spec.ts --trace off --global-timeout 300000`: 16 testes aprovados em 34,8 s (desktop/mobile). Matriz de 320/768/1280 px, claro/escuro, texto 100%/200%, prévia com tabela e rolagem por teclado; sem overflow da página. Teste observa ausência de POST/PUT no fluxo de conferência. Fixtures exclusivamente sintéticas, incluindo workbook Excel gerado em memória.
- MCP Next.js: `get_compilation_issues` sem issues; `get_errors` sem configErrors/sessionErrors. React DevTools confirma página/shell como Server Components e formulário/controles interativos no cliente.
- `npm run check:publication`: aprovado, 427 arquivos candidatos sem valores do ambiente local ou padrões de credencial detectados (auditoria heurística, sem equivaler a uma análise completa de segredos/histórico).
- Chromium: revisão visual das abas e screenshots locais em `.tools/data-entry-full.png` e `.tools/data-entry-spreadsheet.png` (ignorados pelo Git). Axe 4.12.1: zero violações em ambas as abas após corrigir nome ARIA da região de resultado. Verificação automática de contraste permanece incompleta em nove elementos sobre o degradê existente; não se declara conformidade WCAG integral.

## Pendências e limites

- Antes de salvar: E03 (Prisma/schema/repositórios/catálogos) e E04-T04 (autorização/escopo revalidado no servidor, resolução de dimensões por IDs, homônimos, fonte estável, idempotência/transação e auditoria). Validação cliente nunca autoriza escrita.
- Não há CRUD completo dos cadastros de operação, supervisor e técnico, nem administração de usuários nesta entrega. Os campos de nome são propostas para revisão, não novos cadastros já criados.
- Limites locais: 1 MiB, 1.000 linhas, 20 colunas, 200 caracteres/célula e 10 MiB de expansão declarada de ZIP. ZIP64, senha e múltiplas abas são rejeitados. Cabeçalhos devem seguir o modelo; meses legados exigem ano informado. Contratos numéricos do Excel são rejeitados, pois zeros podem já ter sido perdidos. Fórmulas textuais não são aceitas; nenhum conteúdo é executado.
- Orçamento declarado de ZIP é uma verificação preliminar, não isolamento contra arquivos maliciosos. Antes de um upload real, adicionar isolamento/limites efetivos de memória/tempo, verificação de conteúdo, origem, rate limit e política de retenção no servidor.
- npm audit: 21 avisos (2 baixos, 19 moderados), na árvore de ferramentas ESLint/shadcn; nenhum aviso listado para read-excel-file. Não foi usado `audit fix --force` nem atualizações fora do escopo.
- Documento original `docs/etapas/04-importacao.md` continua ausente. Nenhum item do BACKLOG foi marcado como concluído.

Referências consultadas: [catálogo shadcn/ui](https://ui.shadcn.com/docs/components), [read-excel-file](https://www.npmjs.com/package/read-excel-file), guia Forms da documentação local do Next.js instalado e skill local building-components. Próximo passo recomendado: E03-T01, preparando a camada de banco em ambiente de desenvolvimento antes da persistência.
