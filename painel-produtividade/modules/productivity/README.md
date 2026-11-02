# Produtividade

`presentation/local-preview.tsx` compõe o dashboard de demonstração a partir de um resumo calculado no servidor, usando o shell e cards puros de `components/dashboard/`. A galeria interativa está separada em `/componentes`. Ambas as páginas são limitadas ao desenvolvimento.

A rota `app/page.tsx` restringe a demonstração ao desenvolvimento antes de construir o adaptador sintético e chamar o caso de uso. Não existe rota `/dashboard`; os endpoints de leitura estão descritos na E05-T04 abaixo.

`domain/goal-normalization.ts` normaliza as marcações documentadas para true/false/null e retorna um código de erro para valores desconhecidos. `domain/goal-deduplication.ts` valida linhas com Zod e agrupa por técnico-mês ou supervisor-técnico-mês, preservando as referências das linhas originais e os avisos de qualidade.

IDs estáveis têm prioridade. Na ausência deles, nomes são normalizados por acentos, caixa e espaços. Nomes e IDs não são reconciliados automaticamente; identificação mista, homônimos e múltiplos escopos produzem avisos. A chave composta usa tuplas serializadas para evitar colisões de separadores. As chaves dos grupos são internas e podem conter nomes normalizados; não devem ser publicadas ou logadas.

A precedência é true, depois false, depois null. Conflitos true/false e grupos somente nulos continuam identificáveis. Nenhuma função modifica as linhas de entrada ou elimina linhas de produção. Os avisos contêm somente código, competência e contagem de linhas; persistência em auditoria será responsabilidade dos casos de uso.

O chamador deve aplicar autorização e filtros antes de deduplicar; o domínio não faz RBAC. As camadas `application/` e `infrastructure/` serão criadas quando implementadas as tarefas correspondentes.

## KPIs e evolução — E05-T02

`domain/productivity-metrics.ts` expõe:

- `calculateKpis(records)`: técnicos distintos, quantidade de linhas, total e média por linha original. Recebe o conjunto com todos os filtros aplicáveis.
- `calculateMonthlyPerformance(records)`: taxas e cobertura por competência, com técnicos indeterminados no denominador e avisos de qualidade.
- `calculateEvolution(records)`: compara os dois meses cronologicamente mais recentes com registros e devolve diferença absoluta em pontos percentuais, taxas usadas, meses e direção. Não cria meses sem registros.

As duas funções históricas devem receber o conjunto autorizado por operação/supervisor sem o filtro Mês. O domínio não recebe parâmetros de filtro nem autentica o usuário. Não passar o conjunto restrito ao mês dos cards como histórico de evolução.

Produção aceita texto decimal normalizado compatível com Decimal(14,2), com zero a duas casas. É somada em centésimos BigInt; a média e as taxas preservam razões exatas em `domain/exact-ratio.ts`. As razões são serializáveis em JSON: numerador e denominador textuais. Os campos decimais retornam strings com ponto e duas casas; formatação pt-BR, símbolos e cores ficam na apresentação. Arredondamento half-up ocorre apenas ao gerar essas strings, sem zero negativo.

Base vazia retorna total `0.00`, média null e nenhuma série; menos de dois meses retorna evolução null. Metas indeterminadas não viram conquistas nem são descartadas do denominador. Taxa matemática zero com cobertura zero exige aviso na futura interface; não representa desempenho conhecido.

A E05-T02 não conectou UI, Supabase ou endpoints. Filtros e aplicação de escopo estão descritos na E05-T03 abaixo. A série de supervisores ainda não foi agregada para o gráfico; a unidade de deduplicação necessária já existe na E05-T01.

## Filtros e escopo — E05-T03

`domain/productivity-filters.ts` valida filtros e linhas com IDs UUID, separa `filteredRows` (todos os filtros) de `timelineRows` (somente Operação e Supervisor) e produz opções/filtros efetivos. A função é pura e não autoriza ninguém; usar somente sobre linhas previamente autorizadas. A seleção de supervisores incompatíveis é removida ao restringir operações.

