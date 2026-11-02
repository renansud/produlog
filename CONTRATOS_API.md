# Contratos de API (proposta v1)

## Estado implementado na E05-T04

Os quatro GETs de dashboard (`summary`, `monthly`, `supervisors`, `filters`) existem sob `/api/v1/dashboard/`. Enquanto Supabase Auth e o repositório real não forem conectados, retornam **401**, inclusive em desenvolvimento. Não aceitam perfil, escopo ou permissões via query string. A aplicação de leitura continua revalidando o provedor de acesso; os endpoints são exclusivos de runtime Node e dinâmicos.

Para a validação sem login real, os mesmos contratos estão em `/api/demo/dashboard/{summary|monthly|supervisors|filters}`. Somente funcionam em `NODE_ENV=development`, com hostname local (127.0.0.1, localhost ou ::1) e sem origem cross-site. Retornam `demo: true` e `X-Servlog-Demo: synthetic`; o dataset é inteiramente fictício. Em produção, todas as rotas demo retornam 404, sem permitir ativação por parâmetros ou cabeçalhos.

Filtros aceitos: somente `months`, `operations`, `supervisors`, separados por vírgula ou parâmetros repetidos. Valor vazio equivale a nenhuma seleção. Mês inválido, UUID inválido, valor vazio entre duas vírgulas e parâmetro desconhecido resultam em 400 após a verificação de acesso. Os limites são 120 meses, 200 operações e 500 supervisores; duplicatas são normalizadas. Operação fora do escopo: 403. Endpoint desconhecido: 404. Erro interno: 500 com mensagem genérica. Todas essas respostas GET usam `Cache-Control: private, no-store`, `Vary: Cookie` e `X-Content-Type-Options: nosniff`.

DTOs implementados:

- `summary`: técnicos, total e média (produção como strings decimais), evolução null ou com meses, percentuais numéricos finais, diferença em p.p., razão exata textual e direção. `quality` contém avisos dos cards e da evolução.
- `monthly`: `series` com mês, técnicos, metas, indeterminados, taxa e cobertura numéricas; razão exata textual; `quality.warnings`. Ignora somente `months`.
- `supervisors`: `series` com UUID/nome do supervisor, total de técnicos-mês, conquistas, indeterminados, taxa e cobertura; `quality.warnings`. Aplica todos os filtros. Ordenação por taxa exata decrescente e desempate pelo nome/ID.
- `filters`: meses e opções de operação/supervisor com ID/rótulo, `selected` com filtros efetivos e `discardedSupervisorIds`. Opções permanecem restritas ao escopo.

Extensão E06-T02: cada opção de supervisor também informa `operationIds`, contendo somente associações de operações autorizadas. A interface usa essa informação para preservar supervisores compartilhados ao mudar a seleção de operações; o servidor revalida a regra e não recebe permissões do cliente.

Extensão E06-T03: `summary` também informa `rowCount`. A projeção e validação estão centralizadas em `modules/productivity/application/dashboard-summary-contract.ts`, consumidas tanto pelo handler quanto pelos cards Server Components. O schema exige contagens válidas, produção decimal textual, percentuais finitos em duas casas e evolução coerente com a razão exata/direção. Sem linhas, total é `0.00` e média é null; evolução pode continuar disponível pelo histórico sem Mês. O campo `demo: true` é metadado adicional do transporte de demonstração e não integra o DTO puro compartilhado.

Os percentuais são convertidos para números somente após o arredondamento final; valores de produção não passam por float. Nenhum DTO de dashboard contém linhas de técnicos, contratos ou chaves internas. Detalhamento paginado e CSV foram implementados nas E08-T01/T03 conforme as seções abaixo; importações via API continuam propostas. Administração de contas usa /admin/usuarios (RSC + Server Action), com Auth Admin no servidor e permissões users:read/users:create exclusivas de ADMIN. GET /api/v1/users continua proposto, sem Route Handler nesta entrega.

## Detalhamento paginado — E08-T01

`GET /api/v1/productivity` está implementado e retorna 401 enquanto a sessão real não for conectada. `GET /api/demo/productivity` funciona somente em desenvolvimento local, com o mesmo bloqueio de hostname/origem da demo do dashboard. Em produção retorna 404. A exportação CSV está descrita na E08-T03 abaixo.

Parâmetros aceitos:

| Campo | Regra/padrão |
| --- | --- |
| months, operations, supervisors | Mesmos formatos e limites do dashboard; vírgulas ou parâmetros repetidos |
| search | Texto com até 120 caracteres após trim; vazio equivale a todos |
| page | Inteiro de 1 a 1.000.000; padrão 1 |
| pageSize | Inteiro de 1 a 100; padrão 50 |
| sort | month, supervisor, technician, contract, production ou goalMet; padrão month |
| direction | asc ou desc; padrão desc |

Parâmetros escalares repetidos, desconhecidos ou malformados resultam em 400 após autenticação; parâmetros de permissão nunca são aceitos. Inteiros na URL usam dígitos sem sinal/decimais/exponencial ou zeros iniciais. Operação não autorizada resulta em 403 antes de consultar o repositório. Supervisores incompatíveis com as operações são descartados e informados, seguindo o dashboard; essa compatibilidade não depende de Mês.

