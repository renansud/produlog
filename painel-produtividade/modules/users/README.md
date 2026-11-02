# Usuários

Diretório e provisionamento administrativo de contas via Supabase Auth, com app_metadata como perfil transitório até UserProfile/Prisma. Não consulta produtividade nem outras tabelas pela Data API.

- `domain/users.ts`: validação Zod do cadastro/paginação e projeção mínima de conta (e-mail, perfil, situação, data), sem metadados brutos.
- `application/manage-users.ts`: exige users:read/users:create de identidade ativa do servidor antes de acessar a integração; valida payload e trata falhas sem ecoar senha/mensagem do provedor.
- `infrastructure/supabase-users.ts`: Auth Admin listUsers paginado e createUser; nunca executado no browser.
- `presentation/`: composições shadcn de diretório, paginação e modal de cadastro.
- `/admin/usuarios`: ADMIN no layout/página e autorização nos casos de uso/Server Action. Sem autenticação redireciona ao login.
- `/demo/usuarios`: somente desenvolvimento; 21 exemplos sintéticos paginados. Cadastro em memória restrito a example.invalid, sem requisições de escrita, conta real ou senha persistida.

## Configuração privada

Configure `SUPABASE_SECRET_KEY` somente em `.env.local`/variáveis privadas do servidor. Use a chave secreta moderna do projeto Supabase; a publishable não permite Auth Admin. Nunca adicione prefixo NEXT_PUBLIC, publique a chave ou a envie pelo chat. O exemplo de variável fica vazio no repositório. Sem configuração válida, a listagem mostra indisponibilidade e o envio do formulário é bloqueado. Nenhum fallback fictício na rota real.

O administrador define senha inicial com mínimo de 12 caracteres e máximo de 72 bytes UTF-8, confirma a senha e escolhe ADMIN/USER. A conta é criada com e-mail confirmado administrativamente, perfil ativo e operation_ids vazio, sem envio de convite. Essa confirmação confia no ADMIN para verificar endereço e entregar o acesso por canal seguro. Senha pertence somente ao Auth; não gravamos cópias ou a devolvemos em respostas. Campos de senha são apagados após envio; fechar o modal limpa o formulário. Não há alteração obrigatória de senha no primeiro login.

Atribuição de operações, edição/desativação, reset/convites, UserProfile e auditoria persistida continuam pendentes. Novos usuários podem entrar no painel, mas não recebem operações automaticamente. Não executar teste contra produção nem criar conta real sem solicitação explícita.
