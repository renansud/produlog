# E10-T04 — Performance e experiência responsiva

Data: 2026-11-01. Demonstração local com 15 linhas fictícias, Next.js em desenvolvimento, Chromium desktop e emulação Pixel 7. Sem rede/CPU limitadas artificialmente, banco/login real ou deploy.

## Método

Novo teste e2e/local-performance.spec.ts: três navegações completas por projeto e três pesquisas aplicadas; cinco requisições por endpoint para summary, tabela com dez linhas e CSV. Salva local-performance.json no diretório de resultados e anexa ao relatório Playwright. Coleta:

- Tempo observado pelo executor entre goto e UI pronta (botão de tema hidratado, dez linhas e quatro barras dos gráficos).
- TTFB da navegação, DOMContentLoaded e transferSize do documento via Navigation Timing; transferSize não soma scripts, estilos ou imagens.
- Tempo entre clique Pesquisar e resultado de duas linhas com estado ocupado encerrado. Inclui automação, servidor, transporte local e renderização; não equivale a INP.
- Tempo das chamadas de API até ler o corpo e tamanho em bytes sem compressão do corpo recebido. Não é tempo isolado de SQL ou cálculo.

As amostras são sequenciais, reutilizam browser/cache/servidor e não representam partida fria do processo. Não são p95, Core Web Vitals de produção, Lighthouse ou teste de carga. Não foi criado limiar arbitrário de aprovação por milissegundos: os testes exigem comportamento correto, resposta 200, cache privado, quantidade paginada e ausência de erro JavaScript/transbordamento. Os tempos são diagnóstico reproduzível.

Comando do recorte de navegador:

```powershell
npm.cmd run test:e2e -- e2e/local-performance.spec.ts e2e/dashboard-accessibility.spec.ts e2e/chart-consistency.spec.ts e2e/productivity-details.spec.ts --trace off
```

## Experiência responsiva

Reexecução das verificações existentes nos dois temas, 320/768/1280 px e fonte ampliada: filtros/dialogs contidos na viewport, cards, foco/teclado, rolagem própria da tabela, tooltips contidos nos painéis, rótulos e controles da tabela sem corte. Os testes de detalhamento também cobrem skeleton/transição, histórico, pesquisa e preservação de indicadores. As capturas são evidência gerada, sem comparação automática com baseline de pixels ou declaração de auditoria completa de acessibilidade.

## Resultados

Lint, npx tsc --noEmit e build aprovados. Vitest: 348 testes em 20 arquivos aprovados. HTTP de produção: 20 testes aprovados. Playwright: 48 cenários aprovados (24 desktop + 24 mobile), sem falhas, ignorados ou instáveis. Total da seleção: 416 testes aprovados. A conclusão do navegador foi conferida no report.json embutido em playwright-report/index.html e em test-results/.last-run.json (passed), pois a sessão de execução já não estava disponível após a retomada da conversa. Não houve nova execução desnecessária dos testes aprovados.

Resumo das amostras, em milissegundos, arredondados para exibição:

| Medição | Desktop 1280×720 | Mobile emulado 412×839 |
| --- | --- | --- |
| UI pronta: mediana de três navegações | 608 | 597 |
| UI pronta: mínimo–máximo observado | 530–1.027 | 579–994 |
| TTFB do documento: mediana | 132 | 145 |
| DOMContentLoaded: mediana | 178 | 166 |
| Pesquisa aplicada: mediana de três interações | 228 | 212 |
| Pesquisa aplicada: mínimo–máximo | 216–280 | 185–214 |
| Summary: mediana de cinco chamadas | 18,0 | 45,8 |
| Tabela com dez linhas: mediana de cinco chamadas | 24,4 | 15,8 |
| CSV: mediana de cinco chamadas | 25,4 | 16,5 |

Corpos de resposta em ambos os projetos: summary 2.233 bytes, tabela 1.567 bytes, CSV 1.102 bytes. As chamadas de API usam o cliente HTTP do Playwright, sem emular latência móvel; as diferenças entre projetos não demonstram diferença entre dispositivos. Navegações iniciais de cada grupo foram mais lentas que as seguintes; não houve controle de partida fria ou isolamento estatístico.

Os JSONs completos ficam em test-results/**/local-performance.json, anexados ao relatório HTML. São artefatos locais ignorados pelo Git, sobrescritos em próximas execuções; esta tabela preserva a referência observada. Avisos NO_COLOR/FORCE_COLOR do ambiente não causaram falhas. CI remoto não executado. Não foi necessário corrigir código do produto. Os cenários funcionais/responsivos passaram, mas não foi definido nem comprovado um orçamento de desempenho para produção.

## Arquivos e limites

Alterados: painel-produtividade/e2e/local-performance.spec.ts, painel-produtividade/README.md, docs/CHECKLIST_PARIDADE.md e este relatório. Nenhum código de produto, dependência, critério de cálculo ou arquitetura alterado; não há nova decisão de negócio para DECISOES.md.

O dashboard não é acessível no build de produção; medir sua UI requer a demo em desenvolvimento, sem remover essa proteção. Os testes HTTP cobrem a fronteira de produção, não uma versão pública do dashboard. O adaptador sintético pagina em memória e não demonstra escalabilidade de SQL. Permanecem pendentes: volumes reais, índices/EXPLAIN, pool de conexões, latência Supabase, concorrência, consumo máximo de memória, dispositivos físicos, navegadores WebKit/Firefox, redes móveis e Core Web Vitals da versão autenticada em homologação. Nenhuma otimização especulativa foi aplicada.

docs/etapas/10-qualidade.md continua ausente; BACKLOG.md sem marcação formal. Os resultados locais não estabelecem SLA nem prontidão de produção.

Próximo passo recomendado: E10-T05 — checklist de release e migração, mantendo pendências reais explícitas e sem executar publicação.
