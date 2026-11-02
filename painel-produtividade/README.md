# Frontend local Servlog

## Entradas atuais

- `/`: login com e-mail/senha.
- `/admin/dashboard`: dashboard de ADMIN; `/admin` é alias.
- `/user/dashboard`: dashboard de USER; `/user` é alias.
- `/dashboard`: redireciona conforme o papel verificado no servidor.
- `/demo`: dashboard fictício, somente em desenvolvimento.

[Rotas, contrato de perfil e limites](../docs/ENTREGA_E02-T03.md). Login consulta Supabase e exige perfil ativo administrado em app_metadata; nenhum papel é escolhido pelo usuário. Os dashboards privados mostram estado vazio enquanto dados reais/gestão administrativa não estão conectados. Cadastro, inserção e reset de senha real continuam pendentes.

Papéis atuais: **ADMIN** pode criar usuários e inserir dados; **USER** pode somente ler/exportar os dados autorizados. A política é verificada no servidor, sem confiar no papel enviado pelo frontend. [Implementação e limites](../docs/ENTREGA_E02-T04.md): os serviços reais de cadastro/inserção e a persistência dos perfis ainda estão pendentes; nenhuma conta de produção foi criada.

Preparação para GitHub/Vercel/Supabase: [PUBLICACAO_PRODUTIVA.md](../docs/PUBLICACAO_PRODUTIVA.md). Root Directory na Vercel: `painel-produtividade`; Node 24.x; build `npm run build`. Execute `npm run check:publication` antes de enviar código. O Supabase informado é produção; não reutilizá-lo automaticamente em previews. Provisionamento de perfis e dados reais continuam pendentes.

Configuração Supabase SSR: clientes em `lib/supabase/` e variáveis em `.env.local` ignorado. Proxy renova cookies nas rotas de autenticação, privadas e inicial; páginas/ações continuam autorizando no servidor. Use `.env.example` como modelo, sem commitar valores reais. [Relatório da base SSR](../docs/ENTREGA_E02-T02.md).

Next.js App Router, TypeScript estrito, Tailwind e shadcn/ui. Autenticação por Supabase; a demo separada usa dados fictícios. Nenhuma estatística empresarial é utilizada nos exemplos e testes.

## Executar

Com Node.js LTS e npm no PATH:

```powershell
cd painel-produtividade
npm install
npm run dev
```

Abra http://127.0.0.1:3000 para login, http://127.0.0.1:3000/demo para o dashboard fictício ou http://127.0.0.1:3000/componentes para a galeria. O servidor escuta apenas no loopback. Demo/galeria retornam 404 em produção. Rotas privadas exigem sessão e perfil válidos e encaminham ao login quando ausentes.

Com as dependências instaladas, também é possível iniciar da pasta pai com `powershell -ExecutionPolicy Bypass -File .\painel-produtividade\iniciar-local.ps1`. O script encontra o Node.js portátil automaticamente e a opção vale somente para esse processo.

Se o runtime portátil em `.tools/` tiver sido baixado, adicione sua pasta ao PATH da sessão PowerShell antes dos comandos acima:

```powershell
$servlogNode = Get-ChildItem .tools -Directory -Filter 'node-*-win-x64' | Select-Object -First 1
$env:Path = $servlogNode.FullName + ';' + $env:Path
```

Execute esse trecho na pasta pai, antes de `cd painel-produtividade`.

## Verificar

```powershell
npm run lint
npx tsc --noEmit
npm test
npm run build
npm run test:http
npm run test:e2e
```

`npm run check` executa lint, TypeScript, testes unitários, build, testes HTTP e testes de navegador, interrompendo na primeira falha. `npm test` executa Vitest uma vez; `npm run test:watch` mantém os testes unitários em observação; `npm run test:coverage` gera cobertura da galeria. A configuração limita o Vitest a `tests/unit/`, separando os testes HTTP e Playwright.

`npm run test:http` utiliza o último build e o runner nativo do Node.js 24. Ele inicia e encerra seu próprio servidor de produção no loopback, em porta livre, sem interferir no servidor de desenvolvimento. Execute `npm run build` antes ou use o pipeline completo.

Os testes HTTP verificam a restrição da demonstração em produção (GET e HEAD), a ausência das rotas `/dashboard`, `/api/v1/productivity` e `/api/v1/productivity/export`, o 401 nos endpoints privados de dashboard e o 404 dos endpoints demo em produção. Não substituem validação futura de sessão Supabase e consultas Prisma.

