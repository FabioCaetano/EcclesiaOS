# Estrutura Do Projeto

Esta nota descreve a organizacao atual do EcclesiaOS para consulta rapida no Obsidian.

## Raiz

```text
EcclesiaOS/
  apps/
    api/
    web/
  packages/
    shared/
  docs/
  docker-compose.yml
  package.json
  tsconfig.base.json
```

## Apps

### `apps/api`

API propria do EcclesiaOS em Node.js + TypeScript.

Responsabilidades atuais:

- autenticacao local;
- health check;
- cadastro da igreja;
- pessoas;
- grupos e ministerios;
- presenca e consolidacao automatica de check-ins;
- agenda/eventos;
- inscricoes publicas, ingressos e check-in de participantes;
- check-in de eventos e ministerio infantil;
- ambientes e reservas;
- auditoria;
- usuarios e permissoes iniciais;
- escalas e confirmacoes;
- notificacoes internas de escala;
- financeiro;
- persistencia em JSON ou PostgreSQL/Prisma.

Pastas principais:

```text
apps/api/
  prisma/
    schema.prisma
    migrations/
  src/
    data/
    scripts/
    auth.ts
    server.ts
    index.ts
    *.test.ts
  data/
    dev-db.json
```

Arquivos importantes:

- `src/server.ts`: rotas HTTP e regras de permissao.
- `src/auth.ts`: login, tokens e senha local de desenvolvimento.
- `src/data/dataStore.ts`: provider JSON.
- `src/data/prismaStore.ts`: provider Prisma.
- `src/scripts/resetDevData.ts`: seed/reset de desenvolvimento.
- `src/scripts/verifyPrisma.ts`: verificacao de leitura via Prisma.
- `prisma/schema.prisma`: modelo relacional.

### `apps/web`

Frontend em React + Vite + TypeScript.

Responsabilidades atuais:

- login/logout;
- layout autenticado;
- navegacao principal;
- Inicio operacional com KPIs, proximos eventos e area de YouTube;
- telas de igreja, pessoas, grupos, agenda, check-in, ambientes, calendario, escalas, financeiro, usuarios e auditoria;
- Check-in separado internamente em Eventos, Kids e Administracao kids;
- Agenda com inscricoes, ingressos e locais sugeridos por Ambientes;
- filtros e resumos client-side;
- smoke tests autenticados com Playwright.

Pastas principais:

```text
apps/web/
  src/
    api.ts
    AppLayout.tsx
    *Page.tsx
  tests/
    authenticated-smoke.spec.ts
  playwright.config.ts
```

## Pacotes

### `packages/shared`

Contratos compartilhados entre API e frontend.

Responsabilidades atuais:

- tipos de usuario e autenticacao;
- tipos de igreja, pessoas, grupos, presenca, agenda/eventos, inscricoes, check-in, ambientes, calendario, escalas, auditoria, usuarios e financeiro;
- inputs usados por API e web.

Arquivo principal:

```text
packages/shared/src/index.ts
```

## Documentacao

### `docs`

Base de conhecimento do projeto em Markdown, pensada para Obsidian.

Notas principais:

- [[index|Indice Geral]]
- [[product-vision|Visao Do Produto]]
- [[architecture|Arquitetura Atual]]
- [[project-status|Status Do Projeto]]
- [[roadmap|Roadmap Faseado]]
- [[decision-log|Registro De Decisoes]]
- [[development|Desenvolvimento Local]]
- [[next-steps|Proximos Passos]]
- [[questions|Backlog De Perguntas]]

Subpastas:

```text
docs/
  decisions/
  phases/
```

Cada fase concluida deve ter uma nota em `docs/phases`. Cada decisao relevante deve ter uma nota em `docs/decisions` e uma entrada em [[decision-log|Registro De Decisoes]].

## Persistencia

O projeto possui dois providers:

- PostgreSQL/Prisma: banco real validado localmente com Docker e usado no ambiente manual.
- JSON local: mantido para testes automatizados e fallback.

Variavel principal:

```text
ECCLESIAOS_DATA_PROVIDER=json|prisma
```

## Testes

Suites atuais:

- API: `node:test` no workspace `@ecclesiaos/api`.
- Frontend: Playwright no workspace `@ecclesiaos/web`.
- TypeScript: typecheck por workspaces.
- Build: build de API e web.
