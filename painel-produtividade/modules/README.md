# Módulos do monólito

Cada módulo concentra um domínio do produto. Criar camadas conforme surgir implementação concreta:

- `domain/`: regras e tipos puros, sem React, Next.js, Prisma ou Supabase.
- `application/`: casos de uso e contratos necessários para executá-los.
- `infrastructure/`: persistência e integrações, acessadas somente no servidor.
- `presentation/`: composição da interface do domínio; Server Components por padrão.

Não criar classes, repositórios, interfaces ou arquivos index vazios para preencher a estrutura. Os READMEs reservam os limites dos módulos ainda não implementados. Um módulo deve consumir contratos públicos de outro, sem acessar sua infraestrutura privada.

| Módulo | Responsabilidade |
| --- | --- |
| `auth` | Identidade, sessão e autorização |
| `productivity` | Métricas, filtros e apresentação de produtividade |
| `imports` | Ingestão, validação, qualidade e lotes |
| `users` | Perfis, ativação e atribuição de operações |
| `audit` | Registro de eventos e alterações |

`app/` orquestra rotas e entradas. `components/ui/` contém primitivas shadcn/ui; `components/demo/` contém a galeria genérica local. `lib/` concentra utilitários e, futuramente, conexões compartilhadas. Consultas e regras de negócio pertencem aos módulos.

Estado atual: somente a apresentação local de produtividade está implementada. Nenhuma autorização, métrica ou integração é simulada por estas pastas.
