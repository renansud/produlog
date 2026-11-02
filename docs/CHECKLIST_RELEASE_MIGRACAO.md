# Checklist de release e migração — Servlog

Preparado na E10-T05 em 2026-11-01. Estado atual: demonstração local validada com dados fictícios; produção não liberada. Este documento é um plano de verificação, não autorização para executar migrações, criar usuários, transferir dados ou publicar.

Os itens marcados descrevem evidências locais existentes. Itens abertos exigem implementação ou validação no ambiente indicado. Registrar evidência, data e responsável ao concluir cada item; não marcar um aceite real com base apenas em mocks.

## Evidências disponíveis

- [x] Métricas, filtros, cards, gráficos, tabela e CSV têm testes sintéticos: [matriz de paridade](CHECKLIST_PARIDADE.md) e [E10-T01](ENTREGA_E10-T01.md).
- [x] Suíte integral de navegador executada na [E08-T05](ENTREGA_E08-T05.md): 136 cenários aprovados naquela versão. Não representa automaticamente toda versão futura.
- [x] Matriz dos seis handlers, isolamento de operações, erros e cache privados revisados na [E10-T02](ENTREGA_E10-T02.md).
- [x] CSV e ausência de upload revisados na [E10-T03](ENTREGA_E10-T03.md); limite de 10.000 linhas/5 MiB, sem arquivo parcial nos casos testados.
- [x] Responsividade e medições locais registradas na [E10-T04](ENTREGA_E10-T04.md): 348 unitários, 20 HTTP e seleção de 48 cenários de navegador aprovados; tempos de desenvolvimento não são SLA.
- [x] Build de produção mantém demonstração indisponível e APIs privadas sem sessão em 401 nos testes existentes. A implementação futura deve oferecer dashboard protegido, preservando a separação dos dados fictícios.

## Condições anteriores à homologação com dados reais

| Condição aberta | Tarefas relacionadas | Evidência necessária |
| --- | --- | --- |
| Documentos originais de fase e aceites conferidos | E00 / E10 | docs/etapas/10-qualidade.md ausente; recuperar/conferir, sem inventar aceite |
| Fonte oficial, ano das competências, formatos de meta e identidade confirmados | E00-T01/T02 | Registro de decisão do responsável de negócio; tratar homônimos/múltiplos escopos e metas nulas |
| Responsáveis, perfis/operações e finalidade/retenção definidos | E00-T03 | Matriz aprovada e responsáveis por negócio, acesso e dados; sem dados pessoais neste checklist |
| Sessão real e dashboard protegido implementados | E02-T01–T05 | Login/logout/reset, convite privado, refresh/expiração, perfil ativo e escopo no servidor |
| Modelo, migrações e repositórios implementados | E03-T01–T05 | Schema revisado, Decimal para produção, índices, migração em desenvolvimento e seed sintético |
| Importação validada e auditada | E04-T01–T05 | Preview, limites, ano explícito, quarentena, transação e repetição idempotente |
| Operações reais de ADMIN disponíveis e protegidas | E02 / E04 | USER não executa inserção de dados/criação de usuários por URL ou chamada direta |

## Preparação dos ambientes

- [ ] Definir responsáveis por execução técnica, aceite de negócio, acesso/privacidade e decisão de interrupção. Nomes/contatos ficam no registro operacional restrito, não neste repositório.
- [ ] Registrar versão/commit do candidato, lockfile, versões de runtime, migrations e checksums dos artefatos. Git/CI e versão publicável ainda precisam de evidência; não usar relatórios antigos como prova do candidato.
- [ ] Isolar desenvolvimento, homologação e produção: bancos, identidades, credenciais, permissões e configuração. Preview não aponta para dados empresariais de produção.
- [ ] Inventariar nomes das variáveis necessárias e validá-las com Zod. Valores/URLs com senha permanecem no armazenamento de segredos do ambiente; nenhuma credencial neste documento, logs, cliente ou Git.
- [ ] Revisar privilégios de runtime/migração e política de RLS/grants/Data API conforme SEGURANCA.md. A autorização Prisma deve aplicar operações permitidas em cada consulta.
- [ ] Validar URLs de retorno/reset e cookies no ambiente real, signup público desabilitado e contas por convite. Criação de usuários reais exige autorização explícita.
- [ ] Definir janela, indisponibilidade tolerada, orçamento de desempenho, volume esperado e limites de concorrência/exportação com os responsáveis.
- [ ] Definir logs sanitizados, alertas de erro/acesso negado, auditoria e rate limit. Não registrar linhas de funcionários ou tokens.

## Ensaio de migração em ambiente isolado

