# Origem e instalação

Instalada por solicitação do usuário em 2026-11-01, no escopo deste projeto.

- Repositório: https://github.com/vercel/next.js
- Caminho: skills/next-dev-loop/SKILL.md
- Commit consultado: 3bccd4df910c984ca60f796e50b8d43db3227162
- SHA fixado no download via raw.githubusercontent.com; SKILL.md mantido sem adaptações.
- `npx skills add "https://github.com/vercel/next.js" --list` falhou por ausência de Git (spawn git ENOENT). O catálogo foi consultado pela API oficial do GitHub; apenas a skill relevante foi baixada e instalada com `npx skills add <origem-local> --agent codex --yes`.
- `skills-lock.json` registra a origem local usada na instalação; o repositório e commit oficiais acima preservam a procedência após limpeza de .tools.

Selecionada para validar alterações do aplicativo Next.js em execução. Skills de cache/prefetch/bundle e manutenção interna do framework não foram instaladas: não fazem parte da integração Supabase atual.

## Ferramentas e preflight

agent-browser 0.41.1 instalado em ../.tools/agent-browser, sem dependência ou instalação global na aplicação. Incluir ../.tools/agent-browser/node_modules/.bin e o Node portátil no PATH da sessão. Chromium existente em ../.tools/playwright foi reutilizado, sem nova instalação de navegador.

Guia `agent-browser skills get core` lido. Sessão derivada por `session id --scope worktree --prefix next-dev-loop`; usar sempre a mesma sessão e restore. Demonstração aberta em http://127.0.0.1:3000 com react-devtools habilitado. MCP tools/list disponibiliza get_compilation_issues; consulta retornou issues vazio, get_routes enumerou as oito rotas e get_errors retornou configErrors/sessionErrors vazios. Snapshot do navegador confirmou dashboard, filtros, gráficos e tabela fictícios. A chamada react tree não listou componentes; não se declara inspeção detalhada de fibras/props nesta instalação. Antes de verificar mudanças React, resolver essa ausência conforme a skill.

Navegador de teste fechado com a mesma sessão/restore; servidor next dev mantido. Nenhuma mudança no código da aplicação, login, perfil, dado, dependência do aplicativo ou deploy. Testes funcionais não foram repetidos para instalar instruções/ferramentas; preflight não substitui a suíte de testes da aplicação.
