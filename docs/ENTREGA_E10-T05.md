# E10-T05 — Checklist de release e migração

Data: 2026-11-01. Entrega documental; nenhuma publicação, migration, importação ou criação de usuário executada.

## Entrega

[CHECKLIST_RELEASE_MIGRACAO.md](CHECKLIST_RELEASE_MIGRACAO.md) reúne as evidências das tarefas locais e as condições ainda abertas. O documento inclui responsáveis a designar, identificação do candidato/ambiente, credenciais fora do repositório, ensaio isolado, validação da importação, reconciliação de métricas, autorização real, backup/restauração, desempenho, aceite, sequência futura e critérios de interrupção/recuperação.

Os únicos itens marcados referem-se a entregas locais já documentadas. Nenhum teste sintético foi convertido em aceite de Supabase, SQL/RLS, importação ou produção. O checklist diferencia rollback da aplicação de recuperação de schema/dados e exige compatibilidade/ensaio antes de qualquer execução futura.

O plano reutiliza as regras do repositório; não contém comandos de migração de um schema inexistente nem credenciais, nomes de funcionários ou dados empresariais. A estratégia de hospedagem não foi alterada. Google Sheets continua opcional após MVP.

## Arquivos

Criados docs/CHECKLIST_RELEASE_MIGRACAO.md e este relatório. Atualizados docs/CHECKLIST_PARIDADE.md e painel-produtividade/README.md para apontar ao checklist. Código, testes de comportamento, dependências e infraestrutura permanecem sem alteração. Não foi adicionada nova decisão de arquitetura ou regra de negócio a DECISOES.md.

## Validação

Revisados os links e a consistência dos critérios com ROADMAP.md, BACKLOG.md, REGRAS_NEGOCIO.md, ARQUITETURA.md, SEGURANCA.md e relatórios E10-T01–T04. Os destinos dos links relativos dos dois documentos novos foram verificados no filesystem, sem links ausentes.

Verificações executadas na pasta painel-produtividade, com Node portátil no PATH e sequência interrompida em caso de falha:

- npm run lint: código 0.
- npx tsc --noEmit: código 0.
- npm test: 348 testes aprovados em 20 arquivos.
- npm run build: código 0, compilação e TypeScript aprovados.
- npm run test:http: 20 testes aprovados, sem falhas ou ignorados.

Total desta execução: 368 testes aprovados. A sequência terminou com código 0. Não houve nova execução de navegador nem CI remoto, migração, chamada a Supabase ou publicação.

Não se adicionam testes de comportamento para uma mudança exclusivamente documental. Os cenários de navegador foram executados nas E08-T05/E10-T04 e não precisam ser repetidos para esses links/checklists.

## Aceite e pendências

O checklist e o plano estão preparados para revisão. docs/etapas/10-qualidade.md continua ausente, portanto o backlog formal não foi marcado. Auth, banco, importação, fonte/identidade confirmadas, governança e ensaio de recuperação ainda impedem declarar release candidate ou seguir para produção.

Próximo passo recomendado: E00-T01 — confirmar fonte atual, competências e formatos de META BATIDA, retomando docs/REVISAO_E00-T01.md. Não iniciar automaticamente E11 ou conectar dados empresariais; E02/E03/E04 continuam dependências posteriores.
