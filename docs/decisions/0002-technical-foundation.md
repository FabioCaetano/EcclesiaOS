# Decisao 0002: Fundacao Tecnica Inicial

## Status

Aceita para a Fase 1.

## Contexto

O EcclesiaOS precisa comecar com uma base propria, sem depender das APIs B1/ChurchApps. O projeto B1Admin mostrou que React, TypeScript, Vite, modularidade por dominio e testes E2E sao uma boa referencia para um painel administrativo.

## Decisao

Criar o EcclesiaOS como monorepo com:

- `apps/web`: frontend administrativo em React + TypeScript + Vite.
- `apps/api`: API propria em Node.js + TypeScript.
- `packages/shared`: contratos e tipos compartilhados.
- `docs`: fonte de verdade de produto, arquitetura, fases e decisoes.

Para a primeira fundacao, a API tera apenas health check e metadados basicos do sistema. Banco de dados, autenticacao e modelos de dominio entram em fases posteriores.

## Direcao Tecnica Preferida

- Frontend: React + TypeScript + Vite.
- Backend: Node.js + TypeScript.
- Banco futuro: PostgreSQL.
- ORM futuro: Prisma, salvo decisao diferente.
- Testes E2E futuros: Playwright.
- Testes unitarios futuros: Vitest.

## Consequencias

- O projeto fica preparado para crescer por modulos.
- A API ja nasce propria.
- Evitamos complexidade prematura de banco, login e permissoes.
- A Fase 1 pode ser validada rapidamente com uma tela inicial e um endpoint `/health`.
