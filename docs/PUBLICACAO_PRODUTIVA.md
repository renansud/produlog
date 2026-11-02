# Preparação de GitHub, Vercel e Supabase — produlog

Atualizado em 2026-11-02. Destino confirmado pelo responsável: https://github.com/renansud/produlog.git . Visibilidade do repositório não foi alterada. Projeto Supabase fornecido pelo usuário classificado como produção; valores ficam somente no ambiente local e no gerenciador de configuração do destino.

## Estado verificado

- Repositório local inicializado em C:/Users/SERVLOG/Documents/projetos, branch main; primeiro commit local criado, origin definido para renansud/produlog e login GitHub disponível. Conferir o resultado do push no histórico Git; nenhum deploy foi executado pelo agente.
- Aplicação Next.js em painel-produtividade; documentação e workflow na raiz. Um único repositório, sem workspaces ou microsserviços adicionais.
- Clientes Supabase SSR e browser configurados; GET Auth health do projeto fornecido retornou HTTP 200, usando a chave pública local. Isso comprova alcance do serviço Auth e aceitação da requisição, não login, RBAC, RLS, banco ou persistência.
- .env.local e subaps.txt ignorados pelo Git. Artefatos locais, .tools, .vercel e certificados também excluídos. .env.example contém placeholders.
- Auditoria local de publicação compara candidatos do Git com valores de .env.local e alguns padrões de credencial. Não imprime valores. É heurística de arquivos texto atuais, não um scanner universal de segredos ou histórico; revisão humana e proteção de segredos do GitHub continuam necessárias.

## GitHub

1. Destino confirmado: renansud/produlog. Usar o repositório existente; não alterar sua visibilidade.
2. Conferir os candidatos com git status, git diff --cached e npm run check:publication na pasta da aplicação. Não usar git add -f para incluir arquivos privados.
3. Configurar a identidade de commit real do usuário, criar o primeiro commit revisado e só então apontar origin para a URL confirmada. Não inventar nome/email ou remote.
4. Enviar main após confirmação do destino e acesso autenticado. Nenhum token deve ser enviado pelo chat ou incluído em comando/documento.
5. Conferir o workflow quality.yml no GitHub; ele foi habilitado para main, pull requests e execução manual. Não foi executado remotamente nesta preparação. Proteger main com revisão e checks conforme permissões do repositório.

## Vercel

Configuração preparada em painel-produtividade/vercel.json; projeto Vercel e integração Git ainda não foram criados.

| Campo | Valor a configurar no projeto Vercel |
| --- | --- |
| Git Repository | renansud/produlog |
| Framework | Next.js |
| Root Directory | painel-produtividade |
| Node.js | 24.x, conforme engines e .node-version |
| Install Command | npm ci |
| Build Command | npm run build |
| Output Directory | Padrão do framework; não usar out |
| Production Branch | main, após os aceites e autorização de produção |

Root Directory é uma configuração do projeto Vercel; não foi inventada uma propriedade rootDirectory em vercel.json. A integração Git pode disparar deploy no import/push: a criação/vinculação deve acontecer apenas com o candidato e destino revisados.

Variáveis necessárias atualmente: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Cadastrar os valores diretamente no ambiente de destino, sem colocá-los no repositório. As duas são públicas por contrato; nunca usar chave secret/service-role ou senha em NEXT_PUBLIC_. Prisma 7.10.1 e schema estão implementados: DATABASE_URL e DIRECT_URL são privadas e já passaram em SELECT 1 via Prisma com CA/TLS verificados. No destino, configurar as URLs apropriadas ao ambiente e caminho do certificado público incluído em prisma/certs. Migration inicial não foi aplicada; nenhum dado real foi conectado às telas.

Como o projeto informado é produção, não reutilizar suas credenciais/dados automaticamente em Preview/Development. Criar ou selecionar projeto Supabase separado de homologação antes de configurar esses ambientes. Não copiar segredos de produção para executar testes ou CI; os testes atuais usam dados sintéticos.

## Supabase

Sem alterações remotas executadas. Antes de conectar usuários/dados reais:

- Homologar login/logout e perfis ADMIN/USER já implementados nas páginas; completar reset de senha, perfil persistido de negócio e E02-T05 para operações autorizadas em cada consulta/ação/handler. Nenhuma conta/perfil real foi criada nos testes locais.
- Conferir no painel Supabase se signup público está desabilitado e se os convites são administrados. Essa configuração ainda não foi inspecionada nem alterada.
- Após existir URL de homologação/produção e rotas de callback/reset implementadas, cadastrar Site URL e Redirect URLs exatas correspondentes. Não cadastrar rota fictícia ou wildcard amplo de produção.
- Implementar E03/E04 antes de conectar produtividade: schema/migrations revisadas, privilégios mínimos, RLS/grants/Data API conforme política, repositório server-only, importação validada e backup/restauração.
- Testar auth, escopo e dados primeiro em ambiente isolado. O proxy renova sessão nas entradas inicial, /auth/*, /admin/*, /user/* e /dashboard, sem autorizar dados. Layouts e páginas fazem verificação independente no servidor; dados empresariais ainda não estão conectados.

## Impedimento atual para publicar um dashboard utilizável

Após E02-T03, o build de produção exibe login em /, protege /admin/dashboard e /user/dashboard por sessão/perfil e retorna 404 na demo (/demo). APIs de produtividade ainda retornam 401 sem provider real. Dashboards privados começam vazios; publicação ainda não disponibiliza a base empresarial. Não remover essas proteções como atalho para habilitar login simulado ou expor dados fictícios/empresariais em produção. Perfil transitório via app_metadata administrada e limites documentados em ENTREGA_E02-T03.md.

GitHub pode receber o código privado revisado antes de o produto estar pronto, mas publicar o dashboard em produção exige concluir auth/perfis, banco/importação e os aceites de negócio/recuperação em [CHECKLIST_RELEASE_MIGRACAO.md](CHECKLIST_RELEASE_MIGRACAO.md).

## Comandos locais

Na pasta painel-produtividade:

```powershell
npm run check:publication
npm run test:publication
npm run lint
npm run typecheck
npm test
npm run build
npm run test:http
```

Nenhum comando acima publica, migra ou altera Supabase. Git é pré-requisito da auditoria; no ambiente do agente a diferença de proprietário é tratada somente por -c safe.directory=<workspace>, sem alterar a configuração global ou desabilitar a proteção para outros diretórios.

Referências: [Root Directory na Vercel](https://vercel.com/docs/monorepos), [integração Git](https://vercel.com/docs/git), [Redirect URLs Supabase](https://supabase.com/docs/guides/auth/redirect-urls), [health do Auth](https://supabase.com/kb/troubleshooting/how-do-i-check-gotrueapi-version-of-a-supabase-project-lQAnOR).