`application/read-productivity-dashboard.ts` é exclusivo do servidor e exige dois contratos concretos: provedor da identidade/perfil/escopo atual e repositório com consulta obrigatoriamente restrita por operações. O provedor é chamado em cada execução; contexto ausente, inativo ou inválido e operação não autorizada bloqueiam a leitura. O provedor real continua não configurado; a E05-T04 adiciona um adaptador exclusivamente sintético para a rota demo separada, descrita abaixo.

Todos os papéis recebem uma lista explícita de operações autorizadas; para ADMIN, o provedor futuro deverá listar todas as operações. Escopo vazio retorna dados vazios sem consultar o repositório. O retorno do repositório também é conferido e uma violação bloqueia o resultado inteiro. O adaptador Prisma deverá aplicar o escopo na consulta; a conferência posterior não o substitui.

O caso de uso compõe KPIs, evolução, série mensal, opções e linhas filtradas, sem nova rota ou integração com a interface. O conjunto retornado é interno ao servidor; o futuro handler deverá paginar detalhes, sanitizar erros e devolver somente DTOs necessários. O processamento em memória é uma etapa local anterior ao adaptador real e à otimização, não uma autorização para carregar tabelas completas no navegador.

## HTTP e supervisão — E05-T04

`presentation/dashboard-http.ts` valida filtros por meio do caso de uso, projeta DTOs para summary/monthly/supervisors/filters e sanitiza erros. As rotas dinâmicas em `app/api/` somente encaminham Request e o tipo de leitura. `domain/supervisor-performance.ts` agrega a unidade supervisor-técnico-mês, preserva avisos e ordena por taxa exata.

`infrastructure/dashboard-dependencies.ts` mantém as rotas v1 fechadas (401) enquanto não existem sessão e repositório reais. `infrastructure/demo-dashboard.ts` constrói somente dados fictícios, restringe a demonstração a desenvolvimento/local/origem compatível e marca as respostas. Não importa testes para a aplicação. Nenhum parâmetro controla o perfil ou as operações desse adaptador.

Os endpoints devolvem somente indicadores, avisos reduzidos e opções de filtro. Não devolvem as linhas que o caso de uso manipula internamente. Produção permanece decimal textual; percentuais finais são números e as razões exatas continuam textuais. O adaptador real e a validação SQL permanecem pendentes.

## Filtros da interface — E06-T02

`presentation/dashboard-filters.tsx` controla transições e seleções otimistas, usando o componente genérico `components/dashboard/multi-select-filter.tsx`. A fonte persistente é a URL; `domain/filter-query.ts` compartilha a conversão entre URL e filtros com o handler HTTP. A página de rota orquestra a leitura no servidor, sem mover regras para o cliente.

As opções de supervisor contêm associações operationIds dentro do conjunto autorizado. O cliente usa essas associações para remover escolhas incompatíveis; a seleção pura no servidor revalida tudo. O cliente não recebe linhas de técnicos nem contexto de acesso. Apenas opções, filtros efetivos e seus IDs de dimensão são passados à parte interativa.

A página trata erros de entrada/acesso com mensagem genérica e usa redirect para remover supervisores descartados da URL. A restrição ao ambiente de desenvolvimento permanece antes de qualquer leitura ou processamento dos filtros.

## Cards integrados — E06-T03

`application/dashboard-summary-contract.ts` define o schema e a projeção única de summary para API e Server Components. `presentation/summary-indicators.tsx` recebe esse DTO validado e cuida somente de formatação e apresentação. A página orquestra a leitura e validação sem fazer HTTP ao próprio handler.

O contrato não inclui linhas ou chaves de identificação e mantém produção decimal textual. Recorte vazio, histórico insuficiente, metas desconhecidas/conflitantes e falhas de leitura têm estados próprios. Avisos de identificação/escopo são apresentados por código, sem expor nomes ou IDs nos detalhes de qualidade.

Os testes de navegador comparam os quatro cards com a resposta summary sob os mesmos filtros. Não existe integração com a API privada real enquanto sessão e repositório não forem conectados; as proteções de produção permanecem ativas.

## Ações de interface — E06-T04

