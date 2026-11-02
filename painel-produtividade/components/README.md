# Componentes compartilhados

- `ui/`: primitivas shadcn/ui, sem regras de produtividade ou consultas.
- `demo/`: galeria interativa genérica utilizada no ambiente local.

Composições específicas de um domínio ficam em `modules/<domínio>/presentation/`. Widgets puramente visuais reutilizáveis podem ser extraídos para `components/dashboard/` quando existir uso concreto. Não importar Prisma ou consultas de infraestrutura nos componentes compartilhados.
