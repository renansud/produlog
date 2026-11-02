# Segurança, privacidade, permissões e conformidade

## Perfis do MVP

| Perfil | Dashboard autorizado | Exportação CSV | Inserção de dados | Criar usuários |
|---|---|---|---|---|
| `ADMIN` | Operações autorizadas pelo servidor | Sim, sob seu escopo | Sim | Sim, via administração no servidor |
| `USER` | Somente operações atribuídas | Sim, como leitura | Não | Não |

Atualizado na E02-T04 por solicitação do usuário: somente ADMIN e USER. GESTOR/VISUALIZADOR deixam de ser aceitos, sem conversão automática. Permissões de edição/exclusão não foram adicionadas. A política está implementada localmente; cadastro de contas via Auth Admin foi implementado em /admin/usuarios e depende da configuração privada SUPABASE_SECRET_KEY; inserção de produtividade ainda depende de persistência. Guard de papel não substitui validação da entrada e escopo da operação no serviço de inserção. Usuário não pode escolher ou promover o próprio papel; perfil e permissões vêm do servidor, nunca do formulário/user_metadata.

O acesso por operação deve ocorrer **na consulta SQL/Prisma**, não apenas ocultando opções do filtro. Nem IDs falsificados, nem busca, CSV ou query direta podem vazar outra operação.

## Supabase Auth e sessão

1. Contas provisionadas por ADMIN; **desabilitar autoinscrição pública**. Por escolha expressa do responsável, /admin/usuarios cria contas com senha inicial definida pelo administrador e confirmação administrativa do e-mail, sem convite. Cabe ao ADMIN verificar o endereço e entregar a senha por canal seguro. Não há troca obrigatória no primeiro login.
2. Email/senha (e opção futura de SSO) gerenciados pelo Supabase Auth. Sem hash/senha própria em Prisma.
3. Seguir padrão oficial Supabase SSR (`@supabase/ssr`): browser/server client, cookies e `proxy.ts` para refresh.
4. Toda página protegida, Route Handler e Server Action validam identidade com `auth.getClaims()`/servidor, perfil ativo e permissão.
5. `proxy.ts` não substitui autenticação/autorização em serviços de negócio.
6. Revalidar permissões no banco, especialmente após desativação de conta ou mudança de papel.

Rotas implementadas na E02-T03: login em /, dashboards /admin/dashboard e /user/dashboard com guards em layouts e páginas. Até UserProfile/Prisma, as páginas usam getClaims + getUser e app_metadata (role, active, operation_ids) administrada no servidor, sem confiar em user_metadata ou papel do formulário. Perfil inválido/ausente bloqueia. APIs de produtividade continuam sem provider de dados real. A demo é isolada em /demo e não aparece em produção. Nenhuma conta/perfil foi provisionada automaticamente. Diretório e cadastro de contas usam Auth Admin no servidor, com users:read/users:create exclusivos de ADMIN. Chave administrativa nunca é exposta no frontend; novas contas têm operation_ids vazio.

## Banco e RLS

- Prisma conectado ao Postgres em servidor pode operar com role capaz de **contornar RLS**, dependendo da credencial. Portanto, políticas Supabase RLS **não** substituem autorização server-side.
- Para dados acessados por Prisma, aplicar escopo obrigatório em todos os repositórios. Não confiar em `operationIds` informados pelo frontend sem interseção com permissões.
- Em tabelas `public`, habilitar RLS e configurar política/grants apropriados ou desabilitar Data API se não usada. Escolher uma abordagem e documentá-la.
- Usar papel Prisma com menores privilégios possíveis. Separar usuário de migração do usuário runtime quando viável.
- Não expor `DATABASE_URL`, `DIRECT_URL`, segredos Vercel, service role nem JSON de service account no cliente ou Git.

## CSV / importações

- Somente endpoint autenticado, com autorização e limitação de exportação; evitar dados de outras operações.
- Proteção contra CSV injection em campos de texto começando com `=`, `+`, `-`, `@`; nunca interpolar HTML da planilha sem escape.
- Validar extensão, tamanho, MIME, estrutura e colunas dos arquivos enviados; limite inicial sugerido de 10 MB (ajustável com justificativa). Usar streaming se necessário.
- Prevenir CSRF em mutações com cookies, verificar origem para operações sensíveis, rate limit de login/import/export e auditoria.
- Não logar linhas completas de colaboradores; logar contagens/códigos e IDs de lote.

## Proteção de dados

Dados de produtividade e identificadores de funcionários exigem controle de acesso, finalidade definida e política de retenção. Definir responsáveis por governança e avaliações LGPD com jurídico/DPO da empresa antes de publicar. Sem dashboard anônimo por padrão.

## Testes obrigatórios de autorização

- Não autenticado: 401 ou redirect para login, nenhum JSON confidencial.
- USER muda query para operação não autorizada: sem dados vazados.
- USER chama serviço de inserção/criação de usuário: 403 antes de qualquer efeito. Rotas ainda ausentes continuam indisponíveis, sem inventar autorização funcional.
- Usuário desativado: acesso bloqueado após revalidação.
- CSV contém somente registros autorizados e não executa fórmulas Excel.
- Dados de produção não são servidos em cache público.
