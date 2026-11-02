# Skills de vercel/vercel-plugin

Instaladas no projeto em 2026-11-01 por solicitação explícita do usuário.

Origem: https://github.com/vercel/vercel-plugin

Comandos executados:

```text
npx skills add "https://github.com/vercel/vercel-plugin" --list
npx skills add "https://github.com/vercel/vercel-plugin" --skill react-best-practices env-vars verification --agent codex --yes
```

Catálogo com 44 skills; três selecionadas. Instalação com código 0, origem e hashes em skills-lock.json. Skills existentes preservadas.

- react-best-practices: leitura do SKILL.md e das regras pertinentes de autenticação em Server Actions e estado por requisição. Aplicar às futuras telas/ações Next.js sem substituir a autorização do domínio nem introduzir otimizações sem evidência.
- env-vars: SKILL.md consultado; configuração pública separada de segredos, exemplos sem valores reais e .env.local ignorado. As regras locais são mais restritivas: arquivos .env* ficam ignorados, exceto .env.example. Não executar vercel link/env pull nem substituir as variáveis fornecidas pelo usuário só por exemplos da skill.
- verification: SKILL.md lido; futuras verificações devem declarar a história do usuário, seguir UI → servidor → dados → resposta e registrar evidências/limites, sem afirmar que mocks provam Supabase ou SQL reais. Na instalação atual não se declarou uma nova verificação funcional. Reconciliar observações com next-dev-loop quando houver alteração de código em execução.

Não foram instaladas skills de deploy, Marketplace, outros provedores de autenticação, agentes de IA ou manutenção do plugin. O projeto continua com Supabase; estas instruções não autorizam alterações remotas, envio de dados, publicação ou ampliação do backlog. Regras do usuário/AGENTS.md prevalecem.

Nenhum código, dependência da aplicação, variável de ambiente, serviço externo ou dado alterado. Sem nova execução de testes da aplicação para esta instalação de instruções. Skills disponíveis nas próximas interações no projeto.
