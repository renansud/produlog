# E01-T01 — Fundação local

Data: 2026-10-31. Status: parcial na checklist; base implementada e verificada, aguardando o roteiro original `docs/etapas/01-fundacao.md` para conferir todos os critérios de aceite.

## Entrega

- Aplicação em `painel-produtividade/`: Next.js 16.4.3 App Router, React 19, TypeScript estrito, Tailwind 4 e ESLint.
- Dependências instaladas via npm; `package-lock.json` gerado para reprodutibilidade.
- Página inicial em português, tema escuro e layout responsivo. Indicadores sem valores; não há dados empresariais ou cálculos de métricas.
- Demonstração limitada a desenvolvimento e servidor no loopback. Nenhuma conexão Supabase, autenticação real ou publicação.
- Script `iniciar-local.ps1` e README com instruções de execução.
- Node.js v24.22.2 portátil em `.tools/`, ignorado pelo Git.
- A autorização para antecipar a fundação local foi registrada em `docs/DECISOES.md`.

## Arquivos

`painel-produtividade/{package.json,package-lock.json,tsconfig.json,next-env.d.ts,eslint.config.mjs,postcss.config.mjs,README.md,iniciar-local.ps1,AGENTS.md}`, `painel-produtividade/app/{layout.tsx,page.tsx,globals.css}`, `.gitignore` e `docs/DECISOES.md`. O AGENTS.md interno foi gerado pelo Next.js; as regras da raiz continuam aplicáveis.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| npm install | 358 pacotes instalados; lockfile gerado |
| npm run lint | Passou sem erros ou avisos após correção do PostCSS |
| npx --no-install tsc --noEmit | Passou sem diagnósticos |
| npm run build | Passou; compilação e TypeScript concluídos |
| Desenvolvimento GET / | 200; título e aviso “Sem login real” presentes |
| Desenvolvimento GET /dashboard | 404 |
| Build de produção GET / | 404; demonstração indisponível |

Não há script `npm test`: o runner pertence à E01-T04 e não foi antecipado. As verificações HTTP foram executadas sem ferramenta de navegador; a aparência e o comportamento em diferentes tamanhos ainda exigem revisão visual. Ambos os servidores de verificação foram encerrados.

## Pendências e limites

- Não há filtros, gráficos, tabela, alternância de tema ou shadcn/ui nesta fundação. Próximo passo: E01-T02.
- Descoberta E00 continua pendente; não foi atribuído ano à origem nem aprovada interpretação de metas reais.
- O npm avisou que ESLint 9.39.5 está fora de suporte e que o postinstall de `unrs-resolver` não foi autorizado automaticamente. Lint e build passaram; nenhuma liberação adicional de scripts foi feita.
- O roteiro da Etapa 01 não está presente. Nenhuma tarefa do backlog foi marcada sem a conferência dos critérios completos.