Pesquisa ignora caixa/acentos e considera competência YYYY-MM/nome pt-BR, supervisor, técnico, contrato, produção decimal com ponto/vírgula e meta Sim/Não/—. É substring textual, não expressão regular. Aplica-se depois dos filtros e antes da contagem/paginação. Produção é ordenada numericamente com aritmética inteira exata; mês inclui ano; textos/contratos usam ordenação pt-BR, preservando zeros. Em goalMet, asc ordena Não/Sim/indeterminado; desc ordena Sim/Não/indeterminado. Empates usam identificador interno estável da linha em ordem ascendente, independentemente da direção principal.

Resposta: `items` contém somente month, supervisor, technician, contract, production (texto com duas casas) e goalMet (boolean/null). `pagination` contém page, pageSize, total, totalPages, hasNextPage e hasPreviousPage. `selected` informa filtros efetivos, search, sort e direction; `discardedSupervisorIds` informa as seleções removidas. Não expõe chaves internas, operação, controlador ou status. A demo acrescenta `demo: true` e `X-Servlog-Demo: synthetic`.

Página além do fim devolve items vazio, preservando total e página solicitada; totalPages é zero para conjunto vazio. hasPreviousPage indica page > 1; hasNextPage indica page < totalPages. Linhas de produção não são deduplicadas.

O caso de uso revalida acesso a cada chamada e fornece escopo não vazio ao repositório. Escopo vazio não faz consulta. O contrato do repositório exige SQL com autorização/filtros/pesquisa/ordem antes de LIMIT/OFFSET e contagem sob o mesmo predicado. O adaptador atual é exclusivamente sintético, em memória, com 15 linhas no servidor; o repositório SQL paginado continua pendente da integração de banco. A aplicação rejeita páginas retornadas fora do escopo/filtros, com tamanho/contagem incoerentes ou ordem inválida. Respostas GET usam private,no-store, Vary: Cookie e nosniff, inclusive erros sanitizados. POST retorna 405; HEAD mantém a autorização de GET.

Exemplo local: `/api/demo/productivity?months=2026-07&operations=10000000-0000-4000-8000-000000000001&search=tec-0&sort=technician&direction=desc&pageSize=2` retorna TEC-04 e TEC-03, total 4, duas páginas; page=2 retorna TEC-02 e TEC-01.

Extensão E08-T02: a página principal lê o mesmo caso de uso/DTO diretamente no servidor, sem HTTP interno, e mostra a tabela shadcn. Na página, o padrão é 10 linhas (a API conserva 50). Os controles de tabela usam page, pageSize, search, sort e direction na URL; Mês/Operação/Supervisor continuam globais. Busca e paginação da tabela não alteram cards/gráficos. Pesquisa, nova coluna/direção ou tamanho reiniciam a página; trocar filtros globais preserva pesquisa aplicada, ordem e tamanho e reinicia somente a página (E08-T04). Voltar/recarregar restaura a URL. Erros de parâmetros exclusivos da tabela ficam no painel de detalhamento, preservando cards; parâmetros globais desconhecidos continuam rejeitados. Na E08-T04, Limpar filtros remove dimensões e pesquisa aplicada, preservando ordem/tamanho. Um controller compartilhado usa a URL validada no servidor e bloqueia controles/CSV durante transições. A remoção de supervisor incompatível preserva parâmetros válidos do detalhamento e volta à página 1. A URL da UI omite pageSize=10; a API mantém padrão 50. Rascunho de pesquisa não afeta CSV e é descartado ao navegar.

## Exportação CSV — E08-T03

GET `/api/v1/productivity/export` exige a mesma autorização da tabela e permanece 401 sem sessão real. GET `/api/demo/productivity/export` é exclusivo de desenvolvimento local; em produção retorna 404. HEAD conserva proteção e POST retorna 405.

Aceita os mesmos parâmetros do detalhamento. page/pageSize devem ser válidos, mas não limitam o arquivo: a exportação começa na primeira página, com lotes internos de 100, e inclui o resultado completo após filtros/pesquisa/ordem. O botão junto aos filtros recebe a seleção efetivamente aplicada pelo servidor; uma alteração de recorte desmonta/cancela o controle pendente. Paginação/tamanho não mudam o conteúdo do CSV. Sem detalhamento válido, o botão fica indisponível.

Arquivo: UTF-8 com BOM, delimitador `;`, registros CRLF e seis colunas Mês, Supervisor, Técnico, Contrato, Produção, Meta Batida. Campos são citados, com aspas internas duplicadas; mês usa o mesmo rótulo pt-BR da tabela e produção usa decimal com vírgula, duas casas, sem agrupamento. Valores negativos de produção permanecem numéricos. Textos perigosos recebem apóstrofo antes da codificação CSV, incluindo operadores após espaços/controles e variantes full-width. Contratos mantêm os zeros no conteúdo textual do arquivo; a inferência de tipos do programa importador não é controlada pelo formato CSV.

