# Decisao 0014: Testes Nativos Com Node Test

## Status

Aceita para a Fase 13.

## Contexto

O EcclesiaOS ja possui varios dominios implementados. Antes de adicionar novas funcionalidades, precisamos de uma primeira camada de verificacao automatizada sem aumentar a complexidade de dependencias.

## Decisao

Usar inicialmente o `node:test` nativo para testes da API.

## Consequencias

- Nao ha nova dependencia de teste nesta fase.
- Os testes rodam contra codigo compilado.
- Repositorios podem ser testados com arquivo de dados temporario.
- Testes de UI/E2E ficam para fase posterior.

## Nao Objetivos

- Nao adicionar Vitest nesta fase.
- Nao adicionar Playwright nesta fase.
- Nao buscar cobertura total.
- Nao testar visualmente o frontend ainda.