Vitest com Testing Library verifica entrada de texto, alternância do checkbox e foco do diálogo. Playwright verifica diálogo pelo teclado, pesquisa/seleção/restauração e notificações em desktop e mobile Chromium, além de detectar transbordamento horizontal e erros de JavaScript no cenário de feedback. Não há filtros, gráficos ou autenticação implementados ainda.

Antes da primeira execução do navegador, instale o Chromium de testes:

```powershell
npm run test:install
```

Os binários ficam em `../.tools/playwright`, ignorados pelo Git. No Linux, use `npm run test:install -- --with-deps` para instalar também os requisitos do sistema. Playwright reutiliza o servidor local na porta 3000, ou inicia e encerra um servidor próprio quando a porta está livre. Em CI, exige seu próprio servidor. A demonstração é testada em desenvolvimento; os testes HTTP verificam o bloqueio no build de produção.

Relatórios Playwright, screenshots e traces ficam em `playwright-report/` e `test-results/`; cobertura fica em `coverage/`. Esses artefatos são ignorados pelo Git. Os testes não substituem revisão de contraste, leitores de tela ou paridade com dados reais.

O workflow [quality.yml](../.github/workflows/quality.yml) está preparado para execução manual no GitHub Actions, com Node.js 24 em Windows e Linux, `npm ci`, instalação do Chromium e `npm run check`. Ainda não foi executado remotamente. Não faz deploy, não utiliza segredos e não dispara automaticamente em push. Nenhum repositório remoto foi criado ou alterado.

## Componentes locais — E01-T02

Os componentes shadcn/ui estão em `components/ui/`, configurados por `components.json`. Bibliotecas base: Zod, Supabase JS/SSR, Recharts, Lucide e next-themes. Instalar os SDKs não configura nem acessa Supabase.

Na rota `/componentes`, a área **Experimente os componentes** permite conferir:

- Pesquisa de opções A/B/C e seleção por teclado.
- Checkbox com estado visível e campo de texto com rótulo.
- Diálogo informativo, menu para restaurar seleções e tooltip.
- Botão que exibe uma notificação de demonstração.
- Tabela vazia e exemplo visual de skeleton.

Use Tab, Enter, setas e Escape. Os exemplos não persistem nem enviam informações; somente a preferência de tema é lembrada pelo navegador. O tema inicial é escuro, há alternativa clara e as fontes são locais do sistema.

## Organização — E01-T03

```text
app/                               Rotas, layout e estilos globais
components/ui/                     Primitivas shadcn/ui
components/demo/component-demo.tsx  Galeria interativa genérica
modules/
  auth/                            Fronteira de identidade e autorização
  productivity/presentation/       Apresentação local de produtividade
  imports/                         Fronteira de ingestão e qualidade
  users/                           Fronteira de perfis e operações
  audit/                           Fronteira de auditoria
lib/utils.ts                       Utilitário compartilhado
```

`app/page.tsx` verifica o ambiente e renderiza `LocalPreview`. A apresentação fica em `modules/productivity/presentation/local-preview.tsx`; a galeria mantém sua fronteira cliente em `components/demo/`. A estrutura segue as responsabilidades descritas em [modules/README.md](modules/README.md).

As camadas de domínio, aplicação e infraestrutura serão criadas quando houver implementação concreta. A documentação geral permanece na pasta pai; [ARQUITETURA.md](../ARQUITETURA.md) descreve a estrutura-alvo e [docs/DECISOES.md](../docs/DECISOES.md) registra as decisões locais.

## Identidade visual — E01-T05

O cabeçalho usa `components/servlog-brand.tsx` com o logo fornecido em `public/brand/Logo facilities.png`, nome acessível Servlog, dimensões proporcionais e suporte branco para leitura no tema escuro. As cores documentadas estão nos tokens `--brand-primary`, `--brand-highlight` e `--brand-deep` em `app/globals.css`.

O PNG original foi preservado. Os testes desktop/mobile verificam que a imagem carrega e mantém a proporção. Consulte [public/brand/README.md](public/brand/README.md).

A identidade está integrada para validação local. Os filtros e gráficos funcionais pertencem às etapas de interface e métricas; a autenticação real permanece adiada conforme a orientação do responsável.

## Dados fictícios — E00-T04

