# UI/UX — reprodução fiel com melhorias

## Layout e identidade

- Cabeçalho com **logo à esquerda**, título `Dashboard de Produtividade` e subtítulo `Acompanhamento operacional`.
- Botões compactos de **atualizar dados** e **modo claro/escuro** à direita.
- **Tema escuro ao abrir**; tema claro opcional; persistência por usuário/browser quando permitido. Evitar flash de tema no carregamento.
- Cores de referência do legado: azul escuro `#0a468f`, azul de destaque `#16a8e6`, azul profundo `#083568`; ajustar contraste WCAG, sobretudo no tema escuro.
- Filtros compactos lado a lado: `Mês`, `Operação`, `Supervisor`, botões pequenos limpar e baixar CSV. Multiseleção por checkbox, ações selecionar tudo/limpar e indicador de quantidade.

## Ordem dos indicadores

1. Técnicos (inteiro).
2. Evolução (percentual em pontos percentuais, com sinal e cor condicional).
3. Média de produção (duas casas decimais).
4. Produção total (duas casas decimais).

## Gráficos

**Performance Mensal** (linha inteira): colunas verticais azuis #16a8e6, borda preta, percentuais acima, linha conectando meses, sem grade/eixo lateral/legenda. Ignora filtro de mês, respeita operação e supervisor.

**Performance Mensal Supervisão** (abaixo, linha inteira): colunas azuis #16a8e6, contorno preto, percentual acima, sem grade. Aplica todos os filtros.

Recomendação técnica: Recharts + componentes de Chart do shadcn/ui (consultar instalação atual); gráficos acessíveis com resumo textual e tooltip, não depender só de cores.

## Tabela detalhada

- Colunas: **Mês, Supervisor, Técnico, Contrato, Produção, Meta Batida**.
- Cabeçalho clicável, ícone de direção crescente/decrescente, `aria-sort`; teclado e leitores de tela.
- Pesquisa textual, paginação do servidor, estado vazio e skeleton durante carregamento.
- CSV via ícone de download junto dos filtros, refletindo ordenação + pesquisa; nenhuma exportação Excel.

## Responsividade

UI/UX, acessibilidade e responsividade são requisitos de toda alteração de interface. Desenvolver mobile-first, preservar hierarquia e consistência de tipografia/espaçamento e tornar claras as ações e consequências. Usar tokens do projeto com shadcn/ui, navegação previsível e feedback de carregamento, vazio, erro e sucesso.

Validar as telas afetadas no navegador em 320, 768 e 1280 px, temas claro/escuro e texto a 200%, registrando evidências e limites. A página não deve transbordar horizontalmente ou cortar controles; tabelas/gráficos podem rolar em contêineres próprios, acessíveis por teclado. Não impedir zoom. Garantir labels persistentes, nomes acessíveis, foco visível, contraste adequado e alvos de toque confortáveis. Informação essencial não deve depender apenas de cor ou tooltip. Validação automatizada não equivale a uma auditoria integral de acessibilidade.

- Desktop ≥ 1024: filtros compactos, 4 cards em uma linha; gráficos largura total.
- Tablet: 2 cards por linha; filtros podem quebrar em 2 linhas.
- Mobile: filtros em coluna, cards em 1–2 colunas; gráficos com rolagem/legendas legíveis; tabela rola horizontalmente.

## Regra obrigatória de componentes

shadcn/ui é o padrão para todos os componentes de interface. Reutilizar os componentes instalados em `components/ui/` e consultar o catálogo oficial antes de implementar novos. Criar um componente UI próprio somente quando não existir componente ou composição adequada no shadcn/ui, registrando a justificativa em `docs/DECISOES.md`.

Componentes de domínio/página devem compor os componentes shadcn/ui em vez de duplicar seus controles. Elementos HTML semânticos de estrutura/conteúdo continuam válidos; não substituem controles de UI disponíveis no shadcn/ui.

## Componentes shadcn/ui previstos

`Button`, `Card`, `Input`, `Label`, `Popover`, `Command`, `Checkbox`, `Separator`, `Tooltip`, `Skeleton`, `Table`, `DropdownMenu`, `Dialog`, `AlertDialog`, `Toast/Sonner`, `Badge`, `Avatar` (se necessário), `Chart` (com Recharts). Ícones Lucide; alternância de tema com `next-themes`.

## Critérios de aceite visual

- Logo e cards mantêm hierarquia; título da página não compete com gráfico.
- Alternar tema não altera valores nem filtros.
- Exportação e refresh mostram tooltip e estado ocupado/erro.
- Gráficos deixam claro o período e percentual, inclusive quando nenhum resultado está disponível.
- Teclas Tab, Enter, Escape funcionam nos menus; contraste adequado em claro e escuro.
