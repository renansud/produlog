# E01-T05 — Identidade visual e logo

Data: 2026-10-31. Status: integração local concluída após recebimento do logo.

## Entrega local

- Componente Server reutilizável `components/servlog-brand.tsx` com Next Image e nome acessível Servlog, utilizando o arquivo fornecido `public/brand/Logo facilities.png`.
- Removido o símbolo genérico S; nenhuma marca oficial foi presumida ou redesenhada.
- Cabeçalho com identificação à esquerda, título e subtítulo Acompanhamento operacional.
- Cores de UI_UX.md centralizadas: `--brand-primary` (#0a468f), `--brand-highlight` (#16a8e6), `--brand-deep` (#083568). Botão principal e foco usam o destaque.
- PNG original preservado: 1815 × 871 pixels, com alpha. Largura de 160px no mobile e 192px a partir de 640px; altura proporcional e suporte branco para leitura no tema escuro.
- Testes de navegador atualizados para conferir marca acessível, carregamento efetivo da imagem, proporção e subtítulo no cabeçalho em desktop e mobile.

## Arquivos

Em `painel-produtividade/`: `components/servlog-brand.tsx`, `public/brand/Logo facilities.png` (fornecido pelo responsável, não editado), `public/brand/README.md`, `modules/productivity/presentation/local-preview.tsx`, `app/globals.css`, `e2e/local-demo.spec.ts` e `README.md`. Decisão em `docs/DECISOES.md`.

## Validação

- `npm run lint`: passou sem erros ou avisos.
- `npm run typecheck` (tsc --noEmit): passou.
- `npm test`: 2 testes unitários passaram.
- `npm run build`: compilação, TypeScript e geração concluídos.
- `npm run test:http`: 5 testes passaram.
- `npm run test:e2e`: 6 testes passaram após corrigir o seletor do cabeçalho. Um header dentro de main não tem o landmark banner implícito; o teste usa o elemento header e o nome acessível da marca.

O pipeline anterior encontrou a falha desse seletor, que foi corrigida. Após integrar o PNG, `npm run check` passou integralmente: 13 testes passando. A captura desktop foi conferida visualmente. Sem dependências novas, login real, dados empresariais ou publicação.

## Critérios pendentes

Logo recebido e integrado; pendência de arquivo resolvida. O roteiro original da etapa continua ausente, portanto o backlog não foi marcado sem conferir os critérios completos. O CI remoto não foi executado. Próximo passo recomendado para manter a validação local: E00-T04 — preparar fixtures sintéticas e checklist de paridade, antes de serviços externos.