Fixtures em `tests/fixtures/productivity.ts`, com schema Zod e testes de integridade em `tests/unit/productivity-fixtures.test.ts`. Incluem o caso junho 3/7, julho 3/8 e evolução −5,36 p.p., além de duplicidades, metas desconhecidas, anos distintos, filtros e contratos de CSV/acesso.

Os exemplos não estão conectados à interface e não contêm dados empresariais. O checklist de paridade está em [docs/CHECKLIST_PARIDADE.md](../docs/CHECKLIST_PARIDADE.md). Os aceites do motor de métricas permanecem pendentes de implementação e comparação com esses oráculos.

## Metas e deduplicação — E05-T01

O domínio puro em `modules/productivity/domain/` normaliza marcações de meta e agrupa por técnico-mês ou supervisor-técnico-mês. Valores desconhecidos são rejeitados; true prevalece sobre false, e apenas nulos permanecem indeterminados. Linhas originais são preservadas por suas referências, com avisos de conflito, ausência de meta e qualidade da identificação.

Não há conexão com a interface ou autorização implementada por essas funções. Consulte [modules/productivity/README.md](modules/productivity/README.md) para as fronteiras e cuidados com as chaves internas.

## Evolução e KPIs — E05-T02

O domínio calcula técnicos distintos, produção total e média por linha, taxas mensais com cobertura e evolução em pontos percentuais. Valores de produção e razões intermediárias são exatos; as saídas decimais têm duas casas sem arredondamento intermediário. Os testes verificam o exemplo 3/7 → 3/8 = −5,36 p.p., entradas vazias, negativos, duplicidades e totais grandes.

Esses cálculos ainda não estão conectados à página de demonstração. A aplicação de filtros e escopo da E05-T03 está descrita abaixo; autenticação e serviços reais continuam adiados.

## Filtros e escopo — E05-T03

O domínio agora separa filtros dos cards/detalhes e do histórico: Mês não altera Performance Mensal nem Evolução. Os supervisores disponíveis seguem as operações e as escolhas incompatíveis são removidas.

O caso de uso do servidor revalida um provedor de acesso a cada chamada e exige escopo por operações no contrato de consulta. A autenticação real e o adaptador Prisma ainda não existem. Consulte [modules/productivity/README.md](modules/productivity/README.md) para o contrato e seus limites.

## Endpoints de demonstração — E05-T04

Com o servidor local ativo, consulte:

- http://127.0.0.1:3000/api/demo/dashboard/summary?months=2026-07
- http://127.0.0.1:3000/api/demo/dashboard/monthly?months=2026-07
- http://127.0.0.1:3000/api/demo/dashboard/supervisors?months=2026-07
- http://127.0.0.1:3000/api/demo/dashboard/filters

As respostas contêm `demo: true`, usam dados fictícios e só estão disponíveis em desenvolvimento, com hostname local. Não é login real. As mesmas rotas em `/api/v1/dashboard/` retornam 401 até conectar autenticação e repositório reais. Em produção, todos os endpoints demo retornam 404. Não houve deploy.

Os contratos, filtros, limites e DTOs estão em [CONTRATOS_API.md](../CONTRATOS_API.md). A série de supervisores soma técnicos-mês, aplica todos os filtros e não calcula média simples de taxas. Os endpoints não retornam linhas de técnicos.

A página não faz chamadas HTTP a esses endpoints: o resumo é carregado pelo mesmo caso de uso diretamente no servidor e usa o DTO validado compartilhado com o endpoint summary, conforme a E06-T03. Índices e otimizações da E05-T05 dependem do futuro adaptador de banco.

## Dashboard local — E06-T01

O shell compartilhado em `components/dashboard/` organiza marca, navegação, indicadores e rodapé. A raiz permanece um Server Component e carrega o resumo sintético no servidor. Os quatro cards exibem 8 técnicos, evolução −5,36%, média 100,00 e total 1.500,00, com identificação de dados fictícios e meses usados na evolução.

Gráficos e detalhamento têm áreas reservadas explícitas. A galeria foi separada em `/componentes`, com navegação e testes preservados. Testes de navegador verificam cards, navegação, estados atuais dos links e ausência de transbordamento horizontal em desktop/mobile. As capturas de ambos os tamanhos foram conferidas visualmente.

