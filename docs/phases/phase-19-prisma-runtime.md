# Fase 19: Estabilizar Banco Real

## Objetivo

Validar o PostgreSQL/Prisma em runtime e deixar o caminho operacional claro.

## Escopo

- Regenerar Prisma Client apos alteracoes recentes de schema.
- Adicionar script raiz:

```powershell
npm run db:verify
```

- Adicionar script no workspace da API:

```powershell
npm run db:verify --workspace @ecclesiaos/api
```

- Criar `apps/api/src/scripts/verifyPrisma.ts`.
- Fazer `db:verify` rodar a versao compilada com `node`, sem depender de `tsx`.
- Subir PostgreSQL local via Docker Compose.
- Aplicar migrations.
- Popular seed no provider Prisma.
- Validar leitura via Prisma.
- Validar login e endpoint financeiro com API compilada em modo Prisma.

## Como Validar Com Docker Ativo

1. Abrir Docker Desktop.
2. Subir o banco:

```powershell
docker compose up -d postgres
```

3. Aplicar migrations:

```powershell
npm run db:migrate
```

4. Popular seed no banco real:

```powershell
$env:ECCLESIAOS_DATA_PROVIDER='prisma'
$env:DATABASE_URL='postgresql://ecclesiaos:ecclesiaos@localhost:5432/ecclesiaos?schema=public'
npm run reset-dev-data
```

5. Verificar leitura via Prisma:

```powershell
$env:ECCLESIAOS_DATA_PROVIDER='prisma'
$env:DATABASE_URL='postgresql://ecclesiaos:ecclesiaos@localhost:5432/ecclesiaos?schema=public'
npm run db:verify
```

## Fora De Escopo

- Iniciar Docker Desktop automaticamente.
- Configurar banco remoto.
- Remover modo JSON.
- Criar migrations adicionais alem das existentes.

## Verificacao

- `npm.cmd run db:generate`: concluido.
- `docker compose up -d postgres`: concluido.
- `npm.cmd run db:migrate`: concluido.
- `npm.cmd run reset-dev-data` com `ECCLESIAOS_DATA_PROVIDER=prisma`: concluido.
- `npm.cmd run typecheck`: concluido.
- `npm.cmd run build --workspace @ecclesiaos/api`: concluido.
- `npm.cmd run db:verify`: concluido.
- Login admin e `GET /financial-transactions` validados contra API compilada em modo Prisma.

Resultado do `db:verify`:

```text
Prisma provider verified.
Church: Igreja Ecclesia
Users: 3
People: 2
Groups: 2
Attendance: 2
Serving plans: 1
Financial transactions: 2
```

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos iniciar um novo modulo funcional, aprofundar permissoes, ou adicionar auditoria?
