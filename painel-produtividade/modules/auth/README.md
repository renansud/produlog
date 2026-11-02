# Auth

E02-T03: / é login; /admin/dashboard e /user/dashboard têm layouts e páginas protegidos por requireRole. Infrastructure/current-access verifica claims e relê getUser para usar app_metadata administrada (role, active, operation_ids), nunca user_metadata. Essa fonte é transitória até UserProfile/Prisma; nenhum perfil real foi provisionado. Login/logout em Server Actions, sem signup ou escolha de papel. Dados reais, cadastro/inserção e reset por token pendentes. Demo isolada em /demo. Ver docs/ENTREGA_E02-T03.md na raiz.

E02-T02: clientes SSR/browser e helper de renovação em lib/supabase, com proxy.ts em /auth/*. Configuração pública validada; cookies propagados à requisição/resposta. Nenhuma autorização de produtividade deve depender apenas do proxy ou de claims sem conferir perfil ativo e operações no servidor. Telas e providers reais continuam pendentes.

Responsável por sessão, identidade e autorização verificadas no servidor. E02-T04 implementa a política local ADMIN/USER em domain/access-policy.ts e o guard server-only em application/require-permission.ts. ADMIN lê/exporta no escopo autorizado, cria usuários e insere dados; USER lê/exporta, sem escrita. Papéis antigos e permissões desconhecidas são rejeitados.

Antes de cadastro/inserção, usar requirePermission com users:create ou productivity:insert, depois validar entrada e escopo do registro. Não existe ainda persistência de perfil nem endpoints reais dessas operações. O provider deve consultar sessão validada e perfil no servidor; nunca usar role de formulário/user_metadata. Regras atuais em SEGURANCA.md e docs/ENTREGA_E02-T04.md na raiz do repositório.

Supabase Auth fornecerá identidade. Casos de uso devem conferir perfil ativo e escopo por operação; o proxy não substitui essa verificação. Criar `domain/`, `application/` e `infrastructure/` quando necessários.
