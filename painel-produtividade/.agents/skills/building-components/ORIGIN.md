# Instalação e aplicação

Instalada em 2026-11-01 por solicitação explícita do usuário.

- Origem: https://github.com/vercel/components.build
- Skill: skills/building-components/SKILL.md
- Comando de descoberta: npx skills add "https://github.com/vercel/components.build" --list
- Instalação: npx skills add "https://github.com/vercel/components.build" --skill building-components --agent codex --yes
- Escopo: somente este projeto, .agents/skills/building-components. Origem e hash registrados em skills-lock.json; a skill next-dev-loop existente foi preservada.

SKILL.md e referências pertinentes a princípios, acessibilidade, composição, estado e tipos consultados. Ao implementar componentes de autenticação, aplicar HTML semântico, labels persistentes, nomes acessíveis, teclado/foco, associação de erros aos campos, feedback de atualização e composição com os componentes existentes. Escolher estado controlado/não controlado conforme o comportamento necessário, sem instalar dependências ou criar abstrações só por exemplos do guia.

A instalação não autoriza publicar componentes, trocar o sistema de UI ou ampliar tarefas do backlog. Regras de segurança, fronteiras servidor/cliente e Zod do AGENTS.md continuam aplicáveis. Referências específicas adicionais devem ser lidas quando a implementação correspondente começar.

Nenhum componente, dependência da aplicação, login, dado ou deploy foi alterado. Instalação concluída com código 0 e leitura dos arquivos locais confirmada. Não foram repetidos testes da aplicação por se tratar apenas de instruções e lockfile de skills.
