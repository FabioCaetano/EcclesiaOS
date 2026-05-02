# Fase 13: Testes Automatizados

## Objetivo

Criar a primeira camada de testes automatizados para estabilizar comportamentos principais da API.

## Escopo

- Script raiz `npm run test`.
- Script de teste no workspace da API.
- Testes com `node:test` nativo.
- Arquivo temporario de dados via `ECCLESIAOS_DATA_FILE`.
- Cobertura inicial de:
  - criacao de dados padrao;
  - pessoas;
  - escalas;
  - financeiro.

## Fora De Escopo

- Testes E2E.
- Testes visuais.
- Playwright.
- Vitest.
- Cobertura completa.
- Testes do frontend.

## Criterios De Aceite

- Os testes nao alteram `apps/api/data/dev-db.json`.
- `npm run test` executa a suite da API.
- Os testes validam normalizacao e operacoes basicas dos repositorios.

## Verificacao

- `npm.cmd run test`: concluido com 4 testes passando.

Neste ambiente, `node --test` exigiu execucao elevada porque o sandbox bloqueou criacao de processo filho com `EPERM`.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos aprofundar os testes com endpoints HTTP ou seguir para filtros/relatorios financeiros?
