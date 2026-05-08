# 0081 - Filtros locais de respostas de formularios

## Contexto

Com respostas e exportacao CSV implementadas, era necessario facilitar a consulta das respostas antes da exportacao.

## Decisao

Aplicar filtros no frontend sobre as respostas ja carregadas do formulario selecionado.

## Motivos

- Entrega rapida e sem alterar API.
- O CSV exporta exatamente o recorte visivel.
- Mantem simplicidade enquanto o volume de respostas ainda nao exige paginacao no backend.

## Consequencias

- Em volumes grandes, a API devera receber filtros e paginacao.