Esta entrega não implementa autenticação de produção nem conecta cards à API privada. Raiz e galeria continuam bloqueadas em produção e as APIs privadas continuam 401.

## Filtros interativos — E06-T02

No dashboard, abra Mês, Operação ou Supervisor para pesquisar e marcar várias opções. Selecionar tudo marca todas as opções disponíveis do campo; limpar seleção volta ao significado “todos os resultados permitidos”. Os controles indicam atualização enquanto o servidor recalcula o recorte.

As seleções ficam na URL, sobrevivem ao recarregamento e acompanham Voltar/Avançar do navegador. Exemplo: http://127.0.0.1:3000/?months=2026-07 mostra total 800,00 e mantém evolução −5,36%. Operação Exemplo B mostra total 700,00 e evolução −8,33% no conjunto completo.

Supervisor depende de Operação. Ao trocar as operações, escolhas incompatíveis são removidas e as opções são revalidadas no servidor. Links com supervisores incompatíveis são saneados; filtros inválidos mostram um alerta com ação para voltar à demonstração completa, sem indicadores. As associações fornecidas ao cliente contêm somente operações autorizadas.

A página continua sendo Server Component; apenas menus e navegação dos filtros usam componentes cliente. Gráficos e detalhamento continuam em preparação.

## Cards e contrato de leitura — E06-T03

API e interface usam a mesma projeção/schema Zod de resumo em `modules/productivity/application/dashboard-summary-contract.ts`. Os cards recebem o DTO validado, sem linhas de técnicos ou chaves internas. A leitura permanece no servidor, sem HTTP interno ou consulta no browser.

Sem registros no recorte, o painel informa a ausência, exibe total zero e média indisponível, preservando a Evolução do histórico quando aplicável. Experimente http://127.0.0.1:3000/?months=2027-01. Metas indeterminadas/conflitantes geram ressalvas, e outros avisos podem ser consultados em **Qualidade dos dados**. Falha de leitura/validação apresenta indicadores indisponíveis, sem valores parciais ou detalhes internos.

Os testes comparam cards e API para o conjunto completo, julho, operação B e mês sem registros. Dados continuam fictícios; autenticação e banco reais permanecem adiados.

## Ações e tema — E06-T04

- **Atualizar dados**, no cabeçalho, solicita nova leitura no servidor mantendo os filtros. Não sincroniza nem reimporta a planilha.
- **Tema claro/escuro**, no cabeçalho, alterna cores e preserva indicadores e URL. A preferência é armazenada em `servlog-theme` no localStorage. Sem preferência, começa escuro.
- **Limpar filtros**, junto aos campos, remove todas as seleções e volta ao conjunto permitido completo. Fica indisponível quando não há seleção ou durante atualização.
- **Exportar CSV**, conectado na E08-T03, usa o recorte aplicado da tabela e todas as páginas. Sem detalhamento válido, explica a indisponibilidade por tooltip/foco.

Todos os ícones têm nome acessível e tooltip; atualização tem estado ocupado e respeita redução de movimento. O tema aplica tokens também aos menus e notificações. O usuário pode navegar até controles indisponíveis para ouvir/ler o motivo, sem disparar ações.

Os testes verificam persistência do tema ao recarregar, valores/filtros preservados, nova requisição RSC ao atualizar e ausência de download.

## Acessibilidade e responsividade — E06-T05

Use Tab no início para acessar **Pular para o conteúdo**. Nos filtros, Enter abre, Espaço marca a opção e Escape fecha com retorno do foco ao campo. A região **Tabela de produtividade com rolagem horizontal** recebe foco e permite rolagem pelas setas.

Os testes em `e2e/dashboard-accessibility.spec.ts` verificam teclado, foco, contraste de pares de tokens e reflow em 320, 768 e 1280 px, nos temas claro/escuro e com fonte a 200%. Navegação e ações dos filtros permitem quebra de linha. A tabela preserva rolagem própria. Essa cobertura Chromium não substitui auditoria WCAG completa, leitores de tela ou outros navegadores.

## Performance Mensal — E07-T01

O primeiro gráfico exibe a taxa de metas por competência: colunas azuis com contorno preto, percentuais acima e linha conectando meses com dados. **Mês não altera o histórico**; Operação e Supervisor são aplicados. O período do gráfico aparece no próprio painel. A demonstração completa mostra junho/2026 = 42,86% e julho/2026 = 37,50%.

