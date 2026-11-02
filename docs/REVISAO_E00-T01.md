# E00-T01 — Revisão inicial da base e dos formatos

Data: 2026-10-31. Status: parcial; confirmação da origem pendente.

## Evidências locais

- Foram lidos os 19 arquivos Markdown presentes na raiz, incluindo AGENTS.md, roteiro, backlog, regras, arquitetura, segurança, modelo, contratos, migração, testes e setup.
- A documentação está na raiz, embora seus links apontem para `docs/`. Os originais foram preservados.
- As cópias `REGRAS_NEGOCIO (1).md` e `CONTRATOS_API (1).md` têm SHA-256 idêntico aos respectivos arquivos sem sufixo.
- Não estão presentes `docs/etapas/00-descoberta.md`, `docs/DECISOES.md`, `.env.example`, referências do legado ou uma amostra anonimizada da base atual.
- Não existe aplicação nem package.json. README.md e COMECE_AQUI.md condicionam a criação do Next.js à validação da Etapa 00.

## Contrato documentado, ainda sem confirmação da origem

A migração descreve uma origem histórica Base44.xlsx com oito colunas: Mês, Controlador, Supervisor, Técnico, Status, Contrato, Produção e Operação. META BATIDA teria sido acrescentada posteriormente no Google Sheets. Isso é informação da documentação, não inspeção de uma base disponível.

- Competência exige ano e mês explícitos; não assumir ano corrente.
- META BATIDA admite true, false e null. O dicionário proposto está em REGRAS_NEGOCIO.md; valores desconhecidos exigem rejeição ou quarentena.
- Linhas de produção devem ser preservadas. Deduplicação de meta considera o técnico uma vez por mês; divergências precisam continuar visíveis.
- Evolução é a taxa mais recente menos a anterior, em pontos percentuais, sem arredondamento intermediário. Performance Mensal e Evolução ignoram somente o filtro Mês.

## Informações necessárias para concluir E00-T01

1. Origem atual (Excel, CSV ou Google Sheets) e cabeçalhos atuais, sem dados pessoais nem links privados.
2. Ano(s) das competências e como identificar o ano de cada linha caso a origem contenha apenas o mês.
3. Valores distintos efetivamente utilizados em META BATIDA, incluindo ocorrência de vazios e seu significado.
4. Significado e formato de Produção: quantidade ou valor monetário; separadores decimal e de milhar utilizados.
5. Existência de identificador estável de técnico e de registro de origem, sem fornecer os identificadores reais.
6. Disponibilização do roteiro original da Etapa 00 para conferir os critérios de aceite completos.

## Pontos encontrados para revisão posterior

- A frase “quatro casas para intermediários” em REGRAS_NEGOCIO.md precisa ser esclarecida: AGENTS.md proíbe arredondamento intermediário. Nenhuma fórmula foi implementada ou alterada nesta revisão.
- Aprovação das regras de contagem e escopo pertence à E00-T02; perfis e infraestrutura, à E00-T03; fixtures, à E00-T04.

## Validação desta entrega

Revisão documental e comparação de hashes das cópias concluídas. Lint, TypeScript, testes e build não são aplicáveis: não há package.json nem código executável. Nenhuma tarefa do backlog foi marcada como concluída; os critérios completos da etapa e a confirmação da base continuam pendentes.
