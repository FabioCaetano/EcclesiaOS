# Decisao 0016: PostgreSQL Com Prisma

## Status

Aceita para a Fase 15.

## Contexto

O EcclesiaOS iniciou com persistencia em `dev-db.json` para acelerar as primeiras fases. Depois de criar testes de repositorios e endpoints HTTP, o projeto ja tem base suficiente para preparar banco real.

## Decisao

Adotar PostgreSQL como banco relacional e Prisma como ORM.

Nesta fase, a API passa a ter dois modos de persistencia:

- `ECCLESIAOS_DATA_PROVIDER=json`: mantem o arquivo local atual.
- `ECCLESIAOS_DATA_PROVIDER=prisma`: usa PostgreSQL via Prisma.

## Consequencias

- A migracao pode ser feita de forma gradual.
- Os testes existentes continuam rodando no modo JSON isolado.
- O banco real ja possui schema, migration e comandos.
- Em ambiente com Postgres disponivel, `reset-dev-data` popula o banco usando os dados semente.

## Nao Objetivos

- Nao remodelar todas as relacoes em tabelas normalizadas nesta fase.
- Nao criar permissoes granulares.
- Nao remover imediatamente o modo JSON.
- Nao configurar hospedagem de producao.
