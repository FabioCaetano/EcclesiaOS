# 0083 - Relatorios Agregados De Formularios

## Contexto

Formularios ja possuíam respostas, filtros e exportacao CSV. O proximo ganho era permitir leitura gerencial dentro da propria tela, sem depender de planilhas externas para entender volume e qualidade das respostas.

## Decisao

Implementar relatorios agregados no frontend, usando os dados ja retornados por `/forms` e `/form-responses`.

## Consequencias

- A entrega nao exige nova tabela nem migration.
- A API permanece inalterada nesta fase.
- Os relatorios respeitam o filtro visivel aplicado pelo usuario.
- Futuramente, se o volume crescer, estes agregados podem migrar para endpoints dedicados.
