# Prompts prontos para usar com ChatGPT/Codex no VS Code

Os prompts funcionam melhor após abrir a pasta do projeto no VS Code, instalar a extensão Codex e colocar o arquivo `AGENTS.md` na raiz. **Execute uma tarefa por vez.**

## P-01 — primeiro contato

```text
Você é o desenvolvedor responsável pelo Dashboard de Produtividade Servlog.
Leia integralmente AGENTS.md, README.md, docs/ROADMAP.md, docs/REGRAS_NEGOCIO.md,
docs/ARQUITETURA.md e docs/DECISOES.md. Não implemente código ainda.
Resuma a arquitetura em 10 linhas, os riscos que precisam de decisão e o próximo ID de tarefa.
Confirme que não vai substituir as regras de meta/evolução por fórmulas diferentes.
```

## P-02 — implementar uma tarefa isolada

```text
Execute SOMENTE a tarefa [ID] descrita em docs/BACKLOG.md e no arquivo
correspondente de docs/etapas/. Siga AGENTS.md e as decisões registradas.
1. Leia o código existente e indique os arquivos que pretende alterar.
2. Implemente a menor solução completa que cumpra os critérios de aceite.
3. Adicione ou atualize testes relevantes.
4. Execute lint, typecheck, testes e build disponíveis.
5. Informe arquivos alterados, resultados, riscos e próximos passos.
6. Atualize a checklist apenas se todos os critérios foram atendidos.
Não implemente tarefas posteriores nem faça deploy em produção.
```

## P-03 — revisão de código

```text
Faça code review das alterações da tarefa [ID] sob as óticas de:
segurança (RBAC, vazamento entre operações, segredos),
correção das métricas (META BATIDA, deduplicação, evolução em p.p.),
complexidade arquitetural, performance, tratamento de erros e acessibilidade.
Liste problemas por severidade e arquivo/linha, depois correções sugeridas.
Não altere código até eu aprovar.
```

## P-04 — teste de paridade com Apps Script

```text
Compare o novo módulo de produtividade com docs/REGRAS_NEGOCIO.md e
referencias/legado/Index.html. Crie/execute fixtures com:
Jun: 3/7 = 42,86%; Jul: 3/8 = 37,50%; Evolução = -5,36 p.p.
Valide também que filtro Mês NÃO afeta Performance Mensal nem Evolução;
Operação e Supervisor afetam ambos. Corrija divergências só após descrever a causa.
```

## P-05 — testar importação

```text
Revise a importação Excel/CSV e identifique riscos de duplicar linhas,
confundir mês com ano, colidir nomes de técnicos, parsear produção com
vírgula incorretamente e interpretar META BATIDA errada.
Crie testes e mostre preview de erros. Não use dados reais em commits.
```

## P-06 — preparar produção

```text
Leia docs/DEPLOYMENT.md e docs/SEGURANCA.md. Execute auditoria de pré-deploy:
perfis, cookies, autenticação por rota, Prisma server-only, Vercel env vars,
migrações seguras, CSV e backup. Gere checklist de pendências; não publique
nem aplique migração em produção sem aprovação explícita.
```

## P-07 — corrigir erro sem alterar escopo

```text
Erro encontrado: [COLE A MENSAGEM].
Reproduza, explique a causa-raiz, implemente correção mínima,
adicione teste de regressão e execute a validação da tarefa.
Não mude arquitetura nem regras de negócio para mascarar o problema.
```

## P-08 — documentação após entrega

```text
Atualize o status da tarefa [ID] em docs/BACKLOG.md, documente mudanças de
contrato em docs/CONTRATOS_API.md e decisões em docs/DECISOES.md.
Inclua comandos de execução e procedimentos para verificar a entrega localmente.
```

## Dica operacional

Se o agente tentar fazer muitas coisas ao mesmo tempo, interrompa e peça: **“Execute apenas E##-T##. Não antecipe a etapa seguinte.”**
