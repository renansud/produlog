# E01-T02 — Bibliotecas base e shadcn/ui

Data: 2026-10-31. Implementação do escopo local disponível concluída e validada.

## Entrega

- Bibliotecas do COMANDOS_SETUP.md instaladas: Zod, Supabase JS/SSR, Recharts, Lucide e next-themes.
- shadcn/ui configurado pela CLI oficial, com Radix, Tailwind 4, TypeScript e variáveis CSS. Configuração em `components.json`.
- Componentes: Button, Card, Input, Label, Popover, Command, Checkbox, Table, Skeleton, Tooltip, DropdownMenu, Sonner, Dialog e Separator. Textarea e InputGroup foram adicionados como dependências dos componentes solicitados.
- Galeria local com campos, seleção pesquisável, checkbox, diálogo, menu, tooltip, notificação e tabela vazia. Os exemplos não representam filtros de negócio.
- Tema escuro e destaque azul mantidos; rótulos acessíveis da demonstração em português. Fontes de sistema evitam download do Google durante execução e build.
- Nenhuma conexão Supabase, credencial, login real, consulta de dados empresariais ou publicação.

## Arquivos alterados ou adicionados

Em `painel-produtividade/`: `package.json`, `package-lock.json`, `components.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `components/component-demo.tsx`, `components/ui/*.tsx`, `lib/utils.ts` e `README.md`. Decisão registrada em `docs/DECISOES.md`.

## Verificação

| Comando/cenário | Resultado |
| --- | --- |
| npm install (bibliotecas base) | Concluído, 55 pacotes adicionados |
| shadcn init e add | Concluídos; componentes gerados e lockfile atualizado |
| npm run lint | Passou sem erros ou avisos; repetido após localização dos rótulos |
| npx --no-install tsc --noEmit | Passou sem diagnósticos |
| npm run build | Compilação, TypeScript e geração de páginas concluídos |
| GET http://127.0.0.1:3000/ | 200; galeria, botão de notificação, tabela e aviso de ambiente local presentes no HTML |
| GET /dashboard em desenvolvimento | 404 |
| GET / no servidor do build, porta 3003 | 404; demonstração não publicada no modo de produção |

O servidor de desenvolvimento já existente em 127.0.0.1:3000 foi reutilizado e permanece disponível. A tentativa de abrir uma segunda instância identificou o bloqueio esperado do Next.js; o servidor adicional de produção usado na verificação foi encerrado.

## Limites e critérios pendentes

- Sem runner de testes configurado: `npm test` não foi executado; configuração prevista na E01-T04. Verificações HTTP não substituem testes de interação.
- Sem ferramenta de navegador nesta sessão: foco, navegação por teclado, popovers, notificações e responsividade precisam de conferência visual conforme o checklist do README.
- O roteiro original `docs/etapas/01-fundacao.md` continua ausente. Os itens conhecidos de instalação estão atendidos; o backlog não foi marcado antes da conferência dos critérios completos.
- O aviso npm já conhecido sobre postinstall de `unrs-resolver` continua sem liberação adicional. Os comandos de qualidade passaram.
- Próxima tarefa recomendada: E01-T03. Filtros, gráficos funcionais e tema com alternância pertencem às tarefas posteriores.

Referência usada para instalação: [CLI oficial shadcn/ui](https://ui.shadcn.com/docs/cli).
