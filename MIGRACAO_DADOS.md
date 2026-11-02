# Migração da base legado para Supabase

## Situação atual

- Dashboard legado: Google Apps Script lê planilha Google Sheets (aba previamente configurada `Página1`).
- Base de referência entregue na conversa: `Base44.xlsx`. Em fase inicial havia 8 colunas: **Mês, Controlador, Supervisor, Técnico, Status, Contrato, Produção, Operação**; a coluna **META BATIDA** foi acrescentada depois no Google Sheets.
- A planilha original pode ter evoluído desde o Excel inicial. **Validar dados e colunas atuais** antes de desenvolver parsing definitivo.
- **Não distribuir o Excel com dados de pessoas dentro do repositório.** Armazenar cópia apenas em local restrito de homologação.

## Estratégia recomendada

1. **Nova fonte principal:** Supabase Postgres. O dashboard lê sempre o banco, não executa consultas Google Apps Script.
2. **Carga inicial administrada:** upload de Excel ou CSV → validação → prévia → correção de erros → importação confirmada → registro de lote.
3. **Botão atualizar para usuários:** reexecuta consultas do Supabase (não reimporta automaticamente a planilha).
4. **Integração com Google Sheets opcional (Etapa 09):** apenas admin dispara `Sincronizar origem`, ou cron com conta de serviço; jamais front-end chama Google Sheets com credenciais.

## Mapeamento de colunas

| Origem | Destino | Regra |
|---|---|---|
| `Mês` | `referenceMonth` | converter usando ano definido, sempre `AAAA-MM-01` |
| `Controlador` | `controller` | texto |
| `Supervisor` | `supervisorId` | vincular ou criar dimensão com revisão de ambiguidade |
| `Técnico` | `technicianId` | idem, preservar nome de exibição |
| `Status` | `status` | texto original |
| `Contrato` | `contract` | texto, preservar zeros iniciais |
| `Produção` | `production` | converter `1.234,50` → Decimal(1234.50); jamais `parseFloat` diretamente |
| `Operação` | `operationId` | normalizar nome e criar dimensão |
| `META BATIDA` | `goalMet` | tri-state true/false/null, conforme dicionário |
| `nº de linha / ID de origem` | `sourceRowKey` | chave estável por fonte para importações repetidas |

## Validações antes de confirmar

- Cabeçalhos presentes (META BATIDA pode ser obrigatório para gráficos no MVP).
- Ano/competência informado e coerente, sem mistura silenciosa de exercícios.
- Registros com nomes faltantes, operação não mapeada, duplicidade ambígua ou produção inválida devem aparecer na prévia.
- Confirmar codificação de META BATIDA e se houve alteração de responsável entre competências.
- Prévia: total de linhas, válidas, inválidas, duplicadas, sem meta, valores negativos, valor total de produção.
- Confirmação apenas por ADMIN com resumo auditado.

## Idempotência

- Importação de mesma base repetida não duplica linhas: usar identidade de origem (`sourceKind`, `sourceRowKey`) e estratégia de substituição controlada por competência + origem.
- Se origem não possuir ID estável de linha, preferir **substituição atômica de snapshot por competência** (com revisão do administrador), em vez de usar nome como identificador da linha.
- Criar `ImportBatch` com checksum, status `PENDING/VALIDATED/APPLIED/FAILED`, usuário, contagens e erros agregados.
- Transação `commit` com rollback em falha; relatórios para comparar contagem/total antes e depois.

## Integração Google Sheets — decisão posterior

Se necessária: habilitar Google Sheets API em projeto Google Cloud, criar conta de serviço com privilégio mínimo, compartilhar somente planilha necessária à conta de serviço, guardar credencial criptografada no ambiente da Vercel e ler intervalos configurados server-side. Planejar mudanças de linhas, rate limits, revisões, logs, erros, concorrência e agendamento. O endpoint administrativo de sync deve ser autenticado e protegido de disparos simultâneos.

Cron Vercel **não é obrigatório para o MVP**. Se ativado, proteger com `CRON_SECRET` e observar frequência/limites do plano contratado.