Limites: 10.000 linhas e 5 MiB, sem truncamento. 413/EXPORT_LIMIT indica resultado excedido; 409/EXPORT_CHANGED indica alteração detectada de contagem/seleção entre lotes. Identidade, papel e operações são revalidados entre lotes; mudança de acesso interrompe com 401/403. Erros não têm Content-Disposition nem CSV parcial. O conteúdo é montado sob os limites antes de devolver o anexo, para validar a exportação inteira antes de enviá-la.

Sucesso usa `Content-Type: text/csv; charset=utf-8`, Content-Disposition attachment com filename ASCII fixo, Content-Length em bytes, private/no-store, Vary: Cookie e nosniff. A demo acrescenta X-Servlog-Demo: synthetic. O botão tem estado ocupado, bloqueio de repetição e feedback de erro/nova tentativa; o Blob só vira download após resposta CSV válida.

O adaptador atual é sintético. Snapshot transacional de SQL, auditoria persistente e rate limit distribuído continuam pendentes da integração real; a coerência de metadados entre lotes não detecta toda alteração de valores com contagem igual. Não há garantia de sanitização universal após regravar/reabrir em todos os programas de planilha; os testes verificam o arquivo gerado, sem executar Excel/LibreOffice.

Exemplo local: `http://127.0.0.1:3000/api/demo/dashboard/summary?months=2026-07` retorna técnicos 8, total `800.00`, média `100.00` e evolução −5,36 p.p. A série mensal continua contendo junho e julho; a supervisão de julho retorna taxas 50% e 25%.

Todos os endpoints privados exigem sessão validada no servidor e retornam somente operações autorizadas. Filtros são validados por Zod. Preferir Server Actions para mutações de formulário internas, mas manter Route Handlers para leituras/CSV usados pelo dashboard.

## Convencões

- Prefixo: `/api/v1/`.
- Datas: `YYYY-MM`, com ano explícito.
- `months`, `operations`, `supervisors`: parâmetros múltiplos, por exemplo `?months=2026-06,2026-07&operations=abc,def`.
- Identificadores: UUIDs de dimensões, salvo mês.
- Paginação: `page=1&pageSize=50`, limite de 100 para JSON.
- Ordenação: `sort=production&direction=desc`; whitelist no servidor.
- Respostas com `Cache-Control: private, no-store` para dados confidenciais.
- Erros estruturados: `{ "error": { "code": "UNAUTHORIZED", "message": "..." } }`.

## Endpoints principais

| Método/rota | Uso | Perfil mínimo |
|---|---|---|
| `GET /api/v1/dashboard/filters` | listas autorizadas de meses/operações/supervisores | USER |
| `GET /api/v1/dashboard/summary` | técnicos, evolução, média e produção total | USER |
| `GET /api/v1/dashboard/monthly` | Performance Mensal (ignora `months`) | USER |
| `GET /api/v1/dashboard/supervisors` | Performance Mensal Supervisão | USER |
| `GET /api/v1/productivity` | tabela, busca, classificação e paginação | USER |
| `GET /api/v1/productivity/export` | CSV, todas as linhas visíveis após filtros/busca/ordem | USER |
| `POST /api/v1/imports` | upload validado/preview/confirmação | ADMIN |
| `GET /api/v1/imports` | histórico e status de importação | ADMIN |
| `POST /api/v1/imports/:id/commit` | importar lote aprovado, idempotente | ADMIN |
| `GET /api/v1/users` | usuários e permissões | ADMIN |

## Respostas de exemplo

`GET /api/v1/dashboard/summary`

```json
{
  "technicians": 42,
  "averageProduction": "120.50",
  "totalProduction": "10845.00",
  "evolution": {
    "previousMonth": "2026-06",
    "previousPercent": 42.86,
    "currentMonth": "2026-07",
    "currentPercent": 37.50,
    "differencePercentagePoints": -5.36
  }
}
```

`GET /api/v1/dashboard/monthly`:

```json
{
  "series": [
    {"month":"2026-06","technicians":7,"goalsMet":3,"rate":42.86},
    {"month":"2026-07","technicians":8,"goalsMet":3,"rate":37.50}
  ]
}
```

**Observação:** dados acima são **fixtures ilustrativas para teste**, não estatísticas da empresa.

## Zod e limites

- Validar enums de mês/ano, IDs UUID, tamanho de busca (`<= 120` caracteres), paginação máxima e ordenação em allowlist.
- Se pedido de operação não pertence ao usuário, rejeitar (`403`) ou aplicar interseção e logar tentativa; **nunca ampliar permissões**.
- CSV com `Content-Disposition: attachment; filename=...`, `text/csv; charset=utf-8`, streaming se necessário, CSV injection protegida e tamanho máximo controlado.
- Login/logout seguem Supabase SSR e callback de autenticação; não criar endpoint próprio que manipule senha.
- Cache por usuário/escopo; evitar respostas compartilhadas em CDN sem política segura.
