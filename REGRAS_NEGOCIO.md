# Regras de negócio — contrato que a migração precisa respeitar

## Dicionário dos campos legados

| Origem Excel/Google Sheets | Conceito | Exibição |
|---|---|---|
| Mês | competência mensal (texto legado Jan–Dez) | Mês |
| Controlador | responsável/controle | manter para importação; não exibir na tabela principal |
| Supervisor | responsável pela equipe | Supervisor |
| Técnico | colaborador/técnico | Técnico |
| Status | situação do registro | manter para importação; não exibir na tabela principal |
| Contrato | identificador do contrato | Contrato |
| Produção | valor numérico da produção | 2 decimais, pt-BR |
| Operação | área/operação | filtro e escopo de acesso |
| META BATIDA | indicação de alcance da meta | Sim / Não / — |

**Ano:** não havia campo de ano no arquivo inicial. O novo banco **exige `referenceMonth` (primeiro dia do mês, AAAA-MM-01)**. Na importação, se não vier ano, administrador deve atribuir explicitamente. Não assumir ano corrente.

## Normalização de META BATIDA

- **true**: `SIM`, `S`, `TRUE`, `VERDADEIRO`, `1`, `YES`, `Y`, `OK`, `ATINGIU`, `ATINGIDO`, `BATIDA`, `META BATIDA` (insensível a caixa e acentos).
- **false**: `NÃO`, `NAO`, `N`, `FALSE`, `FALSO`, `0`, `NO`, `NAO ATINGIU`, `NAO BATIDA`.
- **null**: células vazias. Valores desconhecidos devem ser rejeitados na importação ou ficar em quarentena; não converter desconhecidos silenciosamente em `false`.
- Se houver **múltiplas linhas do mesmo técnico no mesmo mês**, qualquer `true` indica que o técnico bateu a meta naquele mês; caso contrário false se houver marcação conhecida. Em caso de apenas nulos, marcar `indeterminado`.
- Confirmar com responsável de negócio se `NÃO` e `SIM` são os códigos efetivos no Sheets antes do primeiro import.

## Unidade de contagem

**Performance Mensal:** unidade é um técnico distinto **por mês**. MVP mantém compatibilidade com nome normalizado; depois usar ID estável de técnico para evitar homônimos. Revisar se um técnico atuar em operações/supervisões diferentes no mesmo mês, para evitar contagens inconsistentes.

**Performance Mensal Supervisão:** unidade é a combinação **Supervisor × Técnico × Mês**. Somar conquistas/denominadores de todas as competências filtradas sem contar uma mesma combinação mais de uma vez.

**Duplicidade de linhas:** linhas de produção são preservadas para a tabela; somente o cálculo da meta deduplica a unidade mensal de técnico.

## 1. Card Técnicos

`distinct(técnico)` nos registros que respeitam **Mês, Operação, Supervisor**. Valor inteiro. Quando possível, usar ID estável; o legado usa nomes.

## 2. Card Média de produção

**Paridade com legado:** `soma(produção das linhas filtradas) ÷ número de linhas filtradas`, formatado 2 decimais. **Não** confundir com média por técnico. Evolução futura de regra só com aprovação.

## 3. Card Produção total

Soma da coluna Produção nos registros filtrados; 2 casas decimais, locale pt-BR. Verificar se a coluna contém quantidades (não moeda) antes de escolher símbolo.

## 4. Performance Mensal

Em cada mês da base, após aplicar **Operação e Supervisor** (não aplicar **Mês**):

`taxa_mês = (técnicos distintos que bateram meta no mês ÷ técnicos distintos no mês) × 100`.

- Mostrar colunas azuis com contorno preto; sem grades, sem eixo percentual lateral, sem legenda; percentual no topo (2 decimais); linha temporal conectando os meses.
- **Linha de tendência no legado**: uma linha ligando os pontos mensais; **não** calcular regressão estatística sem nova aprovação.
- Se houver dado ausente, exibir cobertura/aviso. Na paridade inicial, denominador inclui técnicos com meta indefinida, como no legado; registrar quantidade de indefinidos. **Pode ser necessário rever essa regra antes do lançamento**, pois desconhecido não significa meta não batida.

## 5. Card Evolução

Com as mesmas regras de filtro de Performance Mensal, comparar dois meses consecutivos mais recentes **com dados aplicáveis** (referências cronológicas reais). O filtro **Mês não interfere**.

`evolução = taxa_último_mês − taxa_penúltimo_mês`.

O resultado é **diferença em pontos percentuais**, exibida como `%` por convenção da interface antiga. Nunca calcular `(atual − anterior)/anterior × 100`.

**Exemplo obrigatório de teste:** Junho = 42,86%; Julho = 37,50%; exibição = **−5,36%** (ou descrição técnica −5,36 p.p.).

Cor: verde se positivo, vermelho se negativo, neutro se zero/sem base comparável. Exibir meses e taxas usados. Com menos de dois meses elegíveis, `—`.

## 6. Performance Mensal Supervisão

Taxa para cada supervisor após aplicar **Mês, Operação e Supervisor**: `soma(técnicos-mês com meta batida) ÷ soma(técnicos-mês válidos) × 100`. Gráfico de colunas verticais azul #16a8e6, borda preta, sem grid, percentual acima, 2 decimais. Ordenar maior para menor e desempatar alfabeticamente.

## 7. Filtros

- **Mês:** multisseleção, sem seleção = todos os meses.
- **Operação:** multisseleção, sem seleção = todas as operações permitidas ao usuário.
- **Supervisor:** multisseleção; opções devem pertencer à(s) operação(ões) selecionada(s) **e ao escopo autorizado**.
- Ao trocar Operação, descartar escolhas de Supervisor que deixaram de ser válidas.
- Filtros operam em conjunto com lógica **AND** entre campos e **OR** dentro do conjunto selecionado em cada campo.
- Botão pequeno limpar filtros; botão pequeno exportar CSV ao lado.
- Restrição por papel/operação vale **mesmo que usuário altere parâmetros na URL**.

## 8. Detalhamento

Colunas visíveis: `Mês | Supervisor | Técnico | Contrato | Produção | Meta Batida`.

- Busca textual, ordenação asc/desc por coluna, paginação, rótulos em pt-BR.
- Mês ordenado cronologicamente com ano; produção ordenada numericamente, não como texto.
- CSV: **mesmas seis colunas**, respeita filtros, busca e ordenação, **todas as páginas**, UTF-8 com BOM e separador `;` para compatibilidade Excel pt-BR.
- Evitar fórmula em planilhas ao exportar: proteger strings de texto que iniciam com `=`, `+`, `-`, `@` (CSV injection), sem alterar a semântica do campo de produção numérica.

## 9. Botões e aparência

- Sincronizar/atualizar: ícone pequeno, atualiza consultas; dados na aplicação vêm do Supabase.
- Tema escuro **inicial**, claro disponível; preferência pode ser lembrada no browser.
- Logo Servlog à esquerda, títulos dos filtros em caixa de título (Mês, Operação, Supervisor), layout responsivo.

## Critérios de qualidade dos cálculos

1. Quatro casas para intermediários; **arredondar apenas para exibição**, 2 casas.
2. Zero no denominador → resultado `null`/não disponível, nunca `NaN` ou `Infinity`.
3. Separar contagem de técnicos com flag nula e emitir aviso no relatório de qualidade.
4. Meses de anos distintos são unidades distintas; gráfico usa mês/ano corretamente.
5. Mesmos filtros na API e UI devem produzir exatamente as mesmas taxas.
