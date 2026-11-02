# Decisões

## 2026-11-01 — UI/UX e responsividade obrigatórias

Por solicitação do usuário, registrar UI/UX, acessibilidade e responsividade como requisitos permanentes, em conjunto com a prioridade de shadcn/ui. Fluxos claros, feedback acessível, teclado/foco, contraste, toque e validação visual das telas afetadas em mobile/tablet/desktop, dois temas e texto ampliado. Regra em AGENTS.md e UI_UX.md. Alteração exclusivamente documental, sem modificar componentes ou alegar nova validação visual das telas existentes.

## 2026-11-01 — Regra de frontend: priorizar shadcn/ui

Por instrução explícita do usuário, todos os componentes de interface devem usar shadcn/ui quando houver opção adequada. Antes de criar UI própria, consultar componentes locais e catálogo oficial; somente criar implementação nova se não houver componente ou composição adequada, documentando alternativas e motivo. Componentes de domínio podem compor shadcn/ui; não recriar controles existentes. HTML semântico estrutural continua permitido. Regra persistida em AGENTS.md e UI_UX.md. Esta interação altera somente a política/documentação; não executa refatoração retroativa das telas, não adiciona dependências e não modifica comportamentos.

## 2026-11-01 — E02-T03: login inicial e dashboards por papel

Página inicial passa a ser login, demo movida para /demo e continua somente em desenvolvimento. /admin/dashboard e /user/dashboard têm layouts e páginas protegidos no servidor; /admin, /user e /dashboard redirecionam para a entrada canônica autorizada. Proxy renova cookies, sem substituir os guards. Login via Server Action/Supabase, sem signup ou escolha de papel. Enquanto não existe UserProfile/Prisma, a identidade das novas páginas usa getClaims seguido de getUser para reler app_metadata administrada no servidor (role, active, operation_ids), nunca user_metadata ou papel enviado pelo browser. Perfil ausente/inválido/inativo bloqueia acesso. Esse adaptador transitório não altera produção nem conecta APIs de produtividade ao banco. Dashboards reais começam com estados vazios, sem dados sintéticos; serviços administrativos/inserção continuam pendentes. Operações reais de perfil e primeiro ADMIN exigem provisionamento próprio posterior.

## 2026-11-01 — E02-T04: papéis ADMIN e USER

Por solicitação do usuário, substituir ADMIN/GESTOR/VISUALIZADOR por ADMIN e USER. ADMIN pode ler/exportar dados autorizados, criar usuários e inserir dados; USER pode somente ler/exportar no escopo fornecido pelo servidor. Não foram autorizadas permissões adicionais de edição/exclusão. Não aceitar papel/permissões do frontend ou user_metadata como autoridade. Perfil ativo/escopo devem ser revalidados no servidor. Os papéis antigos serão rejeitados, sem promoção/mapeamento silencioso; não há perfil persistido/migração implementados. Registrar a política e testes antes da implementação. Operações reais de criação/inserção permanecem pendentes dos módulos e da autenticação/persistência reais, sem criar usuários ou alterar o Supabase de produção nesta tarefa.

## 2026-11-01 — E11-T01: repositório único e preparação sem exposição da demo

Git na raiz inclui documentação/CI e app em painel-produtividade, que será Root Directory do projeto Vercel. Nome solicitado: produtiva; proposta privada, conta GitHub ainda pendente. Node 24.x alinhado ao runtime local. subaps.txt/.env/artefatos excluídos; auditoria de candidatos antes de envio. Supabase fornecido foi classificado pelo usuário como produção: sem mudanças remotas e sem copiar credenciais para previews. Health somente leitura validado, sem comprovar login/SQL. Proteções 404/401 do build preservadas; não publicar demo anônima para contornar a ausência de auth/perfil/dados reais. Detalhes em PUBLICACAO_PRODUTIVA.md.

## 2026-11-01 — E02-T02: clientes SSR Supabase

