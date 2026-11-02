# Plano de desenvolvimento — Dashboard de Produtividade Servlog

**Data-base:** 31/10/2026  
**Situação atual:** app Next.js implementado em `painel-produtividade/` com demonstração e testes locais; autenticação, banco/importação reais e publicação ainda pendentes. A documentação abaixo preserva o roteiro inicial.  
**Objetivo:** migrar o dashboard hoje hospedado no Google Apps Script para uma aplicação Next.js com PostgreSQL Supabase, login Supabase Auth, Prisma ORM, shadcn/ui, Zod e Vercel, usando **monólito modular**.

Preparação de publicação: [GitHub, Vercel e Supabase — produtiva](docs/PUBLICACAO_PRODUTIVA.md). A raiz Git contém documentação/CI; configure `painel-produtividade` como Root Directory na Vercel. Credenciais e `subaps.txt` ficam fora do Git. O dashboard local não é disponibilizado pelo build de produção atual.

## Como utilizar com VS Code + ChatGPT/Codex

1. Instale Node.js LTS compatível com a versão estável do Next.js, Git e VS Code. Tenha contas Supabase, GitHub e Vercel.
2. Instale a extensão **Codex** para VS Code, conecte com sua conta ChatGPT e abra uma pasta para o projeto. [Ajuda oficial](https://help.openai.com/pt-br/articles/11369540-using-codex-with-your-chatgpt-plan).
3. Comece pela **Etapa 00** (`docs/etapas/00-descoberta.md`), antes de programar. Não execute várias etapas de uma só vez.
4. Ao criar o projeto Next.js na Etapa 01, copie **`AGENTS.md`**, **`docs/`**, **`.env.example`** e **`referencias/`** para a raiz do repositório; mantenha `AGENTS.md` na raiz.
5. No chat Codex do VS Code, cole o prompt abaixo (ajuste o ID quando avançar):

   > Leia AGENTS.md, docs/ROADMAP.md, docs/REGRAS_NEGOCIO.md e docs/etapas/00-descoberta.md. Execute **somente a tarefa E00-T01**, sem antecipar outras. Mostre os arquivos modificados, testes executados, resultado e dúvidas. Atualize docs/BACKLOG.md quando concluída.

6. Concluída uma tarefa, teste-a, confira seus critérios de aceite, revise as alterações no Git e só então passe à próxima.

## Organização da documentação

| Arquivo | Finalidade |
|---|---|
| `AGENTS.md` | Instruções persistentes para Codex no VS Code |
| `docs/ROADMAP.md` | Fases, dependências, prioridades e entregas |
| `docs/BACKLOG.md` | Checklist sequencial de tarefas |
| `docs/ARQUITETURA.md` | Monólito modular, dependências, diagrama e estrutura |
| `docs/MODELO_DADOS.md` | Entidades, decisões de modelagem e Prisma |
| `docs/REGRAS_NEGOCIO.md` | Fórmulas reais do dashboard, filtros e exemplos |
| `docs/CONTRATOS_API.md` | Endpoints, validação Zod e paginação |
| `docs/UI_UX.md` | Interface, identidade visual, tema e acessibilidade |
| `docs/SEGURANCA.md` | Auth, RBAC, segredos, exportações, privacidade |
| `docs/MIGRACAO_DADOS.md` | Excel/Google Sheets → Supabase, qualidade dos dados |
| `docs/TESTES.md` | Casos unitários, integração, E2E, critérios |
| `docs/DEPLOYMENT.md` | Vercel, ambientes, migrações, rollback, custos |
| `docs/PROMPTS_VSCODE.md` | Prompts para início, tarefa, revisão e correção |
| `docs/DECISOES.md` | ADRs e pontos que precisam de validação |
| `docs/etapas/*.md` | Instruções acionáveis de cada fase |
| `referencias/` | Snapshot do código legado para orientar a migração, sem dados reais |

## Escopo MVP (primeira entrega útil)

- Login com contas criadas por administrador; papéis `ADMIN`, `GESTOR`, `VISUALIZADOR`.
- Aplicação única Next.js, UI responsiva e tema escuro inicial.
- Cards **Técnicos, Evolução, Média de produção, Produção total**.
- Filtros múltiplos: **Mês, Operação, Supervisor**, supervisor dependente das operações.
- Gráfico **Performance Mensal**: percentual de técnicos com meta batida por mês, **não aplica filtro Mês**.
- Gráfico **Performance Mensal Supervisão**: percentual por supervisor, **aplica todos os filtros**.
- Detalhamento pesquisável, classificável e paginado: **Mês, Supervisor, Técnico, Contrato, Produção, Meta Batida**.
- Exportação CSV dos dados visíveis após aplicar filtros, busca e ordenação; inclui todas as páginas.
- Banco Supabase como fonte principal e importação inicial validada de Excel/CSV. Botão de atualizar consulta o banco novamente.
- Importação/sincronização automatizada com Google Sheets: **fase posterior opcional**, não necessária para a primeira entrega.

## Não faz parte do MVP

- Cadastro aberto ao público; painéis públicos sem login; edição indiscriminada de produtividade.
- Microserviços, filas distribuídas, multiempresa SaaS, aplicativo mobile nativo.
- Reproduzir no React o arquivo `Index.html` inteiro como componente monolítico.
- Expor a URL do PostgreSQL, chave secreta Supabase ou service role ao navegador.

## Decisões críticas antes de importar

1. A base original não tinha uma coluna de **ano**; exigir referência de ano ou competência (AAAA-MM) no fluxo de importação. Não juntar janeiro de anos diferentes.
2. Confirmar os valores concretos da coluna **META BATIDA** e tratamento de vazios.
3. Confirmar se o acesso será restrito a uma operação ou se gestores podem consultar várias operações.
4. Definir se a planilha continua alimentando os dados depois do lançamento. Recomendação: Supabase fonte primária, planilha fonte de importação controlada.
5. Licenciamento Vercel: o plano Hobby é destinado a uso pessoal/não comercial; **uso empresarial precisa de plano apropriado**, normalmente Pro. Fonte: https://vercel.com/docs/limits/fair-use-guidelines

## Primeiro comando (somente após concluir Etapa 00)

```bash
npx create-next-app@latest painel-produtividade --yes
cd painel-produtividade
npm run dev
```

`--yes` seleciona os padrões oficiais atuais: TypeScript, ESLint, Tailwind, App Router, Turbopack e alias `@/*`; confirme o resultado antes de avançar. O pacote usará NPM + `package-lock.json` para reprodutibilidade.

> **Nota:** A documentação não cria contas Supabase/Vercel nem implanta um site. A implementação começa pela Etapa 00 com aprovação das regras e depois pela Etapa 01 com o projeto Next.js.
