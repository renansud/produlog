# Início rápido — faça exatamente nesta ordem

**Fase 1 — Sem programação:** leia `README.md`, `docs/REGRAS_NEGOCIO.md`, `docs/DECISOES.md` e Etapa 00. Resolva o ano da planilha e os valores de META BATIDA.

**Fase 2 — VS Code:** instale extensão Codex, abra a pasta, leia `AGENTS.md` no chat e peça **E00-T01**.

**Fase 3 — Projeto:** só depois de validar Etapa 00, execute `npx create-next-app@latest painel-produtividade --yes` no terminal do VS Code. Copie documentação e referências para a pasta recém-criada.

**Fase 4 — Incremental:** execute cada E##-T##, validando e marcando `docs/BACKLOG.md`.

**Fase 5 — Lançamento:** não publique até que E10 esteja aprovada e exista licença adequada Vercel para uso empresarial.

### Texto de abertura para o Codex

```text
Estamos migrando um Dashboard de Produtividade do Google Apps Script para
Next.js 16 + Supabase Postgres/Auth + Prisma ORM + Zod + shadcn/ui + Vercel.
A arquitetura é monólito modular. Leia AGENTS.md e docs/COMECE_AQUI.md,
depois execute exclusivamente E00-T01. Não presuma ano ou meta e não use
nenhum dado real de colaborador em commits. Quero alterações pequenas,
testes e um relatório da tarefa antes de prosseguir.
```
