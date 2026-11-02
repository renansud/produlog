# Roadmap e marcos de entrega

**MVP recomendado:** autenticação privada, importação validada, métricas de paridade, filtros, visualização, CSV, deploy com segurança. Google Sheets periódico é fase opcional após MVP.

| Ordem | Etapa | Objetivo | Marco entregue | Dependências |
|---|---|---|---|---|
| 00 | Descoberta | Congelar regras, formatos e aceites | Checklist de regras validado | — |
| 01 | Base Next.js | Repositório, UI e estrutura modular | App sobe localmente | 00 |
| 02 | Supabase Auth | Login e perfis de acesso | Páginas protegidas | 01 |
| 03 | Prisma + Postgres | Modelo e migrações | BD consultável | 01 e 02 |
| 04 | Importação | Converter Excel/CSV para registros consistentes | Base histórica em Supabase | 03 |
| 05 | Métricas/API | Regras testadas e endpoints | Indicadores confiáveis | 04 |
| 06 | Interface | Layout e filtros multi-select | Dashboard responsivo | 02 e 05 |
| 07 | Gráficos | Performance Mensal e Supervisão | Comparações corretas | 05 e 06 |
| 08 | Tabela/CSV | Detalhes e exportação segura | MVP funcional | 05–07 |
| 09 | Integração Sheets | Sincronização opcional e auditada | Importação automatizada | 04 e 08 |
| 10 | Qualidade | Testes, autorização, performance e LGPD | Release candidate | 02–08; 09 se incluída |
| 11 | Publicação | Vercel, domínio, rollback | Produção com login | 10 |

## Marcos de aceitação

- **M0 — contratos congelados (fim E00):** mês/ano, fonte de verdade, significado de META BATIDA e perfis definidos.
- **M1 — base técnica (fim E03):** projeto Next, autenticação e banco criados com migrações.
- **M2 — paridade dos números (fim E05):** cálculos testados contra casos de referência.
- **M3 — MVP navegável (fim E08):** dashboard completo com filtros, gráficos e CSV.
- **M4 — produção (fim E11):** testes de acesso, backups, deploy e domínio validados.

## Princípios de priorização

1. Segurança e integridade do dado antes de polimento visual.
2. Calcular a métrica uma única vez no domínio e reutilizar nos cards, gráficos e exportações.
3. Usar snapshots do legado apenas como contrato funcional, não copiar lógica acoplada ao DOM.
4. Publicação somente depois de testes de igualdade entre sistema legado e novo.
5. Cada tarefa corresponde a uma alteração testável em branch e commit (ou pequeno grupo coeso).

## Estratégia de entregas

- Desenvolvimento local: Next.js + Supabase dev.
- Preview: Vercel Preview com configuração e base de homologação separadas.
- Produção: Vercel Production + Supabase Production, com autenticação obrigatória.
- Evitar executar migrações de schema durante builds automáticos de previews.
- Após aprovação do MVP, ativar integração automática com Sheets (se necessária).

## Estado inicial

**Todas as tarefas pendentes.** Consulte `BACKLOG.md`. A documentação foi entregue; o projeto React ainda precisa ser criado e desenvolvido.
