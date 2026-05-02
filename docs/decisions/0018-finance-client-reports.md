# Decisao 0018: Relatorios Financeiros No Frontend

## Status

Aceita para a Fase 17.

## Contexto

O modulo financeiro ja possui lancamentos manuais de receitas e despesas. A proxima necessidade e melhorar a leitura administrativa sem criar complexidade prematura na API.

## Decisao

Criar filtros, resumos e recibo inicial no frontend, calculados a partir dos lancamentos ja carregados.

## Consequencias

- Nao ha endpoint novo nesta fase.
- A tela Financeiro passa a apoiar leitura por periodo, tipo, fundo e categoria.
- Recibo inicial e apenas uma visualizacao estruturada do lancamento selecionado.
- Exportacao e geracao formal de PDF ficam para fase futura.

## Nao Objetivos

- Nao criar pagamento online.
- Nao criar conciliacao bancaria.
- Nao criar contabilidade completa.
- Nao criar recibo fiscal.
