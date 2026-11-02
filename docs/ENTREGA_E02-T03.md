# E02-T03 — Login inicial e rotas por papel

Data: 2026-11-01. Escopo desta interação: página inicial com login, rotas ADMIN/USER e dashboards separados, mantendo demo isolada. Nenhuma conta ou perfil real foi criado; sem alterações no Supabase de produção ou deploy.

## Rotas

| Rota | Comportamento |
| --- | --- |
| / | Login público com e-mail/senha; sessão com perfil válido segue ao próprio dashboard |
| /auth/login | Alias para / |
| /admin e /admin/dashboard | ADMIN; sem sessão segue ao login; USER segue ao próprio dashboard |
| /user e /user/dashboard | USER; sem sessão segue ao login; ADMIN segue ao próprio dashboard |
| /dashboard | Entrada que escolhe o destino por perfil verificado |
| /auth/logout-error | Feedback e nova tentativa quando logout falha |
| /demo | Dashboard fictício anterior, disponível somente em desenvolvimento |
| /componentes | Galeria fictícia, somente desenvolvimento |

App Router com grupo (protected), layouts por papel e páginas que revalidam acesso. O guard também é chamado nas páginas: layouts não são a única barreira. Proxy renova cookies nas entradas de autenticação/rotas privadas e inicial; não decide permissões. APIs de produtividade permanecem fechadas pelo provider sem acesso real e os repositórios de dados reais continuam pendentes.

Login usa Server Action, useActionState, validação Zod antes da chamada, mensagens sanitizadas e destinos fixos. Não existe signup público, escolha de papel, senha em query/log ou redirectTo arbitrário. Logout usa a sessão atual no servidor e escopo local, com falha apresentada sem alegar sucesso. Recuperação de senha é orientada ao administrador; envio de e-mail/reset por token não faz parte desta entrega e continua pendente da E02-T03 completa.

## Identidade e perfil transitório

O adaptador server-only consulta getClaims e, quando há identidade, getUser para reler o registro confirmado pelo servidor. IDs precisam coincidir. O papel não é lido do JWT antigo nem de user_metadata. A fonte transitória é app_metadata administrada por operação privilegiada no servidor; campos exigidos:

```json
{"role":"ADMIN","active":true,"operation_ids":[]}
```

Esse JSON é somente o contrato de configuração; nenhum usuário recebeu esse perfil nesta tarefa. USER usa role USER, e os IDs de operação devem vir da futura base autorizada. Perfil ausente, desconhecido, inativo ou sem campos obrigatórios bloqueia os dashboards. Ninguém recebe ADMIN/USER automaticamente ao autenticar. O primeiro administrador e os demais perfis precisam ser provisionados por procedimento autorizado; não expor chaves privilegiadas ao browser nem aceitar autopromoção pelo formulário.

O modelo UserProfile/Prisma continua planejado para persistência de negócio. Este adaptador mantém as páginas utilizáveis com perfis administrativos Auth válidos, mas não implementa gestão de usuários, escopo SQL ou sincronização com UserProfile. cache do React deduplica a leitura somente na requisição RSC, sem usuário global ou cache compartilhado entre contas. Falhas de configuração/serviço não autorizam: login pode ser exibido, mas guards negam dashboards e autenticação retorna mensagem genérica.

## Dashboards e apresentação

Administrador recebe a área de produtividade e seções de gerenciamento de usuários/inserção marcadas como em preparação. USER recebe a visão de leitura, sem operações administrativas. Ambos mostram estado vazio honesto, sem métricas falsas. Compartilham shell privado com marca, navegação, tema persistido e ação Sair. Formulário tem labels persistentes, autocomplete, campos obrigatórios, feedback de erro/status e bloqueio durante envio.

A demo foi movida de / para /demo; links de navegação, recuperação, redirects e testes de URL foram ajustados. Não houve exposição da demo em produção.

## Arquivos

