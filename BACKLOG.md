# Backlog de tarefas — checklist rastreável

**Instrução:** altere `[ ]` para `[x]` somente após validação da tarefa. Registre o commit ou evidência no PR.

**Status inicial: todas pendentes.**

## Etapa 00 — Descoberta, regras e escopo
Arquivo: `docs/etapas/00-descoberta.md`

- [ ] **E00-T01** — Confirmar base atual e formatos da META BATIDA
- [ ] **E00-T02** — Aprovar regras de contagem e escopo por operação
- [ ] **E00-T03** — Definir perfis de acesso, dados sensíveis e infraestrutura
- [ ] **E00-T04** — Preparar fixtures e checklist de paridade

## Etapa 01 — Fundação Next.js, TypeScript e UI
Arquivo: `docs/etapas/01-fundacao.md`

- [ ] **E01-T01** — Criar projeto Next.js com defaults
- [ ] **E01-T02** — Instalar bibliotecas base e shadcn/ui
- [ ] **E01-T03** — Organizar pastas do monólito modular
- [ ] **E01-T04** — Definir pipeline local e qualidade
- [ ] **E01-T05** — Migrar identidade visual e logo para public/

## Etapa 02 — Autenticação e RBAC com Supabase
Arquivo: `docs/etapas/02-autenticacao.md`

- [ ] **E02-T01** — Criar projeto Supabase desenvolvimento e variáveis
- [ ] **E02-T02** — Configurar clientes Supabase SSR e proxy.ts
- [ ] **E02-T03** — Criar telas login, logout e reset de senha
- [ ] **E02-T04** — Implementar identidade local e papéis
- [ ] **E02-T05** — Implementar escopo por operação e proteção de handlers

## Etapa 03 — Prisma + Supabase PostgreSQL
Arquivo: `docs/etapas/03-banco.md`

- [ ] **E03-T01** — Instalar Prisma estável e adapter-pg
- [ ] **E03-T02** — Modelar entidades e índices
- [ ] **E03-T03** — Criar migração inicial em banco de desenvolvimento
- [ ] **E03-T04** — Implementar cliente Prisma server-only e repositórios
- [ ] **E03-T05** — Criar seeds sintéticos e testes de conexão

## Etapa 04 — Importação, validação e qualidade dos dados
Arquivo: `docs/etapas/04-importacao.md`

- [ ] **E04-T01** — Construir parser de Excel e CSV com Zod
- [ ] **E04-T02** — Exigir competência ano-mês e tratar ambiguidades
- [ ] **E04-T03** — Criar preview de importação e relatório de inconsistências
- [ ] **E04-T04** — Implementar importação transacional e idempotente
- [ ] **E04-T05** — Criar histórico e auditoria de importações

## Etapa 05 — Métricas e contratos da API
Arquivo: `docs/etapas/05-metricas.md`

- [ ] **E05-T01** — Implementar domínio puro de metas e deduplicação
- [ ] **E05-T02** — Implementar Evolução e KPIs
- [ ] **E05-T03** — Implementar aplicação de filtros e RBAC
- [ ] **E05-T04** — Criar endpoints summary, monthly, supervisors e filters
- [ ] **E05-T05** — Otimizar agregações e índices

## Etapa 06 — Componentes, filtros e tema
Arquivo: `docs/etapas/06-interface.md`

- [ ] **E06-T01** — Criar layout protegido e dashboard shell
- [ ] **E06-T02** — Criar filtros multi-select e dependência supervisor/operação
- [ ] **E06-T03** — Conectar cards a dados seguros da API
- [ ] **E06-T04** — Criar botões compactos refresh, tema, limpar e exportar
- [ ] **E06-T05** — Testar acessibilidade e responsividade

## Etapa 07 — Gráficos de performance
Arquivo: `docs/etapas/07-graficos.md`

- [ ] **E07-T01** — Implementar Performance Mensal
- [ ] **E07-T02** — Implementar Performance Mensal Supervisão
- [ ] **E07-T03** — Garantir consistência de tema, responsividade e tooltips
- [ ] **E07-T04** — Validar paridade matemática e visual

## Etapa 08 — Detalhamento, classificação e CSV
Arquivo: `docs/etapas/08-detalhamento.md`

- [ ] **E08-T01** — Criar API paginada para tabela
- [ ] **E08-T02** — Criar tabela shadcn com ordenação por coluna
- [ ] **E08-T03** — Implementar exportação CSV segura
- [ ] **E08-T04** — Unificar estado de filtros com URL ou controller
- [ ] **E08-T05** — Executar E2E do MVP

## Etapa 09 — Integração Google Sheets (opcional, pós-MVP)
Arquivo: `docs/etapas/09-sheets.md`

- [ ] **E09-T01** — Definir necessidade e autorização da planilha
- [ ] **E09-T02** — Criar adaptador server-side Sheets API
- [ ] **E09-T03** — Reusar pipeline validado de importação
- [ ] **E09-T04** — Criar sincronização manual para ADMIN
- [ ] **E09-T05** — Agendar cron protegido na Vercel se aprovado

## Etapa 10 — Testes, segurança e qualidade
Arquivo: `docs/etapas/10-qualidade.md`

- [ ] **E10-T01** — Executar matriz de testes de métricas
- [ ] **E10-T02** — Validar autorização e vazamento de dados
- [ ] **E10-T03** — Revisar segurança de upload e CSV
- [ ] **E10-T04** — Testar performance e experiência responsiva
- [ ] **E10-T05** — Preparar checklist de release e migração

## Etapa 11 — Hospedagem Vercel e lançamento
Arquivo: `docs/etapas/11-publicacao.md`

- [ ] **E11-T01** — Preparar projeto Vercel e ambientes isolados
- [ ] **E11-T02** — Executar migrations controladas de produção
- [ ] **E11-T03** — Publicar produção com login e domínio
- [ ] **E11-T04** — Migrar dados e conferir indicadores reais
- [ ] **E11-T05** — Testar recuperação e transferir operação
