# Contratos de API (proposta v1)

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
| `GET /api/v1/dashboard/filters` | listas autorizadas de meses/operações/supervisores | VISUALIZADOR |
| `GET /api/v1/dashboard/summary` | técnicos, evolução, média e produção total | VISUALIZADOR |
| `GET /api/v1/dashboard/monthly` | Performance Mensal (ignora `months`) | VISUALIZADOR |
| `GET /api/v1/dashboard/supervisors` | Performance Mensal Supervisão | VISUALIZADOR |
| `GET /api/v1/productivity` | tabela, busca, classificação e paginação | VISUALIZADOR |
| `GET /api/v1/productivity/export` | CSV, todas as linhas visíveis após filtros/busca/ordem | VISUALIZADOR |
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
