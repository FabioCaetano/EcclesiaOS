# Fase 15: Banco Real Com PostgreSQL E Prisma

## Objetivo

Preparar o EcclesiaOS para usar PostgreSQL/Prisma no lugar do `dev-db.json`.

## Escopo

- Instalar `prisma` e `@prisma/client`.
- Criar `apps/api/prisma/schema.prisma`.
- Criar migration inicial PostgreSQL.
- Criar `docker-compose.yml` para Postgres local.
- Criar `.env.sample` com `DATABASE_URL` e `ECCLESIAOS_DATA_PROVIDER`.
- Adicionar scripts:
  - `npm run db:generate`;
  - `npm run db:migrate`;
  - `npm run db:push`.
- Adicionar camada Prisma compativel com o `DataFile` atual.
- Permitir alternar persistencia com `ECCLESIAOS_DATA_PROVIDER=prisma`.
- Atualizar `reset-dev-data` para popular JSON ou Prisma conforme o provider.

## Fora De Escopo

- Remover o modo JSON.
- Normalizar todos os relacionamentos em tabelas relacionais.
- Configurar banco de producao.
- Criar migrations futuras.
- Implementar auditoria.

## Como Usar PostgreSQL Local

1. Copiar `.env.sample` para `.env`.
2. Alterar:

```text
ECCLESIAOS_DATA_PROVIDER=prisma
DATABASE_URL=postgresql://ecclesiaos:ecclesiaos@localhost:5432/ecclesiaos?schema=public
```

3. Subir Postgres:

```powershell
docker compose up -d postgres
```

4. Aplicar migration:

```powershell
npm run db:migrate
```

5. Popular dados semente:

```powershell
npm run reset-dev-data
```

6. Rodar API:

```powershell
npm run dev:api
```

## Criterios De Aceite

- Prisma Client e gerado.
- Typecheck continua passando.
- Testes existentes continuam passando no modo JSON.
- A API consegue usar Prisma quando `ECCLESIAOS_DATA_PROVIDER=prisma` e `DATABASE_URL` apontam para um Postgres migrado.

## Verificacao

- `npm.cmd run db:generate --workspace @ecclesiaos/api`: concluido.
- `npm.cmd run typecheck`: concluido.
- `npm.cmd run test`: concluido.
- `npm.cmd run build`: concluido.

Validacao Docker/PostgreSQL local ficou pendente porque o Docker Desktop nao estava com o daemon Linux ativo no ambiente:

```text
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine
```

## Proxima Pergunta

Depois desta fase, seguindo a ordem definida, a proxima decisao sera:

> Queremos aprofundar Escalas com confirmacao de voluntarios e notificacoes?
