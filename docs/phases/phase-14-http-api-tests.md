# Fase 14: Testes HTTP Da API

## Objetivo

Validar endpoints reais da API sem depender de teste manual ou servidor externo.

## Escopo

- Exportar `createEcclesiaServer()`.
- Manter inicializacao normal da API quando `server.ts` e executado diretamente.
- Criar suite HTTP com `node:test`.
- Subir a API em porta dinamica durante os testes.
- Validar:
  - `GET /health`;
  - `POST /auth/login`;
  - `GET /auth/me`;
  - bloqueio de listagens sem token;
  - listagens autenticadas para membro;
  - bloqueio de criacao por membro;
  - criacao por admin em Pessoas;
  - criacao por admin em Financeiro.

## Fora De Escopo

- Testes do frontend.
- Playwright.
- Cobertura total de todos os endpoints.
- Testes de performance.

## Criterios De Aceite

- `npm run test` roda testes de repositorios e HTTP.
- A suite HTTP usa arquivo temporario e nao altera `dev-db.json`.
- A API continua iniciando normalmente por `npm run dev:api` e `npm run start --workspace @ecclesiaos/api`.

## Verificacao

- `npm.cmd run test`: concluido com 8 testes passando.

Neste ambiente, `node --test` exigiu execucao elevada porque o sandbox bloqueou criacao de processo filho com `EPERM`.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos aprofundar Financeiro com filtros/relatorios ou iniciar Banco Real com PostgreSQL/Prisma?