app/page.tsx, app/demo/page.tsx, app/auth/{actions.ts,login/page.tsx,logout-error/page.tsx}, app/(protected)/{admin,user}/{layout.tsx,page.tsx,dashboard/page.tsx}, app/dashboard/page.tsx; modules/auth/domain/auth-routing.ts, application/sign-in.ts, infrastructure/current-access.ts, presentation/{login-form,require-role,private-shell,role-dashboard}; lib/supabase/session.ts, proxy.ts; DashboardShell e recuperação de detalhamento; testes unitários auth-routing/auth-access/role-dashboard e expectativas da demo/sessão; e2e/auth-routes e URLs das suítes existentes; tests/integration/production.test.mjs; README e documentos de segurança/publicação/decisões.

## Verificação

Validação final: lint, TypeScript e build aprovados. Vitest: 388 testes em 26 arquivos. HTTP de produção: 26 testes aprovados. Suíte integral Playwright: 144 cenários aprovados (72 desktop + 72 mobile Chromium), em 5,8 minutos, sem falhas, ignorados ou retries locais; encerramento concluído com código 0 usando o servidor persistente saudável. Total desta seleção: 558 testes, sem somar execuções repetidas. Os dois testes de apresentação dos dashboards foram adicionados após a primeira execução unitária de 386 casos; lint/TypeScript/suíte unitária foram repetidos após a inclusão. Não houve alteração de código de produto depois do build aprovado.

Auditoria de publicação aprovada: 413 candidatos, sem valores do ambiente local/padrões de credencial detectados. CI remoto não executado. Ajustes de expectativa necessários: links de recuperação passam a /demo; POST multipart sem ação válida na rota ausente passa a ser rejeitado com 400 pela camada Next de Server Actions, em vez do comportamento observado antes de existirem ações. Nenhum endpoint de upload criado.

Compilação/MCP do servidor novo sem issues/configErrors/sessionErrors. Login conferido via snapshot do navegador e árvore React: Server(Login), LoginForm e controles presentes. Captura .tools/login-desktop.png inspecionada; identidade visual, labels e campos íntegros, com rolagem quando a altura da viewport é pequena. Verificação de reflow em 320 px/fonte 200% passou no E2E. Screenshots/JSON/HTML são artefatos locais ignorados pelo Git e sobrescritos em execuções futuras. Não houve teste com leitor de tela nem certificação integral de acessibilidade.

O servidor antigo dos testes anteriores estava travado em 3000; identificação confirmou PID/linha de comando e relação pai-filho do Next deste projeto. Encerrados somente esses processos conhecidos e iniciado next dev limpo, oculto, em 3000. Nenhuma configuração global Git ou serviço de outro projeto foi alterado. A tentativa E2E inicial sem servidor responsivo foi interrompida, sem ser contada como execução válida; a suíte integral foi iniciada com servidor persistente saudável para evitar o travamento anterior no teardown. Após validação, o navegador de teste foi fechado com a mesma sessão/restore e o servidor dev foi mantido disponível para o usuário. A árvore React que faltara na instalação inicial da skill foi obtida com sucesso nesta execução.

## Limites e próximos passos

Não foram enviados e-mails, senhas ou formulários reais ao Supabase durante os testes, nem criadas contas/perfis/migrations. Fluxos com conta real provisionada ainda precisam de homologação. Dados empresariais, cadastro administrativo, inserção e reset de senha real estão pendentes. Login aplica a chave pública configurada pelo usuário; não houve leitura/escrita de tabelas de produtividade ou serviço administrativo remoto.

docs/etapas/02-autenticacao.md continua ausente; backlog formal não marcado. Próximo passo recomendado: E02-T05 — ligar sessão/perfil ao escopo real de dados, após provisionamento autorizado e disponibilidade de persistência; completar reset de senha em tarefa própria.

Referências: [SSR Supabase e verificação](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [metadados e gestão de usuários](https://supabase.com/docs/guides/auth/users), [alteração administrativa de app_metadata](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid), guia instalado de autenticação do Next.js e skills building-components/react-best-practices/next-dev-loop.
