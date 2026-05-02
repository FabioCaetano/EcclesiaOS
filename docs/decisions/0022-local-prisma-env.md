# Decisao 0022: Ambiente Local Prisma Como Padrao De Teste

## Status

Aceita.

## Contexto

O PostgreSQL/Prisma ja estava implementado, mas o uso local ainda dependia de variaveis configuradas manualmente no terminal. Isso fazia a API rodar em modo inesperado e dificultava testar os usuarios semente pela interface.

## Decisao

Criar `.env` local apontando para Prisma/PostgreSQL e carregar esse arquivo automaticamente na API e nos scripts.

Tambem manter os testes automatizados em modo JSON isolado, definindo `ECCLESIAOS_DATA_PROVIDER=json` dentro dos testes.

## Consequencias

- `npm run dev:api` passa a usar PostgreSQL/Prisma no ambiente local configurado.
- `npm run reset-dev-data` popula o PostgreSQL com os usuarios admin, lider e membro.
- `npm run db:verify` valida dados e credenciais semente.
- Testes continuam rapidos e isolados sem depender do banco real.

## Nao Objetivos

- Nao remover o provider JSON.
- Nao configurar banco remoto.
- Nao implementar cadastro real de usuarios nesta fase.
