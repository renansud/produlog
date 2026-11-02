# E02-T04 — Papéis ADMIN e USER

Data: 2026-11-01. Alteração de política solicitada pelo usuário; implementação local sem criar usuários ou alterar Supabase de produção.

## Matriz

| Permissão | ADMIN | USER |
| --- | --- | --- |
| Ler produtividade no escopo autorizado | Sim | Sim |
| Exportar CSV dos dados autorizados | Sim | Sim, leitura |
| Criar usuários | Sim | Não |
| Inserir dados de produtividade | Sim | Não |
| Editar/excluir usuários ou dados | Não adicionada | Não |

Identificadores canônicos em maiúsculas. GESTOR/VISUALIZADOR foram substituídos e são rejeitados, sem promoção ou conversão automática. Caso surjam perfis persistidos antigos no futuro, preparar migração revisada antes de alterar produção.

## Implementação

- modules/auth/domain/access-policy.ts: matriz pura com schemas Zod de papel/permissão. Permissões desconhecidas negadas.
- modules/auth/application/require-permission.ts: guard server-only que revalida identidade/perfil ativo/operações a cada chamada. Ausência de sessão gera 401; perfil inválido, inativo, extra permissions no payload ou ação não permitida geram 403.
- modules/productivity/application/productivity-access.ts passa a usar a política central para leitura. Nome ProductivityAccessError preservado como alias para compatibilidade dos handlers.
- Exportação verifica productivity:export inicialmente e entre lotes; as páginas mantêm verificação de leitura/escopo. ADMIN também fica limitado ao conjunto de operações informado pelo servidor.
- Demo e fixtures passam a USER. Testes de autorização dos handlers passam a cobrir os dois papéis atuais; testes de identidade cobrem explicitamente rejeição dos antigos.

O provider é uma fronteira confiável do servidor: ainda precisa consultar sessão validada Supabase e perfil persistido. Não aceitar role/permissões de formulários, URL, localStorage ou user_metadata como fonte de autoridade. A validação Zod não transforma payload do browser em identidade confiável.

## Critérios e limites

A política e os guards estão implementados e testados; não existem ainda telas/serviços reais de criação de usuário ou inserção. Sua futura implementação deve chamar requirePermission antes dos efeitos, validar entradas, revalidar escopo do registro e auditar a operação. O teste de efeito simulado prova o guard, não uma importação/cadastro reais. Nenhuma permissão extra de edição/exclusão foi inferida.

Não houve criação de contas, atribuição de ADMIN a pessoa real, chave secreta no frontend, alteração de tabela/RLS ou deploy. As APIs privadas continuam sem provider real e retornam 401, mesmo que exista cookie Supabase. Login/perfil persistido e primeiro administrador são dependências posteriores, não implementações simuladas nesta tarefa. Leitura/exportação de USER preserva a política de dados autorizados existente, sem liberar operações novas.

docs/etapas/02-autenticacao.md ausente; BACKLOG.md sem marcação formal. A entrega local não conclui autenticação/persistência/CRUD reais.

## Arquivos

Domínio/aplicação auth novos; productivity-access.ts e export-productivity-csv.ts; demo-dashboard.ts; fixtures/productivity.ts; testes unitários auth-permissions, produtividade (filtros/página/exportação/handlers/autorização/paridade) com novas identidades; SEGURANCA.md, MODELO_DADOS.md, CONTRATOS_API.md; README.md da aplicação, modules/auth/README.md, docs/DECISOES.md e este relatório. Relatórios históricos preservam os papéis usados na data de execução.

## Validação

Primeiro recorte de 96 testes de autorização aprovado. Após acrescentar dois casos explícitos de rejeição de leitura por papéis antigos, lint e TypeScript foram repetidos e a suíte inteira terminou com 373 testes aprovados em 23 arquivos. São 24 novos testes de política/guard; sete casos da matriz antiga de três papéis deixaram de existir ao reduzir para dois papéis, sem perda de cenários dos papéis atuais.

Build e 20 testes HTTP de produção aprovados; APIs privadas preservam 401 e demo permanece ausente no build de produção. Auditoria de publicação aprovada, sem valores do ambiente local/padrões detectados. next-env.d.ts foi atualizado automaticamente pelo Next para os tipos do modo desenvolvimento durante a execução de navegador; não houve edição manual desse arquivo.

Playwright executou os 16 cenários selecionados de API/página/CSV em desktop/mobile e registrou todos como aprovados, mas não concluiu normalmente o encerramento do runner, que havia iniciado o servidor de desenvolvimento. A primeira execução foi interrompida após o travamento; a repetição com --global-timeout 90000 voltou a registrar os 16 aprovados e reportou "Timed out waiting 90s for the teardown for plugin setup to run", além de um erro externo aos testes. Portanto, não se declara execução E2E limpa/código 0 dessa rodada. Não houve terceira repetição sem nova hipótese. Investigar o encerramento do runner/plugin no Windows antes do próximo gate de release; não se atribuiu a falha aos guards sem evidência.

Contagem com término confirmado: 393 testes (373 unitários + 20 HTTP). Os 16 cenários observados não são somados a esse total como execução final limpa. Não houve CI remoto, alteração Supabase ou publicação. Avisos NO_COLOR/FORCE_COLOR e conversão LF/CRLF do Git não indicaram falhas de política.

Próximo passo recomendado: E02-T03 — login/logout/reset; depois persistir perfil/escopo e conectar os guards às operações reais de cadastro/inserção em tarefas próprias.