`components/dashboard/dashboard-actions.tsx` concentra controles cliente de atualização e tema, além dos botões junto aos filtros. Atualizar reexecuta a leitura RSC, sem enviar permissões ou trocar a URL. A seleção é limpa pelo mesmo fluxo validado de filtros. Exportação permanece indisponível até a E08-T03.

O provedor em `components/theme-provider.tsx` é apenas de apresentação e persistência da preferência local, sem identidade. O shell e os cards continuam Server Components. Nenhum caso de uso de produção, autorização ou consulta foi alterado para suportar os botões.

## Supervisão — E07-T02

Os gráficos compartilham `components/dashboard/performance-chart-frame.tsx` desde a E07-T03. O suporte renderiza detalhes por portal fora da rolagem SVG, aplica tema e preserva unidades recebidas. Regras e DTOs permanecem no módulo; não há leitura de dados nesse componente UI.

O caso de uso também calcula supervisão sobre filteredRows autorizadas. `application/dashboard-supervisors-contract.ts` projeta o DTO único para API/página, validando contagens e ordenação exata. O painel RSC `presentation/supervisors-performance-panel.tsx` oferece tabela/avisos; `components/dashboard/supervisors-chart.tsx` recebe somente agregados para interação. Todos os filtros se aplicam. A unidade é supervisor × técnico × mês, sem média simples de taxas nem exposição de linhas de técnicos.

## Série mensal — E07-T01

`application/dashboard-monthly-contract.ts` valida e projeta a série calculada no domínio para a API e a página. `presentation/monthly-performance-panel.tsx` mantém estrutura, avisos e tabela como RSC; `components/dashboard/monthly-chart.tsx` recebe somente pontos agregados para Recharts. A leitura permanece no servidor e usa timelineRows: ignora somente Mês. Não há nova consulta no browser ou HTTP interno. Meses ausentes não recebem pontos inventados. A série inclui contagem de indeterminados e cobertura.

## Detalhamento paginado — E08-T01

`domain/productivity-page.ts` valida a query e contém seleção/ordenação/paginação puras do adaptador sintético. `application/read-productivity-page.ts` autentica, restringe o escopo e chama o contrato paginado do repositório, sem calcular agregados. Projeta somente seis colunas e metadados. `presentation/productivity-page-http.ts` sanitiza erros e define headers privados. Helpers de acesso e origem demo são compartilhados com o dashboard. O adaptador privado permanece desconectado; o sintético é independente de Prisma/Supabase e roda só no servidor. A implementação SQL deverá ordenar/filtrar/contar e paginar no banco, não carregar a tabela inteira.

## Tabela — E08-T02

`presentation/productivity-details.tsx` é RSC e renderiza a página validada do caso de uso, sem HTTP interno. `productivity-details-controls.tsx` consome o controller compartilhado e navega por router.push; a seleção/ordenação/paginação de linhas continua no servidor. Os helpers de URL separam os parâmetros conhecidos da tabela sem remover parâmetros desconhecidos da validação. O Table puro do shadcn permite configurar o contêiner de rolagem por containerProps. Na E08-T04, domain/dashboard-state.ts centraliza validação, serialização e transições; presentation/dashboard-state-provider.tsx compartilha navegação/estado pendente entre filtros, tabela e CSV. Não armazena linhas ou permissões. Filtros globais preservam pesquisa/ordem/tamanho; Limpar remove dimensões e pesquisa; ambos voltam à primeira página. O servidor reconcilia supervisores incompatíveis sem apagar escolhas válidas.

## CSV — E08-T03

`domain/productivity-csv.ts` define formato/escape/proteção de texto. `application/export-productivity-csv.ts` lê todos os lotes pelo caso de uso paginado, revalida acesso e metadados, limita linhas/bytes e só entrega o arquivo completo validado. `presentation/productivity-export-http.ts` controla transporte/erros/headers. O rótulo de competência foi extraído para helper puro `domain/reference-month.ts`, reexportado pela apresentação, sem mudar formatação. O cliente recebe somente href do recorte validado; não gera CSV a partir da página visível. Produção não passa por float ou prefixo de texto. Snapshot SQL/auditoria/rate limit persistentes permanecem pendentes.
