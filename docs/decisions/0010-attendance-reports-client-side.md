# Decisao 0010: Relatorios De Presenca No Frontend

## Status

Aceita para a Fase 9.

## Contexto

A presenca basica foi implementada, mas a validacao de build/endpoints ficou pendente por bloqueio de execucao elevada no ambiente. Ainda assim, podemos adicionar uma camada de relatorio simples no frontend, calculada a partir dos registros ja carregados.

## Decisao

Criar relatorios simples de presenca no frontend, sem novos endpoints nesta fase.

## Consequencias

- Evitamos ampliar a API antes de validar completamente a Fase 8.
- O usuario ja consegue extrair informacao util dos registros existentes.
- Relatorios persistidos, exportacao e filtros avancados ficam para depois.

## Nao Objetivos

- Nao criar endpoints de relatorio.
- Nao adicionar graficos.
- Nao exportar CSV/PDF.
- Nao criar filtros avancados.
