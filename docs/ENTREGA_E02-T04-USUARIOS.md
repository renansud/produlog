# E02-T04 — Diretório e cadastro administrativo de usuários

Solicitação: criar uma rota com todos os usuários cadastrados e componente para criar usuários. Escolha do responsável: administrador define senha inicial.

Status: rota, formulário e integração implementados; configuração e validação com contas reais pendentes. Nenhuma conta real foi criada, segredo gravado, política RLS alterada, migration aplicada ou deploy executado. BACKLOG não marcado: a tarefa completa de identidade local/UserProfile ainda não está concluída, e docs/etapas/02-autenticacao.md continua ausente.

## Comportamento

- /admin/usuarios acessível somente por ADMIN, com links na navegação e no dashboard. Página, caso de uso de listagem e Server Action de criação verificam autorização no servidor.
- Diretório de todas as contas Auth do projeto, paginado em 20 registros, incluindo perfis não configurados e inativos. Campos visíveis: e-mail, perfil, situação e data do cadastro. Nunca envia User bruto, user_metadata, identidades ou tokens ao frontend.
- Modal shadcn Dialog com e-mail, perfil USER/ADMIN, senha inicial e confirmação. Senha com mínimo de 12 caracteres e máximo de 72 bytes UTF-8 sem trim/retorno/log/persistência local; controle para mostrar/ocultar; estado pendente impede submissões/fechamento repetidos. Erros seguros e sucesso acessível; fechamento limpa formulário.
- Provisionamento via Auth Admin no servidor, sem login automático nem troca da sessão do administrador. E-mail confirmado administrativamente e nenhum convite enviado, conforme escolha do responsável. active=true e operation_ids=[] definidos no servidor, sem aceitar escopo/permissões do formulário.
- Sem SUPABASE_SECRET_KEY válida, diretório mostra indisponibilidade em vez de zero contas; formulário pode ser inspecionado, mas envio permanece bloqueado. Não habilita signup público.
- /demo/usuarios disponível só em desenvolvimento, com 21 exemplos sintéticos. Permite criar usuário fictício em memória com domínio reservado example.invalid. Nada é enviado ao servidor ou mantido após recarregar. Em produção, rota 404.
- Formulário/tabela/paginação usam componentes shadcn existentes. Sem nova dependência, primitive própria ou mudança de ORM.

## Arquivos

`app/(protected)/admin/usuarios/{page.tsx,actions.ts,loading.tsx}`, `app/demo/usuarios/page.tsx`, `modules/users/{domain/users.ts,application/manage-users.ts,infrastructure/supabase-users.ts,presentation/users-directory.tsx,presentation/users-actions.tsx,presentation/demo-users.tsx,README.md}`, `lib/supabase/admin.ts`, `.env.example`, política de permissões, navegação privada, dashboard por perfil e shell de demonstração.

Testes: `tests/unit/{user-management.test.ts,users-gateway.test.ts,admin-client.test.ts,auth-permissions.test.ts}`, `e2e/users.spec.ts`, `tests/integration/production.test.mjs`. Documentação: este relatório, DECISOES, SEGURANCA e CONTRATOS_API.

## Validação

- Vitest completo: 437 testes em 31 arquivos aprovados. Inclui bloqueio de USER/inativo/anônimo antes da integração, paginação, entrada inválida, falha/duplicidade sem ecoar erro interno, ausência de configuração, perfil inválido, sessão administrativa sem persistência e argumentos do Auth Admin com escopo vazio.
- Build e testes HTTP de produção: 30 testes aprovados, incluindo /admin/usuarios protegido e /demo/usuarios indisponível.
- E2E final: 18 testes aprovados em aproximadamente um minuto (desktop/mobile), incluindo 8 testes de usuários e 10 de login/navegação. Listagem/paginação, cadastro fictício/duplicidade/e-mail fora da demo, validação de confirmação, limpeza de senhas, ausência de POST/PUT/PATCH, restauração de foco e Escape, descarte ao recarregar.
- Matriz de 320/768/1280 px, claro/escuro e texto 100%/200%, sem overflow da página/modal. Foi corrigido texto longo e botão que ultrapassava a largura no modal com fonte a 200%; tabela continua com rolagem própria por teclado. Botão de fechar do modal ampliado para alvo mínimo de 44 px, medido após a animação de abertura.
- Regressão de login/navegação incluída na execução final de 18 testes aprovada.
- npm run lint, npm run typecheck (tsc --noEmit), npm test, npm run build e npm run test:http passaram na revisão final. MCP get_compilation_issues sem issues e get_errors sem configErrors/sessionErrors. Bundle público verificado sem referência à variável SUPABASE_SECRET_KEY; auditoria local de publicação aprovada.
- Axe: zero violações no diretório e no modal. Contraste sobre o degradê existente e foco oculto do fundo no Dialog foram marcados como verificações incompletas; teclado/Escape e restauração de foco passaram nos testes de navegador. Não se declara conformidade WCAG integral. Screenshots locais em .tools/users-desktop.png e .tools/users-create-dialog.png, ignorados pelo Git.
- Comandos no sandbox pararam de responder; execução retomada com aprovação automática fora dele, somente para arquivos e testes locais. Nenhuma rejeição automática de aprovação foi recebida.

## Configuração e pendências

Preencher SUPABASE_SECRET_KEY somente no ambiente privado do servidor, com a chave secreta moderna do mesmo projeto, e autenticar com ADMIN ativo. Não usar chave publishable para Auth Admin nem enviar segredo pelo chat. Sem essa configuração não foi possível verificar listagem/cadastro reais; testes usam mocks/fixtures sintéticas.

Novas contas não recebem operações automaticamente. Atribuição de operações, UserProfile/Prisma, edição/desativação, recuperação/convites, troca obrigatória no primeiro acesso e auditoria persistida não foram implementadas nesta entrega. A confirmação administrativa do e-mail exige verificar o endereço e entregar a senha por canal seguro. APIs futuras /api/v1/users continuam propostas; esta entrega usa RSC e Server Action.

Fontes consultadas: [Supabase Admin API](https://supabase.com/docs/reference/javascript/admin-api), [listUsers](https://supabase.com/docs/reference/javascript/auth-admin-listusers), [createUser](https://supabase.com/docs/reference/javascript/auth-admin-createuser), [shadcn Dialog](https://ui.shadcn.com/docs/components/radix/dialog) e guia Forms local do Next.js instalado.