Foque o gráfico e use as setas para consultar o tooltip. **Consultar dados da Performance Mensal** abre uma tabela com técnicos, metas batidas, indeterminadas, taxa e cobertura. Em telas estreitas, gráfico e tabela permitem rolagem própria por teclado. Avisos informam metas indeterminadas/conflitantes; sem histórico, aparece estado vazio.

A página e a API mensal usam o mesmo DTO validado, sem recalcular taxas no navegador.

## Performance Mensal Supervisão — E07-T02

O segundo gráfico aplica **Mês, Operação e Supervisor**. Conta cada combinação de supervisor, técnico e mês uma vez e soma as contagens antes de calcular a taxa. Ordena da maior taxa exata para a menor, com desempate alfabético. Na demonstração completa, Equipe Exemplo A = 50,00% e B = 28,57%; selecionando julho, B passa a 25,00%.

Use as setas com foco no gráfico para consultar o tooltip. **Consultar dados da Performance Mensal Supervisão** abre contagens de técnicos-mês, metas, indeterminadas, taxa e cobertura. O painel mostra o período escolhido, ressalvas e estado vazio. Nomes completos ficam no tooltip/tabela quando abreviados no eixo. Os dois gráficos permitem rolagem interna em telas estreitas.

Dados seguem fictícios, sem login ou banco reais.

## Tema, responsividade e detalhes dos gráficos — E07-T03

Os detalhes dos dois gráficos aparecem em uma área abaixo do desenho, fora da rolagem horizontal. Isso evita corte em telas estreitas ou ao consultar pontos fora da área visível. Use mouse sobre a coluna ou foco no SVG e setas; Escape dispensa os detalhes, e mudar de referência pelas setas os reabre. A tabela textual de cada painel continua disponível.

A área compartilha tema, formatação e quebra de nomes longos; mantém as unidades próprias de cada gráfico. A matriz automatizada cobre claro/escuro, 320/768/1280 px, fonte a 100/200%, movimento reduzido, cores do tooltip e valores preservados ao alternar tema. Não substitui auditoria com leitores de tela ou outros navegadores.

## Conferência de paridade — E07-T04

`tests/fixtures/chart-parity.ts` contém valores fixos de referência para sete recortes. Os testes comparam handlers, gráficos e evolução com esses números, além de conferir cores, posição dos rótulos, proporção das colunas e os elementos previstos de cada gráfico. Os testes de integração incluem duplicidades, conflitos, indeterminados, anos diferentes e arredondamento somente no final.

Essa validação usa dados sintéticos e regras documentadas; não representa comparação aprovada com planilha empresarial ou imagens do legado. Capturas dos dois gráficos são geradas para inspeção. Execute apenas uma instância do Playwright por vez ao usar o diretório padrão de artefatos.

## API de detalhamento — E08-T01

Teste local: http://127.0.0.1:3000/api/demo/productivity?months=2026-07&sort=technician&direction=desc&pageSize=2.

A resposta contém seis campos por linha, filtros efetivos, busca e metadados de paginação. Use page para avançar, pageSize até 100, search até 120 caracteres, sort por coluna e direction asc/desc. Produção permanece texto decimal e ordena numericamente; mês inclui ano. Meta indeterminada fica ao final. Pesquisa considera textos em pt-BR e zeros de contrato são preservados. Página além do fim fica vazia com total correto.

O endpoint privado `/api/v1/productivity` permanece 401. A demo é local/sintética e não existe em produção. O repositório SQL real deverá paginar no banco; o atual usa somente 15 linhas fictícias no servidor.

## Tabela do detalhamento — E08-T02

O painel mostra as seis colunas e até 10 linhas iniciais. Clique ou use Enter no cabeçalho para ordenar; `aria-sort` informa a direção. Use **Pesquisar**, **Limpar pesquisa**, tamanho de página e os botões de paginação. A consulta e a formatação das linhas ficam no servidor. Pesquisa não altera os indicadores nem os gráficos.

URL, Voltar e recarregar preservam busca/ordem/página. Alterar pesquisa, ordem ou tamanho volta à primeira página. Mudar filtros globais preserva pesquisa aplicada, ordem e tamanho, reinicia a página e remove supervisores incompatíveis. Limpar filtros remove dimensões e pesquisa, preservando ordem e tamanho. Um controller compartilhado bloqueia filtros, tabela e CSV durante transições; rascunhos de pesquisa só são aplicados com Pesquisar e são descartados ao navegar. Exemplo: http://127.0.0.1:3000/?pageSize=5&sort=technician&direction=asc.

