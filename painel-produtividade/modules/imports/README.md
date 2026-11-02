# Importações

Responsável por ingestão, validação, qualidade, prévia e aplicação de lotes. Implementação prevista na Etapa 04.

`domain/data-entry.ts` compartilha validação Zod, competência, decimais e prévia entre formulário e CSV/XLSX. `infrastructure/read-entry-file.ts` lê arquivos localmente, com limites e importação sob demanda do leitor Excel. `presentation/data-entry.tsx` compõe controles shadcn/ui.

`/admin/dados` exige ADMIN no servidor; `/demo/dados` só existe em desenvolvimento para testar com dados fictícios sem login real. Conferência exclusivamente em memória do navegador, sem upload, gravação, dados persistidos ou criação automática de dimensões. Preview não autoriza escrita. A implementação futura precisa repetir validação no servidor, exigir `productivity:insert`, conferir operações permitidas e vínculos por ID, revisão de homônimos, transação/idempotência e auditoria. Importação aplicada continua pendente (E04-T04).
