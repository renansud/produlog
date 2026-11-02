# E01-T04 — Pipeline local e qualidade

Data: 2026-10-31. Status: escopo local implementado; ferramentas e navegador autorizados e instalados.

## Implementado

- `npm run check`: lint → TypeScript → testes unitários → build → testes HTTP → testes de navegador, interrompendo na primeira falha.
- `npm test`: Vitest uma vez; `test:watch`: observação; `test:coverage`: cobertura da galeria; `test:e2e`: Playwright; `test:http`: testes sobre o último build.
- Vitest 4, cobertura V8, Vite 7, plugin React 5, Testing Library, jsdom e Playwright instalados com versões no lockfile. A combinação evita conflito Babel sem forçar a resolução de dependências.
- Dois testes unitários verificam entrada de texto, alternância de checkbox pelo rótulo e foco do diálogo ao fechar por Escape.
- Seis testes Playwright verificam três cenários em desktop e mobile Chromium: teclado/foco do diálogo, pesquisa/seleção/restauração e notificações sem transbordamento horizontal ou erros de JavaScript no cenário de feedback.
- `npm run test:install` baixa Chromium e utilitários em `.tools/playwright`; relatórios, cobertura, traces e capturas ignorados pelo Git.
- Cinco testes em `tests/integration/production.test.mjs`, usando `node:test` e servidor Next.js real no loopback com porta livre. O teste encerra seu servidor.
- `.node-version` define Node.js 24, compatível com o runtime local.
- Workflow manual `.github/workflows/quality.yml`, preparado para Windows e Linux com instalação pelo lockfile, Chromium e o mesmo comando de qualidade. Sem deploy ou segredos; não executado remotamente.

## Arquivos

Em `painel-produtividade/`: `package.json`, `package-lock.json`, `.node-version`, `vitest.config.mts`, `playwright.config.mts`, `tsconfig.json`, `eslint.config.mjs`, `tests/setup.ts`, `tests/unit/component-demo.test.tsx`, `tests/integration/production.test.mjs`, `e2e/local-demo.spec.ts`, `scripts/install-test-browser.mjs` e `README.md`. Também `.gitignore`, `.github/workflows/quality.yml` e `docs/DECISOES.md`.

## Validação executada

`npm run check` terminou com código 0:

- ESLint: sem erros ou avisos.
- `tsc --noEmit`: sem diagnósticos.
- `next build`: compilação, TypeScript e geração de páginas concluídos.
- Vitest: 2 testes passaram.
- Runner Node: 5 testes passaram.
- Playwright: 6 testes passaram, nos perfis desktop e mobile.
- Total: 13 testes passaram, sem ignorados.

`npm run test:coverage` também passou. Cobertura da galeria: 80% das linhas, 100% dos ramos, 57,14% das funções e instruções. O escopo é somente `components/demo/`, não a aplicação inteira. As capturas desktop e mobile foram inspecionadas visualmente.

Casos: GET / em produção retorna 404 sem a galeria; HEAD / retorna 404 e corpo vazio; `/dashboard`, `/api/v1/productivity` e `/api/v1/productivity/export` retornam 404.

Os testes HTTP demonstram a preservação das fronteiras atuais. Os testes de interface exercitam as interações da galeria; não validam autenticação, RBAC, métricas nem acessibilidade completa. Os testes deverão evoluir quando as rotas de negócio forem implementadas.

## Autorização e limites

A revisão automática inicialmente rejeitou a instalação das ferramentas por exigir autorização explícita para dependências pesadas. Após a confirmação do responsável, a instalação foi aprovada e realizada. Não existe bloqueio de autorização pendente.

O navegador de testes está no workspace, sem login real e sem dados empresariais. O servidor local já existente foi reutilizado; os testes HTTP encerram o servidor de produção que iniciam. A matriz Linux/Windows do CI está preparada, mas só a execução local Windows foi verificada. Avisos do ambiente sobre NO_COLOR/FORCE_COLOR não impediram os testes. O npm reportou postinstall não aprovado de esbuild/unrs-resolver; nenhuma liberação adicional foi necessária para os comandos passarem.

O roteiro original `docs/etapas/01-fundacao.md` continua ausente. O backlog permanece pendente até conferir os critérios completos. Próximo passo recomendado: E01-T05.

Referências: [runner nativo Node.js](https://nodejs.org/api/test.html), [checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node). As orientações de teste Next.js foram consultadas na documentação distribuída com o pacote instalado.
