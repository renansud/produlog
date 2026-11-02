# E01-T03 — Organização do monólito modular

Data: 2026-10-31. Escopo local implementado e validado.

## Mudanças

- `app/page.tsx` concentra a verificação de ambiente e a renderização da apresentação.
- Conteúdo da página movido para `modules/productivity/presentation/local-preview.tsx`, mantendo Server Component e conteúdo visual.
- Galeria movida para `components/demo/component-demo.tsx`; imports atualizados e caminho antigo removido.
- Fronteiras de auth, produtividade, importação, usuários e auditoria documentadas em `modules/README.md` e nos READMEs de cada módulo.
- Camadas puras e integrações serão criadas quando necessárias. Não foram criadas abstrações vazias, consultas ou permissões simuladas.
- README da aplicação e `docs/DECISOES.md` atualizados.

## Arquivos

Em `painel-produtividade/`: `app/page.tsx`, `modules/productivity/presentation/local-preview.tsx`, `components/demo/component-demo.tsx`, `modules/README.md`, `modules/{auth,productivity,imports,users,audit}/README.md`, `components/README.md` e `README.md`. A antiga localização `components/component-demo.tsx` foi removida pelo movimento do arquivo. Decisões em `docs/DECISOES.md`.

## Verificação

| Verificação | Resultado |
| --- | --- |
| npm run lint | Passou sem erros ou avisos |
| npx --no-install tsc --noEmit | Passou sem diagnósticos |
| npm run build | Compilação, TypeScript e geração das páginas passaram |
| GET / em desenvolvimento | 200; título, galeria e aviso de ambiente local presentes |
| GET /dashboard em desenvolvimento | 404 |
| GET / no build de produção | 404 |
| Referências ao caminho antigo da galeria | Nenhuma encontrada no código atual |

Não foi adicionado teste unitário para a movimentação sem mudança funcional. `npm test` continua sem configuração; o runner pertence à E01-T04. As verificações HTTP cobriram a preservação das rotas e da restrição de ambiente. Não houve conferência visual automatizada nesta sessão.

O servidor de desenvolvimento existente em http://127.0.0.1:3000 foi reutilizado. O servidor temporário de produção foi encerrado após a verificação.

## Critérios e pendências

Organização por domínio, fronteira cliente restrita à interação e rota inicial fina atendidas. Sem alterações nas métricas, serviços externos ou dependências. O roteiro original `docs/etapas/01-fundacao.md` permanece ausente; o backlog não foi marcado antes da conferência dos critérios completos. Próxima tarefa: E01-T04 — pipeline local e qualidade.
