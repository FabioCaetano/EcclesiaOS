# Fase 17: Aprofundar Financeiro

## Objetivo

Melhorar a leitura administrativa do financeiro com filtros, resumos e recibo inicial.

## Escopo

- Filtros por:
  - data inicial;
  - data final;
  - tipo;
  - fundo;
  - categoria.
- Indicadores calculados sobre os lancamentos filtrados.
- Resumo por fundo.
- Resumo por categoria.
- Lista de lancamentos respeitando filtros.
- Recibo inicial para o lancamento selecionado.

## Fora De Escopo

- Pagamento online.
- Conciliacao bancaria.
- Contabilidade completa.
- Recibo fiscal.
- PDF/exportacao.
- Permissoes financeiras granulares.

## Criterios De Aceite

- Usuario consegue filtrar lancamentos.
- Cards de receitas, despesas e saldo respeitam filtros.
- Resumos por fundo e categoria respeitam filtros.
- Ao selecionar um lancamento, a tela mostra um recibo estruturado.

## Verificacao

- `npm.cmd run typecheck`: concluido.

Pendencias por limite do ambiente:

- `npm.cmd run test`: pendente porque execucao elevada foi bloqueada pelo limite do ambiente.
- `npm.cmd run build`: pendente se o Vite/esbuild exigir execucao elevada.

## Proxima Pergunta

Depois desta fase, seguindo a ordem definida, a proxima decisao sera:

> Queremos criar smoke tests da interface autenticada?