Durante navegação aparece skeleton com anúncio de atualização. Resultados vazios, página fora do intervalo e erro de parâmetros/leitura têm mensagens próprias. A tabela tem rolagem horizontal por teclado e segue o tema. Os erros exclusivos da tabela não ocultam os cards.

## Exportar CSV — E08-T03

O ícone **Exportar CSV** junto aos filtros baixa todas as linhas do detalhamento aplicado, respeitando filtros, pesquisa e ordenação, incluindo as páginas que não estão na tela. O arquivo tem as mesmas seis colunas, UTF-8 com BOM, `;`, mês/ano em pt-BR e produção decimal com vírgula. Textos com risco de fórmula são protegidos; produção negativa mantém o sinal numérico. Zeros do contrato permanecem no arquivo; ao importar em planilha, escolha tipo Texto para a coluna Contrato.

O botão anuncia preparação, evita requisições repetidas e permite nova tentativa em erro. Alterar o recorte aplicado cancela uma exportação ainda pendente. Limites: 10.000 linhas ou 5 MiB; resultados maiores são recusados sem arquivo parcial.

Teste direto: http://127.0.0.1:3000/api/demo/productivity/export?months=2026-07&sort=technician&direction=desc. A demo usa somente dados fictícios; a rota privada segue 401 sem login real.

## Validação integral local — E08-T05

Em 2026-11-01, lint, TypeScript, build, 286 testes unitários, 19 HTTP e os 136 cenários Playwright passaram. A suíte inteira rodou em desktop e mobile Chromium, sem falhas, retries ou testes ignorados. Não foi necessário alterar o produto. Relatório com matriz de cobertura e limites: [ENTREGA_E08-T05.md](../docs/ENTREGA_E08-T05.md). Para consultar os artefatos locais, execute `npx playwright show-report`; capturas ficam em `test-results/` e são sobrescritas nas próximas execuções.

Esta validação cobre dados fictícios e não substitui os testes de Supabase Auth, banco ou importação reais. Não houve deploy. O documento original da etapa 08 continua ausente e o backlog formal permanece sem marcação.

## Matriz de métricas — E10-T01

A revisão de RN-01 a RN-19 está em [ENTREGA_E10-T01.md](../docs/ENTREGA_E10-T01.md), com evidências por camada e pendências explícitas. Foram acrescentados três testes nos handlers para ordem das linhas, duplicação integral e cancelamento decimal; nenhum cálculo do produto foi alterado.

## Autorização local — E10-T02

Matriz comum de 54 casos em `tests/unit/productivity-authorization.test.ts` verifica os seis handlers, escopo por papel/operação, acesso negado antes de consultar dados, cache privado e ausência de conteúdo restrito em respostas/erros. [Relatório e limites](../docs/ENTREGA_E10-T02.md). Não valida sessão Supabase, SQL ou RLS reais.

## Segurança de upload e CSV — E10-T03

[Revisão e evidências](../docs/ENTREGA_E10-T03.md): proteção de fórmulas com prefixos invisíveis, fronteira de bytes após escape/UTF-8 e cancelamento entre lotes. Upload não implementado; a rota prevista retorna 404 em GET e rejeita POST multipart com 409 na versão instalada do Next.js. Não houve alteração do produto, dependências ou deploy.

## Performance e responsividade — E10-T04

`e2e/local-performance.spec.ts` registra navegação, pesquisa e APIs locais, com JSON anexado ao relatório Playwright. [Método, resultados e limites](../docs/ENTREGA_E10-T04.md). São medições da demo de desenvolvimento com 15 linhas, sem throttling ou banco real; não são Core Web Vitals ou SLA de produção.

## Preparação de release — E10-T05

[Checklist de release e migração](../docs/CHECKLIST_RELEASE_MIGRACAO.md) com evidências locais, condições de homologação, ensaio, reconciliação, backup/restauração e critérios de interrupção. [Relatório da entrega](../docs/ENTREGA_E10-T05.md). Nenhum deploy ou migração executado; produção depende de autenticação, banco, importação e aceites reais. Próximo passo recomendado: E00-T01 — confirmar fonte atual, competências e formatos de META BATIDA antes de integrar serviços reais.
