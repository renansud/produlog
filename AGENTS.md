# AGENTS.md — regras para ChatGPT/Codex no VS Code

Este repositório será o **Dashboard de Produtividade Servlog**. Não trate o arquivo legado Google Apps Script como arquitetura-alvo.

## Leia antes de alterar qualquer código

1. `docs/ROADMAP.md` e `docs/BACKLOG.md` — escopo e tarefa autorizada.
2. `docs/REGRAS_NEGOCIO.md` — métricas, deduplicação e filtros.
3. `docs/ARQUITETURA.md` — organização do monólito e fronteiras.
4. `docs/SEGURANCA.md` — auth, privacidade e segredos.
5. O arquivo `docs/etapas/NN-*.md` da fase em andamento.

## Contrato de execução

- Trabalhe **somente uma tarefa E##-T## por interação**, salvo instrução explícita. Não reestruture outras fases sem autorização.
- Antes de implementar, diga brevemente quais arquivos serão afetados. Peça informação apenas quando faltar decisão necessária para correção/segurança.
- Use **Next.js estável (App Router), TypeScript estrito, React Server Components por padrão, Tailwind e shadcn/ui**. Evite `'use client'` desnecessário.
- **Frontend com shadcn/ui como padrão obrigatório:** use os componentes adequados do shadcn/ui e reutilize os já instalados em `components/ui/`. Antes de criar um componente próprio, confira os componentes locais e o catálogo oficial atualizado. Só crie uma implementação nova quando não houver componente ou composição adequada no shadcn/ui.
- Componentes de página/domínio podem compor componentes shadcn/ui, sem reimplementar controles existentes como Button, Input, Card, Dialog, Table ou Select. HTML semântico para estrutura e conteúdo continua permitido; não o use para recriar um controle que já tenha alternativa adequada no shadcn/ui.
- Registre em `docs/DECISOES.md` a necessidade de qualquer componente UI próprio: requisito, alternativas shadcn/ui consideradas e motivo da inadequação. Preserve acessibilidade, tokens e testes do comportamento relevante. Não adicione outra biblioteca de UI para substituir o shadcn/ui sem instrução explícita.
- **UI/UX e responsividade são critérios obrigatórios:** desenvolva mobile-first, com hierarquia visual clara, espaçamento/tipografia consistentes, navegação previsível e ações compreensíveis. Use os tokens e padrões shadcn/ui do projeto nos temas claro/escuro.
- Garanta HTML semântico, labels persistentes, nomes acessíveis, foco visível, navegação por teclado, contraste adequado e alvos de toque confortáveis. Apresente estados de carregamento, vazio, erro e sucesso com feedback acessível; não dependa apenas de cor ou tooltip para informação essencial.
- Em alterações visuais, valide as telas afetadas no navegador em mobile, tablet e desktop (referências: 320, 768 e 1280 px), nos dois temas e com texto ampliado a 200%. Evite corte de conteúdo, controles inacessíveis e rolagem horizontal da página; tabelas/gráficos podem ter rolagem própria acessível. Registre a evidência e qualquer cenário não verificado; compilação sozinha não comprova responsividade.
- Um só repositório/implantação; módulos por domínio em `modules/`. Componentes UI puros em `components/`.
- `app/` deve orquestrar rotas/Server Actions; regras de negócio e consultas ficam nos módulos de domínio, não em `page.tsx`.
- Adote camadas `domain` (pura), `application` (casos de uso), `infrastructure` (Prisma/integrações), `presentation` (componentes) quando necessário; evite abstrações vazias.
- Somente servidor acessa Prisma/PostgreSQL. Supabase JS cuida da autenticação; **não duplique acesso ao mesmo dado com Prisma + Supabase Data API no browser**.
- Nunca confie apenas no `proxy.ts` para autorização; proteja Server Actions, Route Handlers e consultas no servidor.
- Use Zod para entradas, parâmetros de URL, uploads, filtros e variáveis críticas. Não aceite permissões passadas no frontend.
- Valores monetários/produção como Decimal no banco (não float financeiro); a métrica % deve ser calculada sem arredondamento intermediário.
- Por padrão, não publique dados de funcionários e não crie página `/dashboard` acessível sem autenticação.
- Não grave senhas, chaves, URLs completas com senha, dados pessoais ou dados reais da planilha em commits, prompts ou logs.
- Para filtros e cálculos, prefira funções puras testáveis. Regra de evolução: **último percentual − penúltimo percentual**, em pontos percentuais, não variação relativa.
- `META BATIDA`: considerar cada técnico **uma vez por mês** (com ressalvas de identificação em `docs/REGRAS_NEGOCIO.md`); preserve divergências visíveis em logs de qualidade.
- `Performance Mensal` ignora **somente Mês**; os demais componentes seguem regras documentadas.
- CSV deve refletir filtros + pesquisa + ordenação e todas as páginas, com proteção contra fórmula injetada.
- Tema escuro inicial; botão para alternar, com acessibilidade e preferência persistida.
- Documente qualquer mudança de critério e adicione teste para ela antes de implementá-la.

## Validação para concluir a tarefa

1. Executar os comandos disponíveis: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` (se configurados). Se não puder, declarar o motivo.
2. Adicionar ou atualizar testes do comportamento alterado, sem quebrar testes existentes.
3. Mostrar resumo de mudanças, arquivos alterados, comandos/saídas e riscos pendentes.
4. Marcar `docs/BACKLOG.md` somente quando todos os critérios de aceite forem atendidos.
5. Registrar decisões não triviais em `docs/DECISOES.md`.

## Não executar sem autorização explícita

- Aplicar migrations destrutivas/`db push` em produção, deletar dados ou habilitar signup público.
- Criar usuários reais, compartilhar dados empresariais ou fazer deploy em produção.
- Adicionar dependências pesadas, um ORM diferente, microserviços ou novo provedor de hospedagem.
- Desabilitar RLS/expor tabelas via Data API para contornar falhas de autenticação.

## Modelo de encerramento da interação

**Tarefa:** E##-T## · **Status:** concluída / parcial / bloqueada  
**Arquivos:** ...  
**Testes:** ...  
**Critérios de aceite:** ...  
**Próximo passo recomendado:** E##-T##.
