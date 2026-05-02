# Fase 18: Testes Do Frontend

## Objetivo

Criar smoke tests da interface autenticada para proteger login e navegacao principal.

## Escopo

- Instalar `@playwright/test` no workspace web.
- Criar `apps/web/playwright.config.ts`.
- Criar `apps/web/tests/authenticated-smoke.spec.ts`.
- Adicionar script raiz:

```powershell
npm run test:web
```

- Subir API em `4100` durante os testes.
- Subir frontend em `5174` durante os testes.
- Usar banco JSON E2E isolado em `apps/api/data/e2e-db.json`.
- Validar:
  - login admin;
  - navegacao por Inicio, Igreja, Pessoas, Grupos, Presenca, Escalas e Financeiro;
  - filtros, resumos e recibo inicial na tela Financeiro.

## Ajuste Tecnico Descoberto

Durante os smoke tests, carregamentos paralelos do frontend revelaram uma corrida no `dataStore` JSON. A escrita local foi ajustada para:

- usar arquivo temporario com nome unico;
- regravar dados no `readData` somente quando a normalizacao realmente muda o arquivo.

## Fora De Escopo

- Testes visuais pixel-perfect.
- Cobertura completa de formularios.
- Testes cross-browser amplos.
- Testes de performance.

## Criterios De Aceite

- `npm run test:web` executa smoke tests com API e frontend isolados.
- Login admin funciona no navegador.
- As telas principais carregam.
- A tela Financeiro mostra filtros, resumos e recibo.

## Verificacao

- `npm.cmd run typecheck`: concluido.
- `npm.cmd run test:web`: concluido com 2 testes passando.

## Proxima Pergunta

Depois desta fase, a ordem oficial inicial foi concluida. A proxima decisao sera:

> Queremos estabilizar o Banco Real com Docker/PostgreSQL ativo ou iniciar um novo modulo?
