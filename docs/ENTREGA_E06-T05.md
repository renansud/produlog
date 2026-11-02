# E06-T05 — Acessibilidade e responsividade

Data: 2026-10-31. Escopo: demonstração local com dados fictícios.

## Alterações

- Região da tabela com nome acessível, foco por Tab, contorno visível e rolagem por setas.
- Navegação permite quebra de linha após constatação de transbordamento em 320 px com fonte a 200%.
- Ações internas dos filtros permitem quebra de linha com ampliação de texto.
- Dezoito novos casos Playwright, distribuídos entre os projetos desktop e mobile, sem novas dependências.

Arquivos em painel-produtividade: components/dashboard/dashboard-shell.tsx, components/dashboard/multi-select-filter.tsx, modules/productivity/presentation/local-preview.tsx, e2e/dashboard-accessibility.spec.ts e README.md. Documentação: docs/DECISOES.md, docs/CHECKLIST_PARIDADE.md e este relatório.

## Evidências

Testes verificam Tab no atalho ao conteúdo e foco no main, foco visível no filtro, Enter para abrir, foco automático na pesquisa, Tab até checkbox, Espaço para selecionar e Escape com retorno ao campo. A tabela recebe foco e, quando há transbordamento interno, responde à seta direita.

Matriz de layout: temas claro/escuro, larguras 320/768/1280 px, fonte normal e ampliada a 200%. Verifica ausência de rolagem horizontal da página, limites dos popovers e ausência de transbordamento interno do menu ampliado. A tabela conserva rolagem própria. Captura do tema escuro em 320 px/fonte 200% inspecionada visualmente; os valores permanecem disponíveis, podendo ocupar mais de uma linha. Capturas estão em test-results, ignoradas pelo Git.

Contraste: cálculo de luminância sRGB a partir dos tokens CSS resolvidos no Chromium, mínimo 4,5:1 para foreground/background, muted-foreground/background, muted-foreground/card, primary/background, primary-foreground/primary, popover-foreground/popover e sinal negativo/card. Não cobre todos os estados, gradientes ou cores possíveis.

## Validação

A execução isolada final dos novos testes passou: 18/18. Pipeline completo `npm run check` terminou com código 0:

- `npm run lint`: sem erros ou avisos de lint.
- `npm run typecheck` (`tsc --noEmit`): sem erros.
- `npm test`: 160 testes unitários passaram.
- `npm run build`: compilação, TypeScript e geração de páginas concluídos.
- `npm run test:http`: 14 testes passaram; páginas/demo indisponíveis e endpoints privados 401 no build de produção.
- `npm run test:e2e`: 54 testes passaram em desktop/mobile.

Total: 228 testes passaram, nenhum ignorado. Os processos Playwright emitiram aviso de ambiente NO_COLOR/FORCE_COLOR, sem falha. Não houve execução de CI remoto. Git não está disponível no PATH desta sessão; nenhuma revisão de diff/commit foi executada por CLI.

O primeiro ensaio revelou o transbordamento da navegação; corrigido e coberto por regressão. Uma execução sobreposta dos testes causou colisão em artefato de trace; a execução seguinte terminou isoladamente sem falhas. Nenhuma dependência foi instalada.

## Limites

Cobertura automatizada Chromium não equivale a auditoria WCAG completa. Não houve teste com leitor de tela, outros motores ou zoom nativo do navegador; a ampliação validada altera a fonte raiz. Gráficos e tabela de dados continuam em preparação nas respectivas tarefas. Autenticação, banco e deploy reais continuam adiados. Não há mudança de regra de negócio.

docs/etapas/06-interface.md não foi fornecido; o checklist formal do BACKLOG.md permanece sem marcação. Próximo passo recomendado: E07-T01, Performance Mensal local com dados fictícios.