1. Identificar a fonte autorizada e o recorte de ensaio. Usar amostra autorizada/anonimizada; registrar origem, competência, quantidade e checksum do arquivo em ambiente restrito. Congelar a versão da fonte usada na comparação.
2. Preparar banco isolado vazio ou de ensaio conforme o plano revisado. Revisar cada migration e compatibilidade entre versão antiga/nova. Não executar migrações durante builds automáticos de preview.
3. Gerar backup/snapshot quando houver estado a preservar; registrar como localizar e restaurar sem expor credenciais. Ensaiar a restauração e verificar integridade/tempo, em vez de confiar apenas na existência do backup.
4. Executar preview do importador implementado: limites de corpo/arquivo/linhas, tipos/colunas, decimais pt-BR, ano explícito, contratos com zeros, metas desconhecidas e quarentena. Rejeitar arquivo inválido antes da gravação definitiva.
5. Executar importação transacional identificada por lote e repetir o mesmo snapshot. Conferir ausência de duplicação, linhas rejeitadas/quarentena e relatório de qualidade; preservar divergências, sem corrigi-las silenciosamente.
6. Reconciliar por competência/operação/supervisor: contagem de linhas, técnicos distintos, soma de produção exata e média por linha; metas por técnico-mês e supervisor × técnico × mês. Conferir mensal ignorando somente Mês e evolução último percentual menos penúltimo, sem arredondamento intermediário.
7. Comparar fonte autorizada, domínio, banco, API, UI e CSV com o mesmo recorte. CSV inclui pesquisa/ordem e todas as páginas. Registrar diferenças e obter aceite de negócio; não copiar dados reais para fixtures/relatórios públicos.
8. Testar usuários de homologação de cada papel, escopo cruzado, desativação/expiração, importação/admin, exportação e parâmetros adulterados. Comprovar isolamento no SQL e ausência de exposição por Data API.
9. Medir o candidato compilado com volume/concorrência e rede representativos; conferir planos/índices/pool, memória, tempos e limites aprovados. Validar desktop/mobile e navegadores definidos para suporte.
10. Ensaiar interrupção e recuperação. Guardar resultado e duração do ensaio; atualizar o plano antes de propor produção.

## Verificação do candidato

- [ ] Executar lint, TypeScript, Vitest, build e HTTP de produção do candidato. Corrigir falhas e registrar saídas, sem somar repetições como testes distintos.
- [ ] Executar suíte integral de navegador com artefatos arquivados junto à versão. `test-results/` e `playwright-report/` locais são sobrescritos e não constituem arquivo permanente.
- [ ] Executar testes reais de autenticação, autorização, SQL/RLS e importação em homologação, além da suíte sintética.
- [ ] Confirmar ausência de segredos no artefato/bundle/histórico publicável e de dados empresariais em fixtures, logs e screenshots compartilháveis.
- [ ] Validar recuperação/backup, alertas e responsável disponível durante a janela.
- [ ] Conferir todos os itens abertos, evidências e aceite do responsável de negócio. Somente então apresentar a versão, o ambiente e o plano concretos para autorização explícita de publicação/migração.

Comandos locais disponíveis na pasta painel-produtividade (não publicam nem migram banco):

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd test
npm.cmd run build
npm.cmd run test:http
npm.cmd run test:e2e -- --trace off
```

## Execução futura da migração e publicação

Esta sequência só se aplica após o candidato passar pelos itens anteriores e haver autorização explícita para o ambiente nomeado.

1. Confirmar responsáveis, janela, versão, destino e backup restaurável. Bloquear escritas/importações concorrentes conforme o plano de consistência aprovado; preservar a fonte de referência.
2. Executar apenas migrations revisadas para o destino verificado, fora do build automático. Não usar db push ou mudança destrutiva em produção como atalho.
3. Importar o lote autorizado, registrar auditoria e reconciliar os mesmos totais do ensaio. Se a fonte mudou, conferir o novo snapshot; não reaproveitar aceites de outro arquivo.
4. Publicar a versão autorizada e executar smoke tests privados: login, escopo, dashboard, filtros, tabelas, CSV, logout e bloqueio após revogação. Nenhum dashboard empresarial anônimo.
5. Observar métricas, erros e integridade durante a janela definida. Registrar o aceite final e a transferência operacional, com evidências e responsáveis.

## Interrupção e recuperação

| Sinal | Conduta prevista |
| --- | --- |
| Dados de outra operação, endpoint empresarial anônimo ou segredo exposto | Interromper disponibilização/exportação e acionar responsável; preservar evidências sanitizadas e tratar credencial conforme plano de incidente |
| Divergência de produção, metas, contagem ou importação parcial | Suspender novas gravações/importações; reconciliar lote/fonte antes de liberar uso |
| Falha de migration, erro elevado ou desempenho fora do limite acordado | Interromper avanço; avaliar compatibilidade e executar o plano de recuperação ensaiado |

Rollback de aplicação não desfaz schema nem dados. Reversão para versão anterior só é opção quando compatível com o schema atual. Para banco/lote, planejar restauração ou correção para frente revisada; não executar exclusões ou migrations reversas destrutivas automaticamente. Definir destino de restauração, perda de dados tolerável, janela e tratamento de escritas ocorridas após o backup antes da execução. Se surgir ação destrutiva fora do plano autorizado, parar e solicitar autorização específica.

## Registro de liberação a preencher

| Campo | Estado atual |
| --- | --- |
| Versão/commit e artefatos arquivados | Pendente |
| Ambiente de destino verificado | Pendente |
| Fonte/lote/checksum e reconciliação | Pendente |
| Responsáveis e janela | Pendente |
| Backup e restauração ensaiados | Pendente |
| Evidências de auth/SQL/importação reais | Pendente |
| Aceite de negócio e autorização de execução | Pendente |
| Resultado final / recuperação / transferência | Não executado |

Próximo trabalho recomendado: E00-T01 — retomar a confirmação da fonte e formatos antes de integrar serviços reais. E02/E03/E04 e a conferência dos documentos originais permanecem dependências; não iniciar E11 automaticamente.