Bloco oficial adaptado para lib/supabase e proxy.ts do Next.js 16. Valores reais somente em .env.local ignorado, configuração Zod e erros sanitizados. Matcher inicial /auth/*, sem redirect global da demo para tela inexistente; ampliar com futuras rotas protegidas e testes. getClaims renova sessão, mas não substitui autorização nos casos de uso. Providers privados continuam bloqueados até existir perfil/escopo server-side. SDK focado em Auth, sem consultas de produtividade pela Data API. Referências e limites em ENTREGA_E02-T02.md.

## 2026-11-01 — E08-T04: política única de estado aplicado

A URL será a fonte do estado aplicado validado no servidor; um provider de navegação compartilhará transição entre filtros/tabela/CSV, sem armazenar linhas ou permissões. Mudar Mês/Operação/Supervisor preservará busca, ordem e tamanho, reiniciando somente a página e removendo supervisores incompatíveis. Limpar filtros removerá as três dimensões e a pesquisa aplicada, voltando à página 1, mas preservando ordem/tamanho. Pesquisa/ordem/tamanho reiniciam página; paginação preserva o restante. Essas são decisões de navegação que substituem o reset completo de tabela usado na E08-T02; não alteram métricas ou escopo de acesso.

Correção de supervisor incompatível por URL também preservará os parâmetros válidos do detalhamento e reiniciará a página. Parâmetros desconhecidos continuarão rejeitados; parâmetros inválidos exclusivos da tabela continuarão isolados no detalhamento. CSV usará o mesmo estado aplicado, ignorando página/tamanho. Texto digitado sem Pesquisar é rascunho: não altera a consulta/CSV e é redefinido para o aplicado ao navegar. Testes da política são adicionados antes da implementação.

## 2026-11-01 — E08-T03: contrato da exportação CSV

A exportação deverá reutilizar filtros/pesquisa/ordem do detalhamento e ignorar somente a página e seu tamanho, após validar esses parâmetros. O arquivo terá as seis colunas, mês/ano legível, produção decimal pt-BR sem agrupamento, Sim/Não/—, BOM UTF-8, separador ponto e vírgula, campos entre aspas com escape de aspas e registros CRLF. Textos que iniciam operadores de fórmula (inclusive variantes full-width e após espaços/controles invisíveis) ou controles iniciais terão apóstrofo de proteção. A coluna de produção validada não recebe esse prefixo: negativos preservam semântica numérica. Referência consultada: [OWASP CSV Injection](https://community.owasp.org/attacks/CSV_Injection). Nenhuma sanitização é garantia universal após regravação por todos os programas de planilha; a validação automática é do arquivo gerado, não execução de Excel/LibreOffice.

Limites escolhidos para a implementação local: 10.000 linhas e 5 MiB de arquivo, com rejeição explícita em vez de truncamento. Lotes de 100 usarão a leitura já autorizada; identidade/papel/escopo e metadados de seleção/contagem devem permanecer coerentes ao longo da exportação. O arquivo será montado sob esses limites antes de enviar headers de download, evitando liberar CSV parcial em falha. As rotas reais continuam 401 sem sessão; a demo só funciona localmente em desenvolvimento. Testes de proteção/formato são adicionados antes do serializador.

## 2026-11-01 — E08-T02: tabela RSC e controles de navegação

O detalhamento passou a renderizar no servidor a página do caso de uso existente, com o mesmo DTO da API, sem HTTP ao próprio handler nem busca/ordenação de linhas no browser. O componente Table do shadcn era puro e perdeu a diretiva use client desnecessária; recebeu containerProps para nome/foco/rolagem acessível. Somente controles/contexto de navegação e skeleton usam cliente, recebendo query e conteúdo RSC, não linhas internas completas.

São exibidas seis colunas, mês/ano em pt-BR, produção textual com duas casas e meta Sim/Não/—. Cabeçalhos têm botão por teclado, ícone e aria-sort no th. Paginação tem contagem, tamanho, primeira/anterior/próxima/última. A tabela começa com 10 linhas; a API mantém padrão 50. Pesquisa só altera o detalhamento e não os agregados. Os controles seguem a URL para permitir Voltar/recarregar, reiniciando página ao mudar busca/ordem/tamanho. Os filtros globais conservam o fluxo anterior e reiniciam o estado da tabela ao mudar; a E08-T04 não foi marcada como concluída.

O parser separa apenas os parâmetros conhecidos da tabela para a leitura agregada; parâmetros desconhecidos/permissões continuam na validação estrita do dashboard. A leitura paginada valida os parâmetros completos após autorização. Parâmetros exclusivos inválidos e falhas de leitura aparecem em alerta do detalhamento sem linhas parciais; os cards permanecem disponíveis. Há redefinição do detalhamento e nova leitura por refresh para falha transitória. Supervisores incompatíveis continuam tratados pelo fluxo global existente.

Transições RSC mantêm controles, bloqueiam ações duplicadas e substituem as linhas por skeleton, com aria-busy/status e redução de movimento. Scroll horizontal tem nome, foco e contorno. As tabelas de gráficos permanecem independentes. Nenhum CSV, dependência, sessão/banco real ou deploy foi adicionado; a raiz continua 404 em produção e a API privada 401.

Uma verificação adicional dos controles a 320 px/fonte 200% encontrou corte dentro do painel, apesar de não haver transbordamento da página: Limpar pesquisa chegava a 316,59 px para painel até 288 px. Os botões de pesquisa/paginação/recuperação passaram a permitir quebra de texto e respeitar largura máxima; a navegação e os textos do painel também permitem reflow. Cabeçalhos/colunas conservam rolagem própria. O caso foi reproduzido e corrigido em desktop/mobile, com teste específico das caixas dos controles.

## 2026-11-01 — E08-T01: leitura paginada do detalhamento

Criados GET /api/v1/productivity e /api/demo/productivity. A versão privada falha fechada em 401; a demo só funciona com NODE_ENV development, hostname local e origem permitida. O guard de demonstração e a validação de acesso foram extraídos para helpers server-only compartilhados com o dashboard, preservando os comportamentos anteriores e os imports de erro existentes.

O caso de uso do detalhamento não calcula cards/gráficos nem usa a leitura agregada como repositório. Recebe contrato específico com resolução de supervisores no escopo e consulta paginada. Autentica antes de validar a query, recusa operação não autorizada antes de consultar dados, não consulta escopo vazio e repete verificações de escopo/filtros, contagens e ordem sobre a página devolvida. A implementação real deverá aplicar os predicados e LIMIT/OFFSET/COUNT no SQL. Só o adaptador sintético carrega suas 15 linhas no servidor para testes locais; nenhuma base real foi conectada.

A query tem whitelist das seis colunas, page até 1.000.000, pageSize até 100 (padrão 50), busca de até 120 caracteres e ordenação inicial mês decrescente. Produção usa BigInt em centésimos; a função de conversão existente foi exportada sem alterar métricas. JSON de produção mantém duas casas em texto. Meta indeterminada fica ao final em ambas as direções; empates usam sourceRowKey estável e único internamente. O futuro adaptador deverá fornecer identificação persistente única compatível; nenhuma chave é exposta no DTO.

Pesquisa inclui os seis campos exibidos, com competência em código/nome pt-BR e produção ponto/vírgula, sem regex e ignorando caixa/acentos. Supervisores incompatíveis são descartados como no dashboard, antes de aplicar mês/pesquisa. Não há deduplicação de linhas de produção. Total é contado após filtros/pesquisa e antes de paginar; página além do fim fica vazia com total preservado. Essas decisões de transporte/ordenação foram documentadas em CONTRATOS_API.md e cobertas por testes, sem mudança de métrica.

Nenhuma tabela UI, CSV, autenticação real, dependência, migração ou deploy foi adicionado. A validação desta tarefa usa todos os testes Vitest/HTTP de produção e os cenários API afetados; não repete toda a suíte visual, pois componentes e fluxos da interface não foram alterados. O roteiro docs/etapas/08-detalhamento.md está ausente e o aceite formal continua pendente.

## 2026-11-01 — E07-T04: oráculo conjunto e geometria visual

A validação conjunta passa a usar tests/fixtures/chart-parity.ts, com expectativas fixas transcritas das contagens documentadas, independentes das funções do produto e das respostas da API. Sete recortes comparam contratos, gráfico e evolução: conjunto completo, junho, julho, operação A, operação B, julho/equipe B e mês sem registros.

Testes de integração dos handlers verificam ainda duplicidades, conflitos, metas indeterminadas, anos distintos e diferença exata cujo arredondamento prévio produziria erro. A conferência visual verifica rótulos fixos, azul/borda preta, rótulos acima das colunas, proporção das alturas, linha apenas no mensal e ausência de grade/eixo lateral/legenda, nos dois temas e projetos desktop/mobile. As formas SVG são medidas numa mesma leitura, com espera pelo layout, evitando incluir contornos de grupos/interação.

Nenhuma regra ou componente do produto precisou mudar. A validação é contra regras documentadas e dados sintéticos: não há amostra empresarial anonimizada nem imagens de referência do legado aprovadas para comparação externa. Portanto não se declara paridade de produção ou igualdade pixel a pixel com o legado. Backlog formal continua pendente pelo roteiro ausente.

## 2026-11-01 — E07-T03: detalhes dos gráficos fora da rolagem

O ensaio a 320 px comprovou corte de tooltip: o limite direito chegou a 325 px, fora da tela. Os dois gráficos agora usam PerformanceChartFrame e PerformanceChartTooltip, suporte visual compartilhado que renderiza os detalhes em portal Recharts abaixo do SVG, fora da região com rolagem horizontal. Os detalhes permanecem na largura do painel mesmo ao consultar referências fora da área visível. Uma área mínima reduz deslocamentos de layout; texto ampliado pode aumentar sua altura.

O suporte compartilha tokens de tema, nomes completos, percentuais, contagens, cobertura e indeterminados, com quebra de palavras longas e anúncio polite. Unidades permanecem distintas: técnicos no mensal e técnicos-mês em supervisão. Escape dispensa; setas para outra referência reabrem. Não foram alterados cálculos, filtros, ordem ou DTOs. Animações seguem desativadas e tabelas textuais continuam disponíveis.

A matriz Chromium verifica temas dark/light, 320/768/1280 px, fonte raiz a 100/200%, teclado, Escape, mouse, troca de tema sem mudança de valores, cores resolvidas do tooltip e nomes sintéticos longos sem transbordamento. Não equivale a zoom nativo, leitor de tela, todos os estados WCAG ou outros motores. Sem dependências novas, dados reais, autenticação ou deploy. O roteiro original da etapa permanece ausente.

## 2026-11-01 — E07-T02: Performance Mensal Supervisão

A agregação de supervisão existente foi incorporada ao caso de uso de leitura com selection.filteredRows, aplicando Mês/Operação/Supervisor após autorização. API e página usam buildDashboardSupervisors, contrato Zod compartilhado que preserva o formato existente, valida contagens/cobertura/taxas e exige supervisores únicos na ordem de taxas exatas, com desempate por nome/ID. Não se usa média simples de percentuais mensais nem taxa arredondada para ordenar; o cálculo do domínio permaneceu intacto.

SupervisorsPerformancePanel mantém estrutura, avisos e tabela em RSC. Apenas SupervisorsChart usa cliente/Recharts, com agregados já autorizados. Identificadores/rótulos de supervisores são necessários para distinguir equipes e já pertencem ao DTO protegido; linhas e identidades de técnicos não são transmitidas. A demo continua somente local e sintética.

Colunas verticais #16a8e6 com borda preta, escala fixa 0–100, rótulos de duas casas, sem linha, grade, legenda ou eixo lateral. Os nomes longos têm abreviação apenas no eixo; tooltip/tabela conservam o nome completo. Há largura mínima por equipe, rolagem interna com foco, tooltip por setas e animações desativadas. O painel informa o período selecionado, unidade técnico-mês, critérios de ordenação e ressalvas de metas indeterminadas/conflitantes. Sem dados, mostra mensagem em vez de gráfico.

Não há nova dependência, consulta no browser, sessão/banco real ou deploy. A harmonização abrangente dos dois gráficos permanece na E07-T03. O roteiro docs/etapas/07-graficos.md continua ausente e impede conferir o checklist formal do backlog.

## 2026-10-31 — E07-T01: Performance Mensal com contrato compartilhado

Performance Mensal reutiliza calculateMonthlyPerformance sobre timelineRows autorizadas, sem Mês e com Operação/Supervisor. O novo dashboard-monthly-contract projeta o mesmo DTO no handler e na página RSC, preservando os campos existentes da API mensal. O schema valida contagens, percentuais finais, razão exata, cobertura e competências únicas em ordem cronológica. Nenhuma regra de cálculo foi alterada; as verificações impedem exibir contrato inconsistente.

Apenas MonthlyChart é cliente: recebe agregados sem razão interna, linhas ou identidades. Recharts já instalado combina colunas #16a8e6 com contorno preto e linha linear entre referências reais, sem regressão, preenchimento de meses faltantes, grade, legenda ou eixo percentual lateral. Escala fixa 0–100 evita distorcer comparação. Rótulos têm duas casas e mês/ano. Animações ficam desativadas, inclusive no tooltip. Foram consultadas a documentação Next instalada sobre Server/Client Components e a [API oficial ComposedChart](https://recharts.github.io/en-US/api/ComposedChart/).

O painel RSC explicita período e filtros, oferece tabela de contagens/taxas/cobertura em detalhes, região rolável por teclado e aviso visível para metas desconhecidas/conflitantes. Metas indeterminadas continuam no denominador. Sem histórico há mensagem própria, sem taxa artificial. Tooltip por setas usa a camada de acessibilidade Recharts; a tabela oferece alternativa independente de SVG/interação. Largura mínima por competência preserva legibilidade com rolagem interna.

O gráfico de supervisão permanece na E07-T02. Não há dependência nova, sessão real, acesso a banco ou publicação. docs/etapas/07-graficos.md permanece ausente; o checklist formal não foi marcado.

## 2026-10-31 — E06-T05: teclado e reflow da demonstração

A tabela horizontal recebe região nomeada, foco por teclado e contorno visível, permitindo rolagem pelas setas. A navegação e as ações internas dos filtros permitem quebra de linha; o teste inicial comprovou transbordamento da navegação em 320 px com texto a 200%.

A validação usa Playwright/Chromium já instalado, sem dependências adicionais: atalho ao conteúdo, foco visível, abertura por Enter, seleção por Espaço, fechamento por Escape com retorno de foco, rolagem da tabela e reflow em 320/768/1280 px nos dois temas. O teste de contraste calcula luminância sRGB dos tokens resolvidos e exige 4,5:1 nos pares selecionados e no indicador negativo. Não representa auditoria integral WCAG, teste com leitor de tela, contraste de todos os estados/gradientes ou validação em outros motores. Ampliação de fonte a 200% não simula integralmente zoom do navegador.

Não houve alteração de métricas, autenticação, escopo de dados ou publicação. A etapa original docs/etapas/06-interface.md continua ausente; o aceite formal do backlog permanece pendente.

## 2026-10-31 — Antecipar E01-T01 para validação local

O responsável solicitou testar o frontend localmente antes de integrar Supabase e Vercel, sem login real. Está autorizada a fundação Next.js em `painel-produtividade/`, antecipando a dependência da descoberta para esse objetivo limitado.

A base inicial não acessa dados empresariais, não implementa autenticação simulada como autorização e não cria uma rota pública `/dashboard`. A demonstração inicial fica na raiz, disponível somente em desenvolvimento. A etapa de descoberta continua pendente e nenhuma regra de negócio fica aprovada por essa antecipação.

O runtime Node.js portátil fica em `.tools/`, ignorado pelo Git. O servidor local deve escutar em 127.0.0.1. A instalação de shadcn/ui e a construção dos componentes interativos permanecem na E01-T02 e etapas posteriores.

## 2026-10-31 — E01-T02: componentes para demonstração local

O responsável autorizou a instalação das bibliotecas e dos componentes base. Foi utilizada a CLI oficial shadcn 4.23.0 com estilo `radix-nova`, base Radix, Lucide e variáveis CSS, compatível com Tailwind 4. A CLI atual gera imports do pacote `cn` e adiciona `shadcn/tailwind.css`; esses padrões foram mantidos.

A galeria interativa está em `components/component-demo.tsx`, renderizada somente na página de desenvolvimento já existente. Não representa filtros nem autorização de negócio. Os SDKs Supabase são apenas dependências instaladas; não há clientes, credenciais ou chamadas de autenticação.

Foi adicionado `next.config.ts` com configuração padrão para detecção pela CLI. A fonte Google adicionada automaticamente foi substituída por fontes de sistema para permitir execução local sem esse download. O tema permanece escuro; alternância e persistência serão tratadas na tarefa de interface correspondente.

## 2026-10-31 — E01-T03: organização incremental do monólito

A rota inicial passa a orquestrar somente a restrição ao ambiente de desenvolvimento e a composição da apresentação. O conteúdo foi movido para `modules/productivity/presentation/local-preview.tsx`, preservando Server Components e o comportamento existente. A galeria genérica foi movida para `components/demo/component-demo.tsx`.

As fronteiras `auth`, `productivity`, `imports`, `users` e `audit` são documentadas dentro de `modules/`. As camadas `domain`, `application` e `infrastructure` serão criadas conforme houver código real, evitando abstrações e arquivos vazios. `components/ui/` permanece independente das regras de domínio. Não foram adicionados serviços, repositórios ou rotas de fases posteriores.

## 2026-10-31 — E01-T04: pipeline nativo e instalação pendente

A revisão automática de aprovação rejeitou o comando de instalação de Vitest, cobertura, plugin React, Testing Library, jsdom e Playwright. A justificativa foi que a autorização geral da E01-T04 não bastava para dependências pesadas conforme AGENTS.md. O comando não foi executado e não houve tentativa alternativa de instalar esses pacotes.

Para concluir o trabalho independente dessa aprovação, foi configurado o runner nativo `node:test`, disponível no Node.js 24 já instalado. Os testes HTTP utilizam um servidor real do build Next.js, com loopback e porta alocada pelo sistema, encerrado pelo próprio teste. Eles cobrem a restrição da demonstração em produção e a ausência das rotas futuras, sem simular identidade ou aprovação de regras de negócio.

`npm run check` reúne lint, TypeScript, build e testes; `npm test` sempre gera um build novo para evitar resultado baseado em artefato desatualizado. `test:http` é a execução rápida sobre o último build. O workflow CI preparado é somente manual, sem segredos, publicação ou execução remota nesta sessão. Vitest/Testing Library e Playwright, incluindo o navegador de testes, permanecem dependentes de autorização explícita para completar o escopo originalmente previsto.

## 2026-10-31 — E01-T04: autorização recebida e testes de interação

Após a solicitação explícita para instalar Vitest, Testing Library, jsdom e Playwright com Chromium, o responsável respondeu “sim faça”. A instalação foi autorizada pela revisão automática e realizada; o bloqueio anterior está resolvido.

Foram escolhidos Vitest 4, cobertura V8 4, Vite 7 e plugin React 5: a tentativa com o plugin React mais recente encontrou conflito entre Babel 8 e Babel 7 utilizado pelo shadcn. A resolução foi feita por versões compatíveis, sem `--force` ou `--legacy-peer-deps`. O lockfile registra as versões efetivamente instaladas.

`npm test` agora executa os testes unitários Vitest. `npm run check` mantém a geração de build novo antes dos testes HTTP e acrescenta testes Playwright em desktop e mobile Chromium. Os runners têm diretórios separados. A configuração Playwright usa `.mts` para suportar import.meta sem alterar o tipo de módulo da aplicação; as configurações `.mts` também entram na verificação TypeScript.

`test:install` baixa o Chromium e utilitários do Playwright para `.tools/playwright`, ignorado pelo Git. Os testes de navegador reutilizam o servidor de desenvolvimento local quando disponível; em CI, iniciam um servidor próprio. Os testes HTTP continuam usando produção e encerrando seu servidor. O workflow manual instala o navegador e executa o mesmo pipeline, sem deploy. Relatórios, traces, capturas e cobertura são artefatos locais ignorados pelo Git.

## 2026-10-31 — E01-T05: identidade textual enquanto falta o logo oficial

Nenhuma imagem ou arquivo oficial de marca foi encontrado no workspace. Não foi criado um logo por aproximação nem baixado material de terceiros. O componente Server `components/servlog-brand.tsx` reutiliza a identificação textual SERVLOG com nome acessível; o símbolo genérico S foi removido.

As três cores de referência de UI_UX.md foram centralizadas em tokens CSS. O subtítulo Acompanhamento operacional foi colocado no cabeçalho, junto do título e da marca. `public/brand/README.md` registra como receber e integrar o arquivo oficial, sem incluir documentos internos ou dados empresariais nessa pasta pública.

A tarefa permanece parcial até receber o logo autorizado em SVG ou PNG e validar sua integração. Nenhuma etapa de autenticação ou implantação foi antecipada.

## 2026-10-31 — E01-T05: logo recebido e integrado

Após nova verificação do diretório, foi encontrado `public/brand/Logo facilities.png`, fornecido pelo responsável. O arquivo foi inspecionado e tem formato PNG com alpha e dimensões 1815 × 871 pixels. O componente `ServlogBrand` passa a usar esse arquivo com Next Image, nome acessível Servlog e proporções preservadas.

Foi utilizado suporte branco no cabeçalho escuro para manter a leitura dos elementos escuros e cinza do original. O PNG não foi recortado, redesenhado ou editado. Os testes desktop/mobile verificam carregamento efetivo e proporção, além das interações já existentes. A pendência do logo registrada acima está resolvida.

## 2026-10-31 — E00-T04: fixtures isoladas e oráculos de paridade

O responsável autorizou preparar dados fictícios e checklist de paridade para a validação local. As fixtures ficam em `painel-produtividade/tests/fixtures/`, fora da aplicação e dos arquivos públicos. O schema Zod é exclusivo dos exemplos e não estabelece o contrato final de importação.

Produção é armazenada como string decimal e conferida em centésimos inteiros nos testes. O caso de referência mantém as taxas exatas 300/7% e 37,5%, cuja diferença é −75/14 p.p.; arredondar somente a exibição. Os anos são arbitrários e não representam confirmação da competência da origem real.

O checklist registra resultados esperados, incluindo conflitos, ausência de metas, CSV, idempotência e acesso, sem marcar como implementados os comportamentos futuros. A integridade dos dados de teste é distinta da validação do motor de métricas. Identidade entre operações e representação da cobertura de metas nulas continuam sujeitas à descoberta; nenhuma regra nova foi aprovada nesta tarefa.

## 2026-10-31 — E05-T01: normalização e unidades de deduplicação

O responsável autorizou a implementação pura de metas e deduplicação usando as fixtures sintéticas, mantendo serviços externos adiados. A precedência true > false > null e as unidades técnico-mês e supervisor-técnico-mês seguem REGRAS_NEGOCIO.md. Não foram implementadas taxas, evolução, KPIs ou filtros de fases posteriores.

IDs estáveis, quando fornecidos, têm prioridade sobre nomes. No fallback, normalizar acentos, caixa e espaços. Não associar silenciosamente uma linha sem ID a uma linha com ID só porque compartilham nome: preservar grupos distintos e emitir MIXED_IDENTIFICATION. IDs distintos com mesmo nome permanecem separados e geram HOMONYM. A adoção de IDs exige correspondência consistente na futura importação.

Chaves compostas usam tuplas serializadas. A saída tem ordem determinística e referências de todas as linhas; nenhuma produção é descartada. Múltiplas operações/supervisões no mesmo técnico-mês geram aviso para revisão, sem inventar nova regra de escopo. Divergências e metas indeterminadas também geram avisos. A camada pura não escreve logs: devolve diagnósticos com código, competência e contagem, sem nomes ou IDs; persistência e exposição autorizada serão tarefas da aplicação.

O schema valida o formato mínimo de competência AAAA-MM e as metas já normalizadas. O importador deverá usar a normalização de marcações brutas e tratar os erros explicitamente. O resultado de grupos contém chaves internas potencialmente pessoais; somente os diagnósticos reduzidos podem ser usados em logs de qualidade. Autorização permanece obrigatória no chamador.

## 2026-10-31 — E05-T02: precisão e contratos dos KPIs locais

Os testes de KPIs e evolução foram escritos antes da implementação. Produção será recebida como decimal textual normalizado compatível com Decimal(14,2), somada em centésimos BigInt e dividida sem perda usando razões exatas. Strings com ponto e zero, uma ou duas casas são aceitas; números JS, formato localizado, notação exponencial e escala superior a duas casas serão rejeitados.

Somente a saída decimal de duas casas será arredondada, com empate para longe de zero (half-up); zero arredondado não recebe sinal negativo. As razões exatas, reduzidas, serão retornadas como numerador/denominador textuais para permitir JSON sem converter montantes para float. Não há arredondamento intermediário das taxas antes da evolução.

A série mensal e a evolução receberão o histórico autorizado já restrito por operação/supervisor, sem filtro de mês. Os KPIs de técnicos/produção receberão o conjunto autorizado com todos os filtros aplicáveis. Esta tarefa não implementa esses filtros nem RBAC; separar entradas evita estabelecer um único conjunto incorreto para todos os componentes.

Técnicos com metas nulas permanecem no denominador documentado; a saída inclui quantidade indeterminada, cobertura e avisos. Meses com registros permanecem na cronologia, inclusive se todas as metas forem nulas; essa taxa matemática de paridade não representa confirmação de sucesso. A apresentação deverá exibir os avisos. Com menos de dois meses com registros, evolução é null.

## 2026-10-31 — E05-T03: filtros e fronteira de escopo no servidor

Filtros de meses/operações/supervisores são validados por Zod, com UUIDs para dimensões, AND entre campos e OR dentro da seleção. Seleções vazias significam todos os registros previamente autorizados. O payload é estrito e não aceita perfil ou permissões. Limites técnicos: 120 competências, 200 operações e 500 supervisores por filtro; repetições são removidas.

A aplicação `readProductivityDashboard` é marcada com server-only. O contexto de identidade e operações deve vir de um provedor de sessão/perfil confiável e ser revalidado a cada chamada. Não há implementação de sessão ou autorização fictícia no código de produção. Somente os testes injetam contextos e repositório sintéticos. O marcador server-only é substituído apenas no Vitest para testar a lógica; o Next mantém sua proteção nativa sem depender desse alias de teste.

Sem contexto: UNAUTHORIZED/401. Perfil inválido ou desativado, operação solicitada fora do escopo e retorno do repositório fora do escopo: FORBIDDEN/403, sem resultado parcial. A lista de operações autorizadas deve ser explícita para todos os perfis. Para ADMIN, o futuro provedor deve resolver todas as operações no servidor; lista vazia nunca significa acesso global.

O contrato do repositório exige uma lista não vazia de operações e o predicado operationId IN (...) no banco. Ainda não existe adaptador Prisma: os testes verificam esse contrato, mas não comprovam execução SQL. Enquanto se valida o fluxo local, o caso de uso lê o conjunto autorizado no servidor, deriva filtros e métricas em memória e não expõe nenhuma rota pública nova. Paginação e otimização pertencem às tarefas seguintes.

Operação e Supervisor restringem cards, histórico e evolução; Mês só restringe cards de técnicos/produção e linhas detalhadas. Opções de operação vêm de todo o conjunto autorizado com dados. Opções de supervisor ignoram Mês e pertencem às operações selecionadas. Escolhas de supervisor sem correspondência nesse conjunto são descartadas, como exige a troca de operação; isso nunca amplia o escopo autorizado. Opções de mês vêm da série já restrita por operação/supervisor. A saída informa filtros efetivos e IDs solicitados descartados, sem revelar rótulos de escopos não autorizados.

## 2026-10-31 — E05-T04: endpoints privados e demonstração separada

O responsável autorizou os endpoints de leitura mantendo a validação local sem login real. As rotas v1 do dashboard permanecem fechadas (401) com um provedor explicitamente não configurado; não existe atalho para transformar cookie, query ou cabeçalho em permissão. A integração Supabase/Prisma permanece pendente.

Foi criado um namespace separado `/api/demo/dashboard/` para os quatro contratos, restrito a desenvolvimento, hostname local e origem não cross-site. O contexto e as operações da demonstração são fixos no servidor; o dataset é fictício e construído em adaptador dedicado, sem importar fixtures de testes para a aplicação. Em produção, a rota demo retorna 404. As respostas são marcadas como sintéticas. Essa exceção não autoriza dados reais ou endpoints anônimos de produção.

Agregação de supervisão usa a unidade supervisor × técnico × mês da E05-T01, soma numeradores/denominadores e ordena pela taxa exata, com desempate alfabético e por ID. Não calcula média de percentuais. O handler projeta somente DTOs necessários, sem linhas ou chaves pessoais. Produção continua decimal textual; percentuais são convertidos para números apenas depois de formatados com duas casas.

Entrada inválida recebe erro 400 reduzido, acesso negado usa 401/403 e falhas internas, inclusive dados inválidos do repositório, usam 500 genérico. O caso de uso diferencia erro de filtros de erro do repositório. Nenhum handler publica mensagens internas ou grava payloads em logs. Respostas usam cache privado/no-store. O contrato atualizado está em CONTRATOS_API.md; a autenticação real e o predicado SQL ainda precisam de validação nas etapas correspondentes.

## 2026-10-31 — E06-T01: shell de demonstração em Server Components

O responsável autorizou organizar o dashboard local. A raiz passa a orquestrar o caso de uso no servidor com o adaptador exclusivamente sintético, após verificar desenvolvimento. Não é feita chamada HTTP da página para o próprio servidor. A apresentação recebe somente o resumo calculado; não contém regras de cálculo ou consultas.

O shell compartilhado inclui marca, título/subtítulo, navegação com página atual, link de salto e rodapé. O dashboard exibe os quatro indicadores fictícios em pt-BR e reservas explícitas para gráficos e detalhamento. Essa demonstração preenchida não equivale à conexão dos cards aos endpoints privados da E06-T03, ainda pendente.

A galeria genérica fica em `/componentes`, separada da visão operacional e também indisponível em produção. O adaptador demo agora verifica desenvolvimento na própria construção das dependências, além da proteção de rota existente. Não foi criada `/dashboard` sem autenticação, nem layout de produção com identidade simulada. A proteção real por sessão da E06-T01 depende da Etapa 02 adiada; o escopo entregue é o shell local bloqueado em produção.

Formatação decimal usa strings para preservar a produção sem float. Evolução mostra sinal, cor, ícone, meses/taxas usados e descrição em pontos percentuais. Filtros, gráficos, tabela funcional, exportação, refresh e alternância de tema continuam nas tarefas correspondentes.

## 2026-10-31 — E06-T02: multisseleção e URL no dashboard local

O responsável autorizou os filtros de Mês, Operação e Supervisor na demonstração. As seleções ficam na URL e são lidas pela página Server Component, usando o mesmo parser e caso de uso dos endpoints. O cliente envia somente filtros, nunca identidade ou permissões. A atualização usa navegação Next com scroll preservado e feedback de transição; o checkbox exibe a seleção otimista imediatamente, e o servidor continua sendo a autoridade.

Cada campo tem pesquisa insensível a caixa/acentos, checkboxes, selecionar tudo e limpar seleção. Selecionar tudo considera todas as opções disponíveis do campo, mesmo durante pesquisa; limpar deixa a seleção vazia, que significa todos os registros permitidos conforme o contrato. As opções autorizadas são fornecidas pelo servidor.

As opções de supervisor passaram a incluir operationIds das associações existentes dentro do escopo autorizado. Isso permite remover escolhas incompatíveis ao trocar Operação sem descartar um supervisor compartilhado entre operações. A validação pura continua repetindo a regra no servidor; links com escolhas incompatíveis são redirecionados à URL com filtros efetivos. Nenhuma associação de operação não autorizada é enviada.

A raiz trata filtros inválidos/não autorizados com alerta nomeado e retorno à demonstração completa, sem renderizar indicadores ou erros internos. O parser mantém campos desconhecidos para que a validação possa rejeitá-los; não remove silenciosamente tentativas de enviar perfil. A proteção de produção permanece anterior ao processamento de parâmetros.

Cards e período/contagens refletem o recorte dos filtros; a evolução mantém o histórico autorizado sem Mês. Gráficos e detalhamento ainda são áreas reservadas. Esta tarefa não implementa a API privada real, os botões globais da E06-T04 nem o estado futuro de busca/ordenação/paginação do detalhamento.

## 2026-10-31 — E06-T03: cards e contrato único do resumo

O responsável autorizou integrar os cards aos contratos de leitura. A projeção/validação do DTO summary foi extraída para um contrato puro compartilhado pelo handler e pelo Server Component. A página lê pelo caso de uso e consome exatamente o mesmo DTO; não faz chamada HTTP ao próprio Route Handler. Isso segue a orientação da documentação Next.js instalada para Server Components e evita duplicar transporte ou consultas.

O contrato inclui rowCount, preserva produção como texto decimal e valida contagens, disponibilidade de média, percentuais finitos de duas casas, cronologia e coerência da direção/diferença com a razão exata. Somente percentuais já arredondados são convertidos para Number; produção continua textual. Razões inválidas não chegam à aritmética do refinamento. Não foram alteradas as regras de cálculo do domínio.

Os cards ficam em `presentation/summary-indicators.tsx`. Recorte vazio mostra total zero, média indisponível e aviso; a Evolução pode continuar válida pelo histórico. Sem histórico suficiente, mostra indisponibilidade. Metas nulas/conflitantes recebem ressalva visível. Demais avisos reduzidos ficam em detalhes de qualidade sem nomes ou IDs pessoais.

Falha de leitura ou contrato inválido mostra estado genérico de indicadores indisponíveis sem valores, mensagem interna ou fallback para dados anteriores. Erros de filtros mantêm o tratamento da E06-T02. Transições continuam com o estado de atualização dos filtros. Nenhum fetch cliente, cache compartilhado, sessão real, repositório real ou nova permissão foi adicionado. A correspondência API/HTML é verificada em navegador para recortes sintéticos distintos.

## 2026-10-31 — E06-T04: ações compactas e tema persistido

O responsável autorizou atualizar, tema, limpar e preparar a exportação sem antecipar CSV. Atualizar usa router.refresh dentro de uma transição e preserva a URL; não reimporta planilha nem altera filtros. O botão anuncia a atualização e bloqueia ações repetidas enquanto pendente. A conclusão não cria mensagem de sucesso de negócio: falhas continuam sendo apresentadas pelos estados do resumo.

Tema usa next-themes já instalado, com escuro como padrão, preferência explícita em localStorage (servlog-theme) e sistema desativado. O script do provedor aplica a classe antes da hidratação. O controle usa snapshot de hidratação para manter o HTML inicial consistente; suppressHydrationWarning fica restrito ao elemento html cujos atributos o provedor altera. Tokens CSS foram organizados para claro/escuro, preservando cores Servlog e adaptando textos de avisos e sinais dos KPIs. Notificações passam a seguir o provedor.

Limpar filtros remove todas as seleções da URL e solicita novo recorte. Exportar CSV permanece semanticamente indisponível, com tooltip explicativo acessível por foco. Nenhum download ou endpoint de exportação foi criado; a lógica completa de CSV continua na E08-T03. Controles indisponíveis usam aria-disabled com guarda de ação, permitindo consultar o motivo por teclado.

O ambiente unitário recebeu um substituto de ResizeObserver porque jsdom não realiza layout; ele não calcula posições nem é usado pela aplicação. Posicionamento, persistência real do tema, navegação e requisição de atualização são verificados com Chromium em desktop/mobile. Sem nova dependência, dado real ou mudança na autenticação.

## 2026-11-01 — E04-T03: formulário manual e prévia de planilhas

Por solicitação do responsável, preparar duas entradas para ProductivityRecord: formulário manual e planilha CSV/XLSX, compartilhando validação Zod e prévia. O modelo em MODELO_DADOS.md é proposto; não existem schema Prisma, repositórios nem catálogos reais implementados. Esta entrega não cria tabelas nem grava no Supabase de produção. IDs, permissões, sourceRowKey, autor e lote não são editáveis; nomes são propostas de vínculo, que exigirão revisão por identificador antes de gravar. Nenhuma dimensão é criada implicitamente.

A rota /admin/dados exige ADMIN no servidor. A demonstração /demo/dados existe somente em desenvolvimento e não envia arquivos ao servidor. Toda conferência é local, transitória em memória, sem localStorage, logs ou endpoint de upload. Validação cliente não autoriza futura gravação: E04-T04 deverá repetir validação, verificar permissão e escopo, resolver dimensões e aplicar transação/idempotência/auditoria no servidor.

Usar shadcn Card, Tabs, Input, Label, NativeSelect, Alert e Table; nenhuma nova primitiva UI própria. CSV UTF-8 com BOM opcional, delimitador ponto-e-vírgula ou vírgula e aspas escapadas. XLSX lido sob demanda com read-excel-file, sem biblioteca de edição de planilhas. Limites conservadores para conferência local: 1 MiB de arquivo, 1.000 linhas, 20 colunas e 200 caracteres por célula; XLSX com tamanho descompactado declarado limitado a 10 MiB, sem ZIP64/encriptação. Rejeitar XLS e fórmulas de entrada textual, sem execução de conteúdo. Estes limites não substituem controles de upload no servidor, ainda ausente.

Competência explícita AAAA-MM ou nome de mês com ano informado pelo administrador, nunca ano corrente implícito. Produção textual decimal com até 12 dígitos inteiros e duas casas, aceitando formato brasileiro ou decimal canônico inequívoco, sem float/intermediário arredondado. Contrato textual preserva zeros; células numéricas XLSX em contrato são rejeitadas pois os zeros originais não podem ser recuperados. Meta usa o normalizador existente (incluindo vazio=null). Linhas iguais são sinalizadas e preservadas, não deduplicadas nem vinculadas por nome. Prévia não se apresenta como importação concluída. BACKLOG permanece sem marcar até satisfazer o aceite completo da fase, cujo documento original docs/etapas/04-importacao.md está ausente.

## 2026-11-02 — E02-T04: diretório e cadastro administrativo de usuários

O responsável solicitou /admin/usuarios e escolheu senha inicial definida pelo administrador. A entrega usa Supabase Auth Admin API exclusivamente no servidor para listar/criar contas, mantendo app_metadata como fonte transitória de papel/atividade/escopo até UserProfile/Prisma. Nenhum acesso às tabelas de negócio via Data API; nenhuma conta real será criada durante testes. Sem signup público.

Adicionar users:read apenas para ADMIN e manter users:create. Página, listagem e criação revalidam identidade do servidor. Apenas email, papel, data e situação são projetados para o frontend; nunca serializar User bruto/metadados/tokens. Paginação de 20 contas, sem truncar o diretório à primeira página. Dados sem cache compartilhado. Sem chave administrativa configurada, apresentar indisponibilidade e bloquear escrita, sem lista vazia enganosa nem fallback fictício em produção. SUPABASE_SECRET_KEY é privada, validada com Zod e usada em cliente server-only sem persistência de sessão; nunca usar chave publishable para Auth Admin nem expor segredo via NEXT_PUBLIC.

Cadastro por ADMIN: email validado, papel ADMIN/USER, senha inicial de 12 a 128 caracteres e confirmação idêntica. Senhas sem trim, sem retorno ao navegador, logs ou persistência local; limpar campos após tentativa/fechamento. Auth gerencia credenciais. A conta é criada administrativamente com email_confirm=true para permitir login com a senha inicial sem fluxo de convite, conforme a escolha expressa do responsável; isso não habilita autoinscrição e confia no ADMIN para verificar o endereço e entregar o acesso. Nenhum email automático será enviado. Esta decisão substitui o convite obrigatório somente neste fluxo de provisionamento; futuros convites/reset continuam separados. Perfil ativo e operation_ids=[] definidos pelo servidor, sem herança ou concessão de escopo vinda do formulário. Novos usuários começam sem operações atribuídas. Alteração obrigatória de senha no primeiro acesso não está implementada e não deve ser anunciada.

O formulário compõe Dialog, Input, Label, NativeSelect, Button e Alert; diretório usa Card e Table shadcn/ui existentes. Nenhuma nova primitiva, dependência ou migration. A demo /demo/usuarios só existe em desenvolvimento: contas sintéticas em memória, e-mails restritos ao domínio reservado example.invalid; nunca chama Auth Admin, envia email, grava senhas ou cria contas reais. Rota privada continua funcional apenas após configurar credencial server-only e autenticar ADMIN. Não alterar backlog completo de identidade local; fase original docs/etapas/02-autenticacao.md segue ausente.

### Ajuste de compatibilidade da senha inicial (2026-11-02)

Na revisão da referência oficial Supabase Auth, internal/api/password.go define limite bcrypt de 72 bytes. O máximo inicial de 128 caracteres foi corrigido antes da entrega: mínimo 12 caracteres, máximo 72 bytes UTF-8, sem truncamento nem trim. Testes de fronteira ASCII e multibyte acrescentados antes da alteração do validador. A UI explica que acentos/emojis podem reduzir o limite de caracteres. Fonte: https://github.com/supabase/auth/blob/master/internal/api/password.go . Essa revisão substitui o limite 128 mencionado na decisão inicial acima.
